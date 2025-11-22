import React from 'react';
import { LayoutDashboard, ScrollText, ShoppingBag, LogOut, Package } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { User } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menu = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'quests', label: 'Nhiệm vụ', icon: ScrollText },
    { id: 'shop', label: 'Cửa hàng', icon: ShoppingBag },
    { id: 'inventory', label: 'Túi đồ', icon: Package },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full glass-panel border-t-0 border-r md:relative md:w-64 md:h-screen md:flex md:flex-col z-50">
      {/* Logo Neon */}
      <div className="hidden md:flex items-center justify-center h-24 border-b border-slate-700/30">
        <h1 className="text-3xl font-black tracking-widest text-gradient drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          LIFE RPG
        </h1>
      </div>
      
      <nav className="flex justify-around p-2 md:flex-col md:p-4 md:gap-3 md:flex-1 md:mt-4">
        {menu.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl md:flex-row md:gap-4 md:px-4 md:py-3 transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
              <Icon size={24} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-[10px] md:text-sm font-bold tracking-wide">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="hidden md:block p-6 border-t border-slate-700/30">
        <button onClick={() => supabase.auth.signOut()} className="btn-glass w-full text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10">
            <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;