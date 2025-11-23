import React from 'react';
import { LayoutDashboard, ScrollText, ShoppingBag, Package, ShieldAlert, Settings, LineChart } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const Sidebar = ({ activeTab, setActiveTab, isAdmin }) => {
  const menu = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'quests', label: 'Nhiệm vụ', icon: ScrollText },
    { id: 'stats', label: 'Thống kê', icon: LineChart },
    { id: 'shop', label: 'Cửa hàng', icon: ShoppingBag },
    { id: 'inventory', label: 'Túi đồ', icon: Package },
  ];

  if (isAdmin) {
      menu.push({ id: 'admin', label: 'Quản Trị', icon: ShieldAlert });
  }

  // Settings luôn nằm cuối cùng
  menu.push({ id: 'settings', label: 'Cài đặt', icon: Settings });

  return (
    <div className="fixed bottom-0 left-0 w-full glass-panel border-t-0 border-r md:relative md:w-64 md:h-screen md:flex md:flex-col z-50">
      {/* Logo */}
      <div className="hidden md:flex items-center justify-center h-24 border-b border-slate-700/30">
        <h1 className="text-3xl font-black tracking-widest text-gradient drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          LIFE RPG
        </h1>
      </div>
      
      {/* Menu Navigation */}
      <nav className="flex justify-around p-2 md:flex-col md:p-4 md:gap-3 md:flex-1 md:mt-4 overflow-x-auto no-scrollbar">
        {menu.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdminItem = item.id === 'admin';
          
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl md:flex-row md:gap-4 md:px-4 md:py-3 transition-all duration-300 group relative overflow-hidden min-w-[60px] md:min-w-0
                ${isActive 
                  ? (isAdminItem ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30')
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              {isActive && <div className={`absolute left-0 top-0 w-1 h-full ${isAdminItem ? 'bg-red-500' : 'bg-emerald-500'}`} />}
              <Icon size={24} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-[10px] md:text-sm font-bold tracking-wide">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ĐÃ XÓA PHẦN FOOTER CHỨA NÚT ĐĂNG XUẤT Ở ĐÂY */}
      
    </div>
  );
};

export default Sidebar;