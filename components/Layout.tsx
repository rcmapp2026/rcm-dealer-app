import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { UserProfile, AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  cartCount: number;
  user: UserProfile | null;
  notifications: AppNotification[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  translations: any;
}

export const Layout: React.FC<LayoutProps> = React.memo(({ 
  children, activeTab, onTabChange, onLogout, cartCount, user, notifications, isDarkMode, onToggleDarkMode, translations
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-full overflow-hidden bg-white text-black font-sans pt-safe-top">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
        activeTab={activeTab}
        onNavigate={onTabChange}
        onLogout={onLogout}
        user={user}
        cartCount={cartCount}
        translations={translations}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300 h-full relative bg-white">
        
        <Navbar 
          activeTab={activeTab}
          onNavigate={onTabChange}
          onToggleSidebar={handleToggleSidebar}
          user={user}
          notifications={notifications}
          isDarkMode={false}
          onToggleDarkMode={() => {}}
          translations={translations}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative pb-32 bg-white">
           <div className="max-w-5xl mx-auto w-full bg-white">
              {children}
           </div>
        </main>

        <BottomNav activeTab={activeTab} onNavigate={onTabChange} />
        
      </div>
    </div>
  );
});
