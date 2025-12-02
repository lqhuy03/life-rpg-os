import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { supabase } from './config/supabaseClient';
import useGameStore from './store/gameStore';

// Components (Các thành phần UI chung)
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/Auth';
import DailyCheckinModal from './components/DailyCheckinModal';
import OnboardingModal from './components/OnboardingModal'; // <--- QUAN TRỌNG: Thêm cái này

// Features (Các màn hình chức năng)
import Dashboard from './features/Dashboard';
import QuestBoard from './features/QuestBoard';
import Shop from './features/Shop';
import Inventory from './features/Inventory'; 
import Profile from './features/Profile';
import SettingsPage from './features/Settings';
import AdminDashboard from './features/AdminDashboard';
import Stats from './features/Stats/Stats';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, setUser, loadGameData, isLoading, checkDailyReset, character } = useGameStore();

  useEffect(() => {
    const initData = async (session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadGameData(session.user.id);
        checkDailyReset(); // Kiểm tra và reset nhiệm vụ ngày mới
      }
    };

    // 1. Lấy session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => initData(session));

    // 2. Lắng nghe thay đổi (Đăng nhập/Đăng xuất)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Nếu chưa đăng nhập -> Hiện trang Auth
  if (!user) return <Auth />;
  
  // Nếu đang tải dữ liệu -> Hiện màn hình Loading
  if (isLoading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-500 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold tracking-widest animate-pulse">LOADING SYSTEM...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      <Toaster position="top-center" theme="dark" richColors />
      
      {/* --- CÁC MODAL HỆ THỐNG --- */}
      <DailyCheckinModal /> {/* Điểm danh hàng ngày */}
      <OnboardingModal />   {/* Khảo sát người mới (Chỉ hiện khi chưa có Tier) */}
      
      {/* --- LAYOUT CHÍNH --- */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={character?.role === 'admin'} />
      
      <div className="flex-1 flex flex-col h-screen relative">
        <Header setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pb-32 md:pb-10 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-fade-in">
             {activeTab === 'dashboard' && <Dashboard />}
             {activeTab === 'quests' && <QuestBoard />}
             {activeTab === 'stats' && <Stats />}
             {activeTab === 'shop' && <Shop />}
             {activeTab === 'inventory' && <Inventory />}
             {activeTab === 'profile' && <Profile />}
             {activeTab === 'settings' && <SettingsPage />}
             
             {/* Admin Route (Chỉ hiện nếu là Admin) */}
             {activeTab === 'admin' && character?.role === 'admin' && <AdminDashboard />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;