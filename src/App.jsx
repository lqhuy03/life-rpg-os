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
import AdminDashboard from './features/AdminDashboard'; 
import SettingsPage from './features/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, setUser, loadGameData, isLoading, character } = useGameStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadGameData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadGameData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) return <Auth />;
  
  if (isLoading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-emerald-500 gap-2">
        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" /> Loading System...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      <Toaster position="top-center" theme="dark" richColors />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={character.role === 'admin'} />
      
      <div className="flex-1 flex flex-col h-screen relative">
        {/* Truyền setActiveTab xuống Header để bấm Avatar chuyển trang */}
        <Header setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pb-32 md:pb-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
             {activeTab === 'dashboard' && <Dashboard />}
             {activeTab === 'quests' && <QuestBoard />}
             {activeTab === 'shop' && <Shop />}
             {activeTab === 'inventory' && <Inventory />}
             {activeTab === 'profile' && <Profile />}
             {/* Chỉ render Admin nếu đúng quyền */}
             {activeTab === 'admin' && character.role === 'admin' && <AdminDashboard />}
             {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;