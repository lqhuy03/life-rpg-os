import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { supabase } from './config/supabaseClient';
import useGameStore from './store/gameStore';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './features/Dashboard';
import QuestBoard from './features/QuestBoard';
import Shop from './features/Shop';
import Inventory from './features/Inventory'; 
import Profile from './features/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, setUser, loadGameData, isLoading, checkDailyReset } = useGameStore(); // <--- Lấy thêm hàm checkDailyReset

  useEffect(() => {
    const initData = async (session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadGameData(session.user.id);
        checkDailyReset(); // <--- GỌI HÀM Ở ĐÂY
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => initData(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        initData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) return <Auth />;
  
  if (isLoading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-emerald-500 gap-2">
        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" /> Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      <Toaster position="top-center" theme="dark" richColors />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-screen relative">
        <Header />
       <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pb-32 md:pb-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
             {activeTab === 'dashboard' && <Dashboard />}
             {activeTab === 'quests' && <QuestBoard />}
             {activeTab === 'shop' && <Shop />}
             {activeTab === 'inventory' && <Inventory />}
             {activeTab === 'profile' && <Profile />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;