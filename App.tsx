import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { Layout } from './components/Layout';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { UserProfile, LedgerSummary, Order, Offer, Product, Category, AppNotification, Company } from './types';
import { supabaseService } from './services/supabaseService';
import { WifiOff, Loader2, Bell, X, Info, Gift, Sparkles, ChevronRight, Building2, Box } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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

const getUniqueColor = (text: string) => {
  const colors = [
    'text-blue-600', 'text-rose-600', 'text-amber-600', 'text-emerald-600',
    'text-indigo-600', 'text-orange-600', 'text-cyan-600', 'text-violet-600',
    'text-fuchsia-600', 'text-teal-600', 'text-pink-600', 'text-sky-600',
    'text-lime-600', 'text-red-600', 'text-purple-600', 'text-yellow-600',
    'text-slate-700', 'text-zinc-800', 'text-orange-700', 'text-cyan-800'
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const OurPartnersView: React.FC<{ companies: Company[], products: Product[], onSelect: (name: string) => void }> = ({ companies, products, onSelect }) => {
  const getCount = (compName: string) => products.filter(p => p.company === compName).length;

  return (
    <div className="bg-white min-h-screen p-6 pb-40 space-y-8">
        <div className="flex flex-col gap-1">
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] italic">Official Network</p>
          <h1 className="text-3xl font-[1000] text-black tracking-tight uppercase italic leading-tight">Our <span className="text-orange-500">Partners</span></h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {companies.map((comp, idx) => (
                <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(comp.name)}
                    className="p-4 bg-white rounded-[28px] border border-slate-100 flex flex-col items-center gap-3 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.1)] active:bg-slate-50 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                        <span className={`text-2xl font-black italic ${getUniqueColor(comp.name)}`}>{comp.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="text-center w-full">
                        <h3 className={`text-[11px] font-black uppercase italic tracking-tight truncate ${getUniqueColor(comp.name)}`}>{comp.name}</h3>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">{getCount(comp.name)} ASSETS</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);
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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const [currentPopup, setCurrentPopup] = useState<{ type: 'announcement' | 'offer', data: any } | null>(null);
  const [pendingPopup, setPendingPopup] = useState<{ type: 'announcement' | 'offer', data: any } | null>(null);

  const [ledger, setLedger] = useState<LedgerSummary>({ due_amount: 0, total_debit: 0, total_credit: 0 });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);

  // Use refs to access latest state in the back button listener
  const activeTabRef = useRef(activeTab);
  const tabHistoryRef = useRef(tabHistory);
  const isProductDetailOpenRef = useRef(isProductDetailOpen);
  const isOrderDetailOpenRef = useRef(isOrderDetailOpen);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { tabHistoryRef.current = tabHistory; }, [tabHistory]);
  useEffect(() => { isProductDetailOpenRef.current = isProductDetailOpen; }, [isProductDetailOpen]);
  useEffect(() => { isOrderDetailOpenRef.current = isOrderDetailOpen; }, [isOrderDetailOpen]);

  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (isProductDetailOpenRef.current) {
        setIsProductDetailOpen(false);
        return;
      }
      if (isOrderDetailOpenRef.current) {
        setIsOrderDetailOpen(false);
        return;
      }

      if (tabHistoryRef.current.length > 1) {
        const newHistory = [...tabHistoryRef.current];
        newHistory.pop(); // Remove current tab
        const prevTab = newHistory[newHistory.length - 1];
        setTabHistory(newHistory);
        setActiveTab(prevTab);
      } else if (activeTabRef.current !== 'home') {
        setActiveTab('home');
        setTabHistory(['home']);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backListener.then(h => h.remove());
    };
  }, []);

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
      
      const lastSeenNotifId = localStorage.getItem('last_seen_announcement');
      const lastSeenOfferId = localStorage.getItem('last_seen_offer');

      if (notifsData && notifsData.length > 0 && notifsData[0].id !== lastSeenNotifId) {
          setPendingPopup({ type: 'announcement', data: notifsData[0] });
      } else if (offersData && offersData.length > 0 && offersData[0].id !== lastSeenOfferId) {
          setPendingPopup({ type: 'offer', data: offersData[0] });
      }

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
      if (payload.new) {
        setNotification(payload.new as AppNotification);
      }
      supabaseService.fetchNotifications().then(notifs => setNotifications(notifs || []));
    });

    return () => {
      cartSub.unsubscribe();
      orderSub.unsubscribe();
      notifSub.unsubscribe();
    };
  }, [user]);

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
    if (tab === activeTabRef.current) return;

    if (tab === 'products') {
        if (typeof filterValue === 'string') {
            setSelectedCompany(filterValue);
            setHardwareCategory(null);
            setSelectedProductId(null);
        } else if (typeof filterValue === 'object') {
            if (filterValue.productId) {
                setSelectedProductId(filterValue.productId);
                setSelectedCompany(null);
                setHardwareCategory(null);
            } else if (filterValue.category) {
                setHardwareCategory(filterValue.category);
                setSelectedCompany(null);
                setSelectedProductId(null);
            }
        } else {
            setSelectedCompany(null);
            setHardwareCategory(null);
            setSelectedProductId(null);
        }
    } else if (tab === 'rcm_products') {
        setSelectedCompany(null);
        if (typeof filterValue === 'object' && filterValue.category) {
            setRcmCategory(filterValue.category);
        } else {
            setRcmCategory(null);
        }
    }

    setActiveTab(tab);
    setTabHistory(prev => [...prev, tab]);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleClosePopup = () => {
    if (currentPopup) {
        const key = currentPopup.type === 'announcement' ? 'last_seen_announcement' : 'last_seen_offer';
        localStorage.setItem(key, currentPopup.data.id);
    }
    setCurrentPopup(null);
  };

  useEffect(() => {
    if (!showWelcome && pendingPopup) {
        setCurrentPopup(pendingPopup);
        setPendingPopup(null);
    }
  }, [showWelcome, pendingPopup]);

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
      case 'products': return <ProductView products={products} user={user} onAddToCart={handleAddToCart} onNavigate={handleNavigation} onRefresh={() => fetchData(user.id)} onOpenCart={() => setActiveTab('cart')} selectedProductId={selectedProductId} selectedCategory={hardwareCategory} onSelectCategory={setHardwareCategory} selectedCompany={selectedCompany} onSelectCompany={setSelectedCompany} onDetailToggle={setIsProductDetailOpen} />;
      case 'rcm_products': return <ProductView products={products} user={user} isRcmMode={true} onAddToCart={handleAddToCart} onNavigate={handleNavigation} onRefresh={() => fetchData(user.id)} onOpenCart={() => setActiveTab('cart')} selectedCategory={rcmCategory} onSelectCategory={setRcmCategory} selectedCompany={null} onSelectCompany={() => {}} onDetailToggle={setIsProductDetailOpen} />;
      case 'orders': return <OrderManagement orders={orders} onSync={() => fetchData(user.id)} onDetailToggle={setIsOrderDetailOpen} />;
      case 'profile': return <ProfileView user={user} onUpdate={setUser} />;
      case 'ledger': return <LedgerView user={user} summary={ledger} isOnline={true} onRefresh={() => fetchData(user.id)} companyProfile={companySettings} />;
      case 'offers': return <OffersView offers={offers} onRefresh={() => fetchData(user.id)} />;
      case 'support': return <SupportView user={user} />;
      case 'notifications': return <NotificationView notifications={notifications} onMarkRead={() => {}} onRefresh={() => fetchData(user.id)} />;
      case 'cart': return <CartView user={user} cartItemsProps={cartItems} products={products} onOrderPlaced={() => { fetchData(user.id); setActiveTab('orders'); }} isOnline={true} onRefresh={() => fetchData(user.id)} companyProfile={companySettings} onClose={() => setActiveTab('home')} />;
      case 'partners':
        const comps = Array.from(new Set(products.filter(p => !p.is_rcm && p.company?.toUpperCase() !== 'RCM' && p.company?.toUpperCase() !== 'GENUINE RCM').map(p => p.company))).filter(Boolean).map((name, idx) => ({ id: String(idx), name: name! }));
        return <OurPartnersView companies={comps} products={products} onSelect={(name) => handleNavigation('products', name)} />;
      default: return <HomeView user={user} ledger={ledger} offers={offers} orders={orders} products={products} categories={categories} onNavigate={handleNavigation} companyProfile={companySettings} onSync={() => fetchData(user.id)} />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay user={user} onClose={() => setShowWelcome(false)} />}
        {currentPopup && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50, opacity: 0 }}
                    className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl relative overflow-hidden"
                >
                    <div className={`h-32 w-full relative overflow-hidden flex items-center justify-center
                        ${currentPopup.type === 'offer' ? 'bg-gradient-to-br from-rose-500 to-orange-500' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
                        <div className="absolute inset-0 opacity-20"><svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" /></svg></div>
                        <div className="relative h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                            {currentPopup.type === 'offer' ? <Gift size={32} strokeWidth={2.5} /> : <Bell size={32} strokeWidth={2.5} />}
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                ${currentPopup.type === 'offer' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                {currentPopup.type === 'offer' ? 'Special Offer' : 'Announcement'}
                            </span>
                            <div className="h-1 flex-1 bg-slate-50 rounded-full" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase leading-tight text-slate-900 mb-3">{currentPopup.data.title}</h2>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{currentPopup.type === 'offer' ? currentPopup.data.description : (currentPopup.data.message || currentPopup.data.body)}</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { handleNavigation(currentPopup.type === 'offer' ? 'offers' : 'notifications'); handleClosePopup(); }}
                                className={`w-full h-14 rounded-2xl font-black uppercase italic tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all
                                    ${currentPopup.type === 'offer' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-blue-600 text-white shadow-blue-600/30'}`}>
                                {currentPopup.type === 'offer' ? 'Grab Offer Now' : 'Read Full Update'}<ChevronRight size={18} strokeWidth={3} />
                            </button>
                            <button onClick={handleClosePopup} className="w-full h-12 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[9px] active:scale-95 transition-all">Close Popup</button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      {notification && <PushNotificationOverlay title={notification.title} body={notification.message || notification.body} onClose={handleCloseNotification} />}
      <Layout activeTab={activeTab} onTabChange={handleNavigation} onLogout={() => { supabaseService.signOut(); setIsLoggedIn(false); setUser(null); }} cartCount={cartItems.length} user={user} notifications={notifications} isDarkMode={false} onToggleDarkMode={() => {}} translations={{}} products={products}>
        <div className="h-full bg-white">
          <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>}>
            {renderMainContent()}
          </Suspense>
        </div>
      </Layout>
    </>
  );
};

const PushNotificationOverlay = ({ title, body, onClose }: any) => {
    return (
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-[100] bg-white rounded-2xl shadow-2xl p-4 border-2 border-slate-100 flex items-start gap-4">
            <div className="h-10 w-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shrink-0"><Bell size={20} /></div>
            <div className="flex-1"><p className="font-black uppercase italic text-sm leading-tight">{title}</p><p className="text-[10px] font-bold text-slate-500 mt-0.5 line-clamp-2">{body}</p></div>
            <button onClick={onClose} className="p-1 text-slate-400"><X size={18} /></button>
        </motion.div>
    );
};

export default App;
