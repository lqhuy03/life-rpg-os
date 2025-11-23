import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, PolarRadiusAxis } from 'recharts';
import useGameStore from '../store/gameStore';
import { Activity } from 'lucide-react';

const Dashboard = () => {
  const { character } = useGameStore();
  const [isChartReady, setIsChartReady] = useState(false);

  const stats = [
    { subject: 'Sức khỏe', A: character.stats.health },
    { subject: 'Trí tuệ', A: character.stats.wisdom },
    { subject: 'Tài chính', A: character.stats.wealth },
    { subject: 'Xã hội', A: character.stats.social },
    { subject: 'Sự nghiệp', A: character.stats.career },
    { subject: 'Tinh thần', A: character.stats.spirit },
  ];

  useEffect(() => {
    // Chờ 1 chút để layout ổn định rồi mới cho vẽ
    const timer = setTimeout(() => setIsChartReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Cột 1: Biểu đồ */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500" />
        <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
            <Activity size={20}/> Biểu Đồ Năng Lực
        </h3>
        
        {/* FIX LỖI VÀNG Ở ĐÂY */}
        <div className="w-full flex justify-center" style={{ minHeight: '300px' }}>
          {isChartReady ? (
            /* Thay đổi quan trọng: height={300} (số) thay vì "100%" */
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Stats" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#34d399' }}
                />
                </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-slate-500 text-sm animate-pulse">
                Đang khởi tạo radar...
            </div>
          )}
        </div>
      </div>

      {/* Cột 2: Thông tin chi tiết (Giữ nguyên) */}
      <div className="space-y-4">
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            <h3 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Tiến độ cấp độ</h3>
            <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-black text-white">{Math.floor((character.xp/character.maxXp)*100)}</span>
                <span className="text-xl font-bold text-emerald-400 mb-1">%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${(character.xp/character.maxXp)*100}%` }} />
            </div>
            <p className="text-slate-500 text-sm mt-3">Còn <span className="text-white font-bold">{Math.round(character.maxXp - character.xp)} XP</span> nữa để thăng cấp.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl text-center">
                <div className="text-3xl font-black text-rose-500 mb-1">{character.hp}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sức khỏe</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
                <div className="text-3xl font-black text-yellow-400 mb-1">{character.gold}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tài sản</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;