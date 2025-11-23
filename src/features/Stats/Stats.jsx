import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { History, TrendingUp, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const Stats = () => {
  const { logs } = useGameStore();
  // State để trì hoãn việc vẽ biểu đồ 1 chút (Fix lỗi Recharts)
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
      setTimeout(() => setIsReady(true), 100);
  }, []);

  const processChartData = () => {
      const data = [];
      // Lấy 7 ngày gần nhất
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const displayDate = `${d.getDate()}/${d.getMonth() + 1}`; // DD/MM
          
          const dailyLogs = logs.filter(l => l.created_at.startsWith(dateStr));
          const xp = dailyLogs.reduce((sum, l) => sum + (l.xp_gained || 0), 0);
          const gold = dailyLogs.reduce((sum, l) => sum + (l.gold_gained || 0), 0);

          data.push({ name: displayDate, xp, gold });
      }
      return data;
  };

  const chartData = processChartData();

  const getLogIcon = (type) => {
      switch(type) {
          case 'habit_done': return <CheckCircle2 className="text-emerald-400" size={18}/>;
          case 'task_done': return <CheckCircle2 className="text-blue-400" size={18}/>;
          case 'habit_fail': return <AlertCircle className="text-red-400" size={18}/>;
          case 'buy_item': return <ShoppingBag className="text-yellow-400" size={18}/>;
          default: return <History className="text-slate-400" size={18}/>;
      }
  };

  const getLogText = (log) => {
      switch(log.action_type) {
          case 'habit_done': return `Thói quen: ${log.target_name}`;
          case 'task_done': return `Xong việc: ${log.target_name}`;
          case 'habit_fail': return `Phạm quy: ${log.target_name}`;
          case 'buy_item': return `Mua sắm: ${log.target_name}`;
          default: return log.target_name;
      }
  };

  return (
    <div className="animate-fade-in pb-20 space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-purple-400"/> Thống Kê & Lịch Sử
      </h2>

      {/* BIỂU ĐỒ (Đã Fix Lỗi) */}
      <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Hiệu suất 7 ngày qua</h3>
          
          <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
            {isReady ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                            cursor={{ fill: '#1e293b' }}
                        />
                        <Bar dataKey="xp" fill="#10b981" name="XP (Kinh nghiệm)" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="gold" fill="#facc15" name="Gold (Thu nhập)" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-600">Đang vẽ biểu đồ...</div>
            )}
          </div>
      </div>

      {/* NHẬT KÝ */}
      <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <History size={16}/> Nhật Ký Hoạt Động (50 gần nhất)
          </h3>
          
          <div className="space-y-0 divide-y divide-slate-800 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {logs.length === 0 && <p className="text-slate-500 text-sm py-4 text-center">Chưa có dữ liệu.</p>}
              
              {logs.map(log => (
                  <div key={log.id} className="py-3 flex justify-between items-center hover:bg-slate-800/30 px-2 rounded transition-colors">
                      <div className="flex items-center gap-3">
                          {getLogIcon(log.action_type)}
                          <div>
                              <p className="text-sm text-slate-200 font-medium">{getLogText(log)}</p>
                              <p className="text-[10px] text-slate-500">
                                  {new Date(log.created_at).toLocaleString('vi-VN')}
                              </p>
                          </div>
                      </div>
                      <div className="text-right">
                          {log.xp_gained !== 0 && (
                              <span className={`text-xs font-bold block ${log.xp_gained > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {log.xp_gained > 0 ? '+' : ''}{log.xp_gained} XP
                              </span>
                          )}
                          {log.gold_gained !== 0 && (
                              <span className={`text-xs font-bold block ${log.gold_gained > 0 ? 'text-yellow-400' : 'text-orange-400'}`}>
                                  {log.gold_gained > 0 ? '+' : ''}{log.gold_gained} G
                              </span>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Stats;