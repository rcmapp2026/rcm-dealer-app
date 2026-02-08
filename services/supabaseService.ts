import { supabase } from './supabaseClient';
import { UserProfile, Product, Order, LedgerEntry, AppNotification, Offer } from '../types';

// Optimized In-memory cache for Free Plan egress reduction
const _cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = {
  products: 10 * 60 * 1000, // 10 minutes
  settings: 30 * 60 * 1000, // 30 minutes
  offers: 15 * 60 * 1000, // 15 minutes
  notifications: 5 * 60 * 1000, // 5 minutes
};

const getCached = (key: string, ttl: number) => {
  const entry = _cache[key];
  if (entry && Date.now() - entry.timestamp < ttl) return entry.data;
  return null;
};

const setCached = (key: string, data: any) => {
  _cache[key] = { data, timestamp: Date.now() };
};

const ensureStringId = (id: any): string => {
  if (id === null || id === undefined) return '';
  if (typeof id === 'object' && id.id) return String(id.id);
  const s = String(id).trim();
  if (s === '[object Object]' || s === 'undefined' || s === 'null' || s === '') return '';
  return s;
};

export const supabaseService = {
  supabase,

  subscribeToTable(table: string, id: string | null, callback: (payload: any) => void) {
    try {
      const cleanId = ensureStringId(id);
      if (!cleanId && ['cart_items', 'orders', 'ledger'].includes(table)) return { unsubscribe: () => {} };

      const channelName = `rt-${table}-${cleanId || 'global'}`;
      let filter = undefined;
      if (cleanId && ['cart_items', 'orders', 'ledger'].includes(table)) filter = `dealer_id=eq.${cleanId}`;

      return supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload) => {
          if (table === 'dealer_inventory' || table === 'product_variants') {
             Object.keys(_cache).forEach(k => k.startsWith('products-') && delete _cache[k]);
          }
          if (table === 'app_settings') delete _cache['settings'];
          if (table === 'offers') delete _cache['offers'];
          if (table === 'broadcasts') Object.keys(_cache).forEach(k => k.startsWith('notifs-') && delete _cache[k]);
          callback(payload);
        })
        .subscribe();
    } catch (e) { return { unsubscribe: () => {} }; }
  },

  async fetchLedger(dealerId: string) {
    try {
      const cleanId = ensureStringId(dealerId);
      if (!cleanId) return [];
      const { data } = await supabase.from('ledger')
        .select('*')
        .eq('dealer_id', cleanId)
        .order('date', { ascending: false })
        .limit(100);
      return (data || []) as LedgerEntry[];
    } catch { return []; }
  },

  async fetchCompanySettings() {
    const cached = getCached('settings', CACHE_TTL.settings);
    if (cached) return cached;

    try {
      const { data } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
      if (data && data.upi_id) data.upi_id = data.upi_id.replace(/\s/g, '').trim();
      setCached('settings', data);
      return data;
    } catch (err) { return null; }
  },

  async signIn(dealerCode: string, mobile: string) {
    const { data, error } = await supabase.from('dealers')
      .select('*')
      .eq('dealer_code', dealerCode.trim().toUpperCase())
      .eq('mobile', mobile.trim())
      .maybeSingle();

    if (error || !data) throw new Error("Invalid Credentials.");
    if (data.status !== 'Active') throw new Error("Account is pending activation.");

    const validId = ensureStringId(data.id);
    if (validId) localStorage.setItem('rcm_dealer_id', validId);
    return data as UserProfile;
  },

  async getDealerProfile() {
    try {
      const id = localStorage.getItem('rcm_dealer_id');
      const cleanId = ensureStringId(id);
      if (!cleanId) return null;
      const { data } = await supabase.from('dealers').select('*').eq('id', cleanId).maybeSingle();
      return data as UserProfile;
    } catch { return null; }
  },

  async fetchCart(id: string) {
    try {
      const cleanId = ensureStringId(id);
      if (!cleanId) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products:product_id (*, companies (*)),
          product_variants:variant_id (*)
        `)
        .eq('dealer_id', cleanId);

      if (error) throw error;
      return data || [];
    } catch (e: any) {
      return [];
    }
  },

  async manageCartItem(dealerId: string, productId: string, variantId: string, delta: number) {
    try {
      const dId = ensureStringId(dealerId);
      const pId = String(productId);
      const vId = String(variantId);
      if (!dId || !pId || !vId) return false;

      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .match({ dealer_id: dId, product_id: pId, variant_id: vId })
        .maybeSingle();

      if (existing) {
        const newQty = (Number(existing.quantity) || 0) + delta;
        if (newQty <= 0) {
          await supabase.from('cart_items').delete().eq('id', existing.id);
        } else {
          await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
        }
      } else if (delta > 0) {
        await supabase.from('cart_items').insert([{
          dealer_id: dId,
          product_id: pId,
          variant_id: vId,
          quantity: delta
        }]);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  async fetchOrders(dealerId: string) {
    try {
      const cleanId = ensureStringId(dealerId);
      if (!cleanId) return [];
      const { data, error } = await supabase.from('orders')
        .select('*, items:order_items(*)')
        .eq('dealer_id', cleanId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    } catch (e: any) { return []; }
  },

  async placeOrder(order: any, user: UserProfile) {
    try {
      const { data: ord, error } = await supabase.from('orders').insert({
        dealer_id: ensureStringId(user.id),
        subtotal: order.subtotal,
        final_total: order.final_total,
        payment_mode: order.payment_mode,
        status: 'Pending'
      }).select('id').single();

      if (error) throw error;

      const items = order.items.map((it: any) => ({
        order_id: ord.id,
        product_id: it.product_id,
        product_name: it.name,
        company_name: it.company,
        size: it.size,
        quantity: it.qty,
        mrp: it.mrp,
        rate: it.price,
        amount: it.qty * it.price,
        unit: it.unit,
        category_name: it.category,
        variant_info: it.variant_name
      }));

      await supabase.from('order_items').insert(items);
      await supabase.from('cart_items').delete().eq('dealer_id', ensureStringId(user.id));
      return { success: true, orderId: ord.id };
    } catch (e: any) { return { success: false, error: e.message }; }
  },

  async fetchNotifications() {
    const id = localStorage.getItem('rcm_dealer_id');
    const currentDealerUuid = ensureStringId(id);
    if (!currentDealerUuid) return [];

    const cacheKey = `notifs-${currentDealerUuid}`;
    const cached = getCached(cacheKey, CACHE_TTL.notifications);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.from('broadcasts')
        .select('*')
        .or(`target_type.eq.all,target_id.eq.${currentDealerUuid}`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const result = (data || []) as AppNotification[];
      setCached(cacheKey, result);
      return result;
    } catch (err: any) { return []; }
  },

  async fetchOffers() {
    const cached = getCached('offers', CACHE_TTL.offers);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.from('offers').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      const result = (data || []) as Offer[];
      setCached('offers', result);
      return result;
    } catch (err: any) { return []; }
  },

  async signOut() {
    localStorage.removeItem('rcm_dealer_id');
    Object.keys(_cache).forEach(key => delete _cache[key]);
  },

  async uploadDealerImage(dealerId: string, file: File) {
    const dId = ensureStringId(dealerId);
    const fileName = `profile-${dId}`;
    await supabase.storage.from('dealers').upload(fileName, file, { upsert: true });
    const { data: urlData } = supabase.storage.from('dealers').getPublicUrl(fileName);
    await supabase.from('dealers').update({ profile_img: urlData.publicUrl }).eq('id', dId);
    return { success: true, url: urlData.publicUrl };
  },

  async uploadDealerChequesImage(file: File) {
    try {
      const fileName = `cheque-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { error } = await supabase.storage.from('cheques_images').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('cheques_images').getPublicUrl(fileName);
      return { success: true, url: urlData.publicUrl };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async registerDealer(formData: any) {
    try {
      const { data, error } = await supabase.from('dealers').insert([{
        owner_name: formData.ownerName,
        shop_name: formData.shopName,
        mobile: formData.mobile,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        cheques_number: formData.cheques_number,
        cheques_img_urls: formData.cheques_img_urls,
        status: 'Pending'
      }]).select('id').single();

      if (error) throw error;
      return { success: true, dealer: data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async fetchActiveProductsWithVariants(categoryAccess?: string[]): Promise<Product[]> {
    const accessArray = Array.isArray(categoryAccess) ? categoryAccess.filter(Boolean).map(String) : [];

    const cacheKey = `products-${[...accessArray].sort().join(',') || 'all'}`;
    const cached = getCached(cacheKey, CACHE_TTL.products);
    if (cached) return cached;

    try {
      let query = supabase.from('dealer_inventory').select('*');
      if (accessArray.length > 0) {
        query = query.in('category_id', accessArray);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map(item => ({
        id: String(item.id || item.product_id),
        product_id: String(item.product_id || item.id),
        name: item.product_name || item.name || "Product",
        image_url: item.image_url,
        product_type: item.product_type === 'RCM' ? 'RCM' : 'Hardware',
        is_rcm: item.product_type === 'RCM' || !!item.is_rcm,
        selling_price: Number(item.starting_price || item.final_price || item.rate || item.selling_price || 0),
        mrp: Number(item.mrp || 0),
        company: item.company_name || item.company || "RCM",
        category: item.category_name || item.category || "General",
        category_id: String(item.category_id || ''),
        variant_name: item.variant_size || item.size || item.variant_name || "Standard",
        sku_code: item.sku || item.sku_code ? String(item.sku || item.sku_code).toUpperCase() : null,
        unit: item.unit || "Pcs"
      }));
      setCached(cacheKey, mapped);
      return mapped;
    } catch (err: any) {
      return [];
    }
  },

  async fetchProductVariants(productId: string): Promise<Product[]> {
    try {
      const { data: baseProduct } = await supabase
        .from('dealer_inventory')
        .select('*')
        .eq('product_id', String(productId))
        .limit(1)
        .single();

      const { data, error } = await supabase.from('product_variants')
        .select('*')
        .eq('product_id', String(productId))
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(item => {
        const sellingPrice = Number(item.final_price || item.selling_price || 0);
        const mrp = Number(item.mrp || 0);
        const discount = mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

        return {
            id: String(item.id),
            product_id: String(item.product_id),
            name: baseProduct?.product_name || baseProduct?.name || "Variant",
            image_url: baseProduct?.image_url || null,
            product_type: baseProduct?.product_type === 'RCM' ? 'RCM' : 'Hardware',
            is_rcm: baseProduct?.product_type === 'RCM' || !!baseProduct?.is_rcm,
            company: baseProduct?.company_name || baseProduct?.company || "RCM",
            category: baseProduct?.category_name || baseProduct?.category || "General",
            category_id: String(baseProduct?.category_id || ''),
            unit: baseProduct?.unit || 'Pcs',
            selling_price: sellingPrice,
            mrp: mrp,
            discount_percent: discount,
            variant_name: item.size || item.variant_name || "Standard",
            sku_code: item.sku || item.sku_code ? String(item.sku || item.sku_code).toUpperCase() : null,
            created_at: item.created_at
        } as any;
      });
    } catch (err: any) {
      return [];
    }
  }
};
