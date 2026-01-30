import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { UserProfile, LedgerSummary, Order, Offer, Product, Category, AppNotification } from './types';
import { supabaseService } from './services/supabaseService';
import { WifiOff, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { App as CapacitorApp } from '@capacitor/app';

const HomeView = lazy(() => import('./components/HomeView').then(m => ({ default: m.HomeView })));
const LoginView = lazy(() => import('./components/LoginView').then(m => ({ default: m.LoginView })));
const ProductView = lazy(() => import('./components/ProductView').then(m => ({ default: m.ProductView })));
const OrderManagement = lazy(() => import('./components/OrderManagement').then(m => ({ default: m.OrderManagement })));
const ProfileView = lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const SupportView = lazy(() => import('./components/SupportView').then(m => ({ default: m.SupportView })));
const LedgerView = lazy(() => import('./components/LedgerView').then(m => ({ default: m.LedgerView })));
const OffersView = lazy(() => import('./components/OffersView').then(m => ({ default: m.OffersView })));
const NotificationView = lazy(() => import('./components/NotificationView').then(m => ({ default: m.NotificationView })));
const CartView = lazy(() => import('./components/CartView').then(m => ({ default: m.CartView })));
const RegistrationForm = lazy(() => import('./components/RegistrationForm').then(m => ({ default: m.RegistrationForm })));
const RegistrationSuccess = lazy(() => import('./components/RegistrationSuccess').then(m => ({ default: m.RegistrationSuccess })));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registeredDealer, setRegisteredDealer] = useState<UserProfile | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [rcmCategory, setRcmCategory] = useState<string | null>(null);
  const [hardwareCategory, setHardwareCategory] = useState<string | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (isProductDetailOpen) {
        setIsProductDetailOpen(false);
        return;
      }
      if (isOrderDetailOpen) {
        setIsOrderDetailOpen(false);
        return;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
      } else {
        CapacitorApp.exitApp();
      }
    });
  }, [activeTab, isProductDetailOpen, isOrderDetailOpen]);

  const fetchData = useCallback(async (userId: string) => {
    if (!navigator.onLine || !userId) return;
    setIsFetchingData(true);
    try {
      const [ordersData, notifsData, offersData, cartData, settingsData, ledgerEntries, profileData] = await Promise.all([
        supabaseService.fetchOrders(userId),
        supabaseService.fetchNotifications(),
        supabaseService.fetchOffers(),
        supabaseService.fetchCart(userId),
        supabaseService.fetchCompanySettings(),
        supabaseService.fetchLedger(userId),
        supabaseService.getDealerProfile()
      ]);

      setOrders(ordersData || []);
      setNotifications(notifsData || []);
      setOffers(offersData || []);
      setCartItems(cartData || []);
      setCompanySettings(settingsData);
      
      if (profileData) {
        setUser(profileData);
        if (profileData.category_access) {
           const prods = await supabaseService.fetchActiveProductsWithVariants(profileData.category_access);
           setProducts(prods || []);
           const uniqueCats = Array.from(new Set((prods || []).map(p => p.category))).filter(Boolean);
           setCategories(uniqueCats.map((name, idx) => ({ id: String(idx), name: name! })));
        }
      }

      const safeLedger = Array.isArray(ledgerEntries) ? ledgerEntries : [];
      const totalDebit = safeLedger.reduce((sum, e) => e.type?.toLowerCase() === 'debit' ? sum + (Number(e.amount) || 0) : sum, 0);
      const totalCredit = safeLedger.reduce((sum, e) => e.type?.toLowerCase() === 'credit' ? sum + (Number(e.amount) || 0) : sum, 0);

      setLedger({
        due_amount: totalDebit - totalCredit,
        total_debit: totalDebit,
        total_credit: totalCredit
      });

    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setIsFetchingData(false);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const profile = await supabaseService.getDealerProfile();
        if (profile) {
          setUser(profile);
          setIsLoggedIn(true);
          await fetchData(profile.id);
          setShowWelcome(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;

    const cartSub = supabaseService.subscribeToTable('cart_items', user.id, payload => {
      supabaseService.fetchCart(user.id).then(cart => setCartItems(cart || []));
    });

    const orderSub = supabaseService.subscribeToTable('orders', user.id, payload => {
      supabaseService.fetchOrders(user.id).then(orders => setOrders(orders || []));
    });

    const notifSub = supabaseService.subscribeToTable('broadcasts', null, payload => {
      supabaseService.fetchNotifications().then(notifs => setNotifications(notifs || []));
    });

    return () => {
      cartSub.unsubscribe();
      orderSub.unsubscribe();
      notifSub.unsubscribe();
    };
  }, [user]);

  const [ledger, setLedger] = useState<LedgerSummary>({ due_amount: 0, total_debit: 0, total_credit: 0 });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const handleAddToCart = async (p: Product, qty: number, variantId?: string, price?: number, company?: string) => {
    if (!user) return;
    const vId = variantId || p.product_id || p.id;
    const success = await supabaseService.manageCartItem(user.id, p.product_id || p.id, vId, qty, company || p.company || 'GENUINE RCM');
    if (success) {
      const updatedCart = await supabaseService.fetchCart(user.id);
      setCartItems(updatedCart || []);
    }
  };

  const handleNavigation = (tab: string, filterValue?: any) => {
    if (tab === 'products' && typeof filterValue === 'object' && filterValue.productId) {
      setSelectedProductId(filterValue.productId);
    }
    setActiveTab(tab);
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-bold">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
           <WifiOff size={40} />
        </div>
        <h1 className="text-2xl font-bold text-black uppercase italic mb-2">No Connection</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Please check your internet</p>
        <button onClick={() => window.location.reload()} className="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase italic">Retry</button>
      </div>
    );
  }

  if (loading) return null;

  if (!isLoggedIn || !user) {
    if (registeredDealer) {
        return <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>}><RegistrationSuccess dealer={registeredDealer} onComplete={() => { setRegisteredDealer(null); setShowRegistration(false); }} /></Suspense>;
    }
    if (showRegistration) {
        return <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>}><RegistrationForm onBack={() => setShowRegistration(false)} onSuccess={(dealer) => setRegisteredDealer(dealer)} /></Suspense>;
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>}>
        <LoginView
          onAuthSuccess={async (userData: any) => {
            if (!userData) return;
            setUser(userData);
            setIsLoggedIn(true);
            await fetchData(userData.id);
            setShowWelcome(true);
          }}
          onOpenRegistration={() => setShowRegistration(true)}
          loading={false}
          setLoading={() => {}}
        />
      </Suspense>
    );
  }

  if (isFetchingData && !user.owner_name) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-blue" size={40} />
        </div>
    );
  }

  const renderMainContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'home': return <HomeView user={user} ledger={ledger} offers={offers} orders={orders} products={products} categories={categories} onNavigate={handleNavigation} companyProfile={companySettings} onSync={() => fetchData(user.id)} />;
      case 'products': return <ProductView products={products} user={user} onAddToCart={handleAddToCart} onNavigate={handleNavigation} onRefresh={() => fetchData(user.id)} onOpenCart={() => setActiveTab('cart')} selectedProductId={selectedProductId} selectedCategory={hardwareCategory} onSelectCategory={setHardwareCategory} onDetailToggle={setIsProductDetailOpen} />;
      case 'rcm_products': return <ProductView products={products} user={user} isRcmMode={true} onAddToCart={handleAddToCart} onNavigate={handleNavigation} onRefresh={() => fetchData(user.id)} onOpenCart={() => setActiveTab('cart')} selectedCategory={rcmCategory} onSelectCategory={setRcmCategory} onDetailToggle={setIsProductDetailOpen} />;
      case 'orders': return <OrderManagement orders={orders} onSync={() => fetchData(user.id)} onDetailToggle={setIsOrderDetailOpen} />;
      case 'profile': return <ProfileView user={user} onUpdate={setUser} />;
      case 'ledger': return <LedgerView user={user} summary={ledger} isOnline={true} onRefresh={() => fetchData(user.id)} companyProfile={companySettings} />;
      case 'offers': return <OffersView offers={offers} onRefresh={() => fetchData(user.id)} />;
      case 'support': return <SupportView user={user} />;
      case 'notifications': return <NotificationView notifications={notifications} onMarkRead={() => {}} onRefresh={() => fetchData(user.id)} />;
      case 'cart': return <CartView user={user} cartItemsProps={cartItems} products={products} onOrderPlaced={() => { fetchData(user.id); setActiveTab('orders'); }} isOnline={true} onRefresh={() => fetchData(user.id)} companyProfile={companySettings} onClose={() => setActiveTab('home')} />;
      default: return <HomeView user={user} ledger={ledger} offers={offers} orders={orders} products={products} categories={categories} onNavigate={handleNavigation} companyProfile={companySettings} onSync={() => fetchData(user.id)} />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay user={user} onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => { supabaseService.signOut(); setIsLoggedIn(false); setUser(null); }}
        cartCount={cartItems.length}
        user={user}
        notifications={notifications}
        isDarkMode={false}
        onToggleDarkMode={() => {}}
        translations={{}}
      >
        <div className="h-full bg-white">
          <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>}>
            {renderMainContent()}
          </Suspense>
        </div>
      </Layout>
    </>
  );
};

export default App;
