
export interface UserProfile {
  id: string;
  dealer_code: string | null;
  shop_name: string;
  owner_name: string;
  address: string;
  city: string; 
  state: string;
  pincode: string;
  mobile: string;
  status: 'Pending' | 'Active' | 'Rejected';
  hardware_visibility: 'All' | 'Selected';
  category_access?: string[]; 
  cheques_number?: string[];
  cheques_img_url?: string[];
  created_at?: string;
  profile_img?: string | null;
  payment_block?: boolean; // Added for restriction logic
}

export interface AppNotification {
  id: string;
  title: string;
  message: string; 
  image_url?: string;
  created_at: string;
  is_priority: boolean;
  sender?: string;
  target_type?: 'all_dealers' | 'single_dealer';
  target_id?: string;
}

export interface Variant {
  gift: string;
  amount: number;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  is_active: boolean;
  variants: Variant[];
  terms?: string[];
}

export interface Product {
  id: string;
  product_id?: string; 
  name: string;
  image_url: string | null;
  product_type: string | null;
  is_rcm: boolean;
  selling_price: number | null; 
  mrp: number | null; 
  discount_percent: number | null; 
  company: string | null;
  category: string | null;
  category_id: string | null; 
  variant_name: string | null;
  sku_code: string | null; 
  unit: string | null; 
}

export interface CartItem {
  id: string;
  dealer_id: string;
  product_id: string;
  variant_id: string; 
  name: string;
  company: string;
  category_name?: string; 
  size: string;
  unit: string;
  qty: number;
  price: number; 
  mrp: number;
  discount: number;
  image: string; 
  is_rcm?: boolean;
}

export interface Order {
  id?: string;
  order_id?: string; 
  order_no?: number; 
  dealer_id: string;
  items: any[];
  subtotal: number; 
  discount: number; 
  transport_charges: number; 
  final_total: number; 
  payment_mode: 'COD' | 'POD' | 'Credit' | 'UPI'; 
  status: 'Pending' | 'Draft' | 'Approved' | 'Shipped' | 'Completed' | 'Cancelled';
  payment_status?: 'UNPAID' | 'PENDING_COD' | 'PENDING_POD' | 'PAID';
  created_at?: string;
}

export interface LedgerEntry {
  id?: string;
  dealer_id: string;
  type: 'credit' | 'debit';
  amount: number;
  note: string;
  narration?: string;
  images?: string[];
  date: string;
}

export interface LedgerSummary {
  total_debit: number;
  total_credit: number;
  due_amount: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

export interface Wallet {
  id: string;
  dealer_id: string;
  balance: number;
  updated_at: string;
}

export interface AddMoneyRequest {
  id: string;
  dealer_id: string;
  amount: number;
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  created_at: string;
  updated_at: string;
  verified_at?: string;
  notes?: string;
  admin_notes?: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  upi_id: string;
  support_number: string;
  address: string;
  email?: string;
  website?: string;
  gst_number?: string;
  updated_at: string;
}

export interface WalletNotification {
  id: string;
  dealer_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  transaction_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface TransactionStatus {
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
  timestamp: string;
}
