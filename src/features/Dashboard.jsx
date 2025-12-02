import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PolarRadiusAxis } from 'recharts';
import useGameStore from '../store/gameStore';
import { Activity, Dumbbell, Brain, Wallet, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { character, habits } = useGameStore();
  
  // Lấy 3 habit chưa làm hôm nay để nhắc nhở
  const today = new Date().toISOString().split('T')[0];
  const pendingHabits = habits.filter(h => h.last_completed_date !== today).slice(0, 3);

  const stats = [
    { subject: 'Sức Khỏe', A: character.stats.health || 0, fullMark: 10 },
    { subject: 'Tài Chính', A: character.stats.finance || 0, fullMark: 10 },
    { subject: 'Sự Nghiệp', A: character.stats.career || 0, fullMark: 10 },
    { subject: 'Phát Triển', A: character.stats.growth || 0, fullMark: 10 },
    { subject: 'Mối Quan Hệ', A: character.stats.relationship || 0, fullMark: 10 },
    { subject: 'Giải Trí', A: character.stats.fun || 0, fullMark: 10 },
    { subject: 'Môi Trường', A: character.stats.environment || 0, fullMark: 10 },
    { subject: 'Tâm Linh', A: character.stats.spirit || 0, fullMark: 10 },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      
      {/* 1. SECTION: STATUS OVERVIEW */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cột trái: Biểu đồ Bánh Xe */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500" />
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-emerald-400"/> Bánh Xe Cuộc Đời
                </h3>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Thang điểm 10</span>
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar name="Stats" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Cột phải: Nhắc nhở nhanh */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-orange-400"/> Việc Cần Làm Ngay
            </h3>
            
            <div className="flex-1 space-y-3">
                {pendingHabits.length > 0 ? (
                    pendingHabits.map(h => (
                        <div key={h.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                            <span className="text-sm text-slate-300 font-medium truncate">{h.title}</span>
                            <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 uppercase">{h.difficulty}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-500 italic py-10">
                        Đã hoàn thành hết! Tuyệt vời.
                    </div>
                )}
            </div>
            
            {pendingHabits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                    <p className="text-xs text-slate-400 mb-2">Còn {habits.filter(h => h.last_completed_date !== today).length} việc nữa...</p>
                </div>
            )}
        </div>
      </div>

      {/* 2. SECTION: 4 TRỤ CỘT (THE 4 PILLARS) */}
      <div>
          <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">TRUNG TÂM CHỈ HUY (4 PILLARS)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* BODY */}
              <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group border-b-4 border-b-rose-500">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                      <Dumbbell size={24} />
                  </div>
                  <h4 className="font-bold text-white text-lg">THÂN (Body)</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Gym, Dinh dưỡng, Giấc ngủ</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                      VÀO TẬP LUYỆN <ArrowRight size={14}/>
                  </div>
              </div>

              {/* MIND */}
              <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group border-b-4 border-b-blue-500">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      <Brain size={24} />
                  </div>
                  <h4 className="font-bold text-white text-lg">TRÍ (Mind)</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Sách, Kỹ năng, Dự án</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      QUẢN LÝ <ArrowRight size={14}/>
                  </div>
              </div>

              {/* WEALTH */}
              <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group border-b-4 border-b-yellow-500">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                      <Wallet size={24} />
                  </div>
                  <h4 className="font-bold text-white text-lg">TÀI (Wealth)</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Thu nhập, Chi tiêu, Đầu tư</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-yellow-400">
                      XEM VÍ <ArrowRight size={14}/>
                  </div>
              </div>

              {/* SPIRIT */}
              <div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group border-b-4 border-b-purple-500">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                      <Heart size={24} />
                  </div>
                  <h4 className="font-bold text-white text-lg">TÂM (Spirit)</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Nhật ký, Cảm xúc, Mối quan hệ</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      VIẾT NHẬT KÝ <ArrowRight size={14}/>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Dashboard;