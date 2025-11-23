import React, { useState, useEffect } from 'react';
import { Settings, Volume2, VolumeX, Zap, ZapOff, LogOut, Trash2, Info, Moon, Sun } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'sonner';

const SettingsPage = () => {
  // Lấy cấu hình từ LocalStorage (nếu có)
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('rpg_sound') !== 'false'
  );
  const [lowPerformance, setLowPerformance] = useState(
    localStorage.getItem('rpg_low_perf') === 'true'
  );

  // Lưu cấu hình khi thay đổi
  useEffect(() => {
    localStorage.setItem('rpg_sound', soundEnabled);
    localStorage.setItem('rpg_low_perf', lowPerformance);
    
    if (soundEnabled) toast.success("Đã bật âm thanh");
  }, [soundEnabled, lowPerformance]);

  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.reload();
  };

  const handleClearCache = () => {
      if(window.confirm("Bạn có chắc muốn xóa bộ nhớ đệm? Hành động này giúp sửa lỗi hiển thị nhưng sẽ tải lại trang.")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <div className="animate-fade-in pb-20 max-w-2xl mx-auto">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
        <Settings className="text-slate-400" size={32}/> Cài Đặt Hệ Thống
      </h2>

      <div className="space-y-6">
        
        {/* 1. TRẢI NGHIỆM (UX) */}
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Zap size={20}/> Trải Nghiệm
            </h3>
            
            {/* Sound Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                    </div>
                    <div>
                        <p className="font-bold text-white">Âm thanh hiệu ứng</p>
                        <p className="text-xs text-slate-400">Tiếng click, level up, hoàn thành quest.</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>

            {/* Performance Toggle */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${lowPerformance ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                        {lowPerformance ? <ZapOff size={20}/> : <Zap size={20}/>}
                    </div>
                    <div>
                        <p className="font-bold text-white">Chế độ tiết kiệm Pin</p>
                        <p className="text-xs text-slate-400">Giảm hiệu ứng mờ và chuyển động để máy chạy mượt hơn.</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={lowPerformance} onChange={() => setLowPerformance(!lowPerformance)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
            </div>
        </div>

        {/* 2. HỆ THỐNG (SYSTEM) */}
        <div className="glass-panel p-6 rounded-2xl border-red-500/20">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <Info size={20}/> Hệ Thống
            </h3>

            <div className="space-y-3">
                <button onClick={handleClearCache} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-red-500/50 transition-all group">
                    <span className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                        <Trash2 size={18} /> Xóa bộ nhớ đệm (Fix lỗi)
                    </span>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-500">Cache</span>
                </button>

                <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 hover:text-red-300">
                    <span className="flex items-center gap-3 font-bold">
                        <LogOut size={18} /> Đăng Xuất Tài Khoản
                    </span>
                </button>
            </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-600 font-mono">
            <p>Life RPG OS v2.7.1 (Stable)</p>
            <p>UID: {localStorage.getItem('sb-ijhckhcxdprmsdwyrhgg-auth-token') ? 'Connected' : 'Unknown'}</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;