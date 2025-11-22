import React from 'react';
import { LayoutDashboard, ScrollText, ShoppingBag, LogOut } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menu = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'quests', label: 'Nhiệm vụ', icon: ScrollText },
    { id: 'shop', label: 'Cửa hàng', icon: ShoppingBag },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 z-50 md:relative md:w-64 md:h-screen md:border-t-0 md:border-r md:flex md:flex-col">
      <div className="hidden md:flex items-center justify-center h-20 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-emerald-500 tracking-wider">LIFE RPG</h1>
      </div>
      
      <nav className="flex justify-around p-2 md:flex-col md:p-4 md:gap-2 md:flex-1">
        {menu.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl md:flex-row md:gap-3 md:px-4 md:py-3 transition-all ${activeTab === item.id ? 'text-emerald-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`}>
            <item.icon size={24} />
            <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block p-4 border-t border-slate-800">
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-slate-500 hover:text-red-400 w-full px-4 py-2">
            <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;