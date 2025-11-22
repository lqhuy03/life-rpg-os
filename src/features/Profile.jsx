import React, { useState, useEffect } from 'react';
import { User, Save, BookOpen, Info, Lock, AlertTriangle } from 'lucide-react';
import useGameStore, { getStatInfo } from '../store/gameStore';
import { supabase } from '../config/supabaseClient';
import { toast } from 'sonner';

const Profile = () => {
  const { character, updateProfile } = useGameStore();
  
  // State thông tin nhân vật
  const [name, setName] = useState("");
  const [stats, setStats] = useState({});
  
  // State đổi mật khẩu
  const [newPass, setNewPass] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    if (character) {
        setName(character.name);
        setStats(character.stats || {});
    }
  }, [character]);

  // --- LOGIC VALIDATION ---
  const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
  const MAX_TOTAL_STATS = 450; // Giới hạn tổng điểm (Game Balance)

  const handleSave = () => {
    if (!name.trim()) return toast.error("Tên Hero không được để trống!");
    
    if (totalStats > MAX_TOTAL_STATS) {
        return toast.error(`Tổng chỉ số quá cao (${totalStats}/${MAX_TOTAL_STATS})! Hãy cân bằng lại.`);
    }

    updateProfile(name, stats);
  };

  // --- LOGIC ĐỔI MẬT KHẨU ---
  const handleChangePass = async () => {
      if (newPass.length < 6) return toast.error("Mật khẩu phải trên 6 ký tự");
      
      setLoadingPass(true);
      const { error } = await supabase.auth.updateUser({ password: newPass });
      
      if (error) {
          toast.error(error.message);
      } else {
          toast.success("Đổi mật khẩu thành công!");
          setNewPass("");
      }
      setLoadingPass(false);
  };

  const statConfig = [
    { key: 'health', label: 'Sức Khỏe', color: 'text-rose-400', accent: 'accent-rose-500' },
    { key: 'wisdom', label: 'Trí Tuệ', color: 'text-blue-400', accent: 'accent-blue-500' },
    { key: 'wealth', label: 'Tài Chính', color: 'text-yellow-400', accent: 'accent-yellow-500' },
    { key: 'social', label: 'Xã Hội', color: 'text-pink-400', accent: 'accent-pink-500' },
    { key: 'career', label: 'Sự Nghiệp', color: 'text-orange-400', accent: 'accent-orange-500' },
    { key: 'spirit', label: 'Tinh Thần', color: 'text-purple-400', accent: 'accent-purple-500' },
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-6 animate-fade-in pb-20">
      {/* --- CỘT TRÁI: CÀI ĐẶT --- */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* CARD 1: THÔNG TIN & CHỈ SỐ */}
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <User className="text-emerald-400" /> Cài Đặt Nhân Vật
            </h3>
            
            {/* ADMIN BADGE */}
            {character.role === 'admin' && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-2 rounded-lg text-center font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <AlertTriangle size={14}/> Admin Mode Active
                </div>
            )}

            <div className="mb-6">
                <label className="text-sm font-bold text-slate-400 mb-2 block">Tên Hero</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 font-bold text-lg" />
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white flex items-center gap-2"><Info size={16} className="text-emerald-400"/> Đánh Giá Chỉ Số</h4>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${totalStats > MAX_TOTAL_STATS ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                        Total: {totalStats}/{MAX_TOTAL_STATS}
                    </span>
                </div>
                
                {statConfig.map((stat) => {
                    const val = stats[stat.key] || 0;
                    const info = getStatInfo(val); // Lấy mô tả từ Store

                    return (
                    <div key={stat.key} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-colors">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <span className={`font-bold ${stat.color} text-lg`}>{stat.label}</span>
                                {/* HIỆN MÔ TẢ CHI TIẾT */}
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                    <span className="text-white font-bold px-1.5 py-0.5 bg-slate-700 rounded">{info.label}</span>
                                    <span className="italic opacity-80">{info.desc}</span>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-white">{val}</span>
                        </div>
                        <input type="range" min="0" max="100" value={val}
                            onChange={(e) => setStats({...stats, [stat.key]: parseInt(e.target.value)})}
                            className={`w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer ${stat.accent}`} />
                    </div>
                    )
                })}
            </div>

            <button onClick={handleSave} className="btn-primary w-full mt-8 py-3 text-lg shadow-lg">
                <Save size={20} /> Lưu Hồ Sơ
            </button>
        </div>

        {/* CARD 2: ĐỔI MẬT KHẨU */}
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-500">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="text-red-400" size={20} /> Bảo Mật & Mật Khẩu
            </h3>
            <div className="flex gap-3 flex-col sm:flex-row">
                <input type="password" placeholder="Nhập mật khẩu mới..." 
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-red-500 transition-colors"
                    value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                <button onClick={handleChangePass} disabled={loadingPass} 
                    className="btn-glass text-red-400 border-red-500/30 hover:bg-red-500/10 whitespace-nowrap px-6">
                    {loadingPass ? "Đang đổi..." : "Đổi Mật Khẩu"}
                </button>
            </div>
        </div>
      </div>

      {/* --- CỘT PHẢI: LUẬT CHƠI --- */}
      <div className="lg:col-span-5">
        <div className="glass-panel p-6 rounded-2xl sticky top-6">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
                <BookOpen className="text-yellow-400" /> Hướng Dẫn Đánh Giá
            </h3>
            
            <div className="space-y-4 text-sm text-slate-300 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin">
                <p className="italic text-slate-400 mb-4">
                    "Hãy trung thực với bản thân. Chỉ số là tấm gương phản chiếu nỗ lực của bạn."
                </p>

                <section className="space-y-2">
                    <h4 className="font-bold text-emerald-400 uppercase text-xs tracking-wider">Thang điểm năng lực (Rubric)</h4>
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-3 border-b border-slate-800 flex justify-between">
                            <span className="font-bold text-slate-400">0 - 19</span>
                            <span className="text-white">Khởi đầu / Yếu</span>
                        </div>
                        <div className="p-3 border-b border-slate-800 flex justify-between">
                            <span className="font-bold text-slate-400">20 - 39</span>
                            <span className="text-white">Tập sự / Đang học</span>
                        </div>
                        <div className="p-3 border-b border-slate-800 flex justify-between">
                            <span className="font-bold text-slate-400">40 - 59</span>
                            <span className="text-white">Trung bình / Ổn định</span>
                        </div>
                        <div className="p-3 border-b border-slate-800 flex justify-between">
                            <span className="font-bold text-slate-400">60 - 79</span>
                            <span className="text-emerald-400 font-bold">Khá / Thành thạo</span>
                        </div>
                        <div className="p-3 border-b border-slate-800 flex justify-between">
                            <span className="font-bold text-slate-400">80 - 99</span>
                            <span className="text-yellow-400 font-bold">Giỏi / Chuyên gia</span>
                        </div>
                        <div className="p-3 flex justify-between bg-emerald-500/10">
                            <span className="font-bold text-slate-400">100</span>
                            <span className="text-cyan-400 font-black">THẦN THOẠI</span>
                        </div>
                    </div>
                </section>

                <section className="mt-6 pt-6 border-t border-slate-700/50">
                    <h4 className="font-bold text-cyan-400 mb-2 uppercase text-xs tracking-wider">Quy định Game Balance</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                        <li>Tổng điểm tối đa cho phép: <strong>{MAX_TOTAL_STATS}</strong>.</li>
                        <li>Bạn không thể max 100 hết tất cả chỉ số. Hãy chọn thế mạnh của mình.</li>
                        <li>Cập nhật chỉ số mỗi tuần 1 lần vào Chủ Nhật.</li>
                    </ul>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;