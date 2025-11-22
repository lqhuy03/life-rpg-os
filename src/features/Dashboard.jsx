import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import useGameStore from '../store/gameStore';

const Dashboard = () => {
  const { character } = useGameStore();

  const stats = [
    { subject: 'Sức khỏe', A: character.stats.health, fullMark: 100 },
    { subject: 'Trí tuệ', A: character.stats.wisdom, fullMark: 100 },
    { subject: 'Tài chính', A: character.stats.wealth, fullMark: 100 },
    { subject: 'Xã hội', A: character.stats.social, fullMark: 100 },
    { subject: 'Sự nghiệp', A: character.stats.career, fullMark: 100 },
    { subject: 'Tinh thần', A: character.stats.spirit, fullMark: 100 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
      {/* CỘT 1: BIỂU ĐỒ */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center">
        <h3 className="text-lg font-bold text-emerald-400 mb-4 text-center">Biểu Đồ Năng Lực</h3>
        
        {/* SỬA LỖI Ở ĐÂY: */}
        {/* 1. Xóa style minHeight và className h-[300px] ở thẻ div cha */}
        {/* 2. Đưa chiều cao 300 vào thẳng prop height của ResponsiveContainer */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              {/* Thêm PolarRadiusAxis để thang đo chuẩn 0-100 */}
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar 
                name="Stats" 
                dataKey="A" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.4} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CỘT 2: THÔNG TIN */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-xs uppercase font-bold mb-2">Tiến độ cấp độ</h3>
            <div className="text-4xl font-bold text-white mb-1">
                {Math.floor((character.xp/character.maxXp)*100)}%
            </div>
            <p className="text-slate-500 text-sm">
                Cố lên! Còn {character.maxXp - character.xp} XP nữa để thăng cấp.
            </p>
        </div>
        
        {/* Thêm một bảng thống kê nhỏ cho đỡ trống */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-xs uppercase font-bold mb-2">Chỉ số sinh tồn</h3>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                <span className="text-slate-300">Máu (HP)</span>
                <span className="text-red-400 font-bold">{character.hp}/{character.maxHp}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-300">Tài sản</span>
                <span className="text-yellow-400 font-bold">{character.gold} G</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;