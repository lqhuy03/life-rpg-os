import React, { useState } from 'react';
import { Plus, Flame, Check, Trash2, Info, ChevronDown, ChevronUp, Calendar, X, Lightbulb, ShieldAlert, Heart } from 'lucide-react';
import { toast } from 'sonner';
import useGameStore from '../../store/gameStore';

const HabitList = () => {
  const { habits, addHabit, checkHabit, deleteHabit } = useGameStore();
  const [isAdding, setIsAdding] = useState(false);
  // Thêm trường description và type vào form
  const [newHabit, setNewHabit] = useState({ title: '', difficulty: 'easy', type: 'good', description: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [guideHabit, setGuideHabit] = useState(null); 

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.title) return;
    addHabit(newHabit);
    setNewHabit({ title: '', difficulty: 'easy', type: 'good', description: '' });
    setIsAdding(false);
  };

  // Render Heatmap (Giữ nguyên)
  const renderHeatmap = (history) => {
      const days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return d.toISOString().split('T')[0];
      });
      return (
          <div className="flex gap-1 mt-2 flex-wrap justify-center">
              {days.map(day => {
                  const isDone = history?.includes(day);
                  // Nếu là habit xấu, check có nghĩa là phạm quy (đỏ)
                  return (
                      <div key={day} className={`w-3 h-3 rounded-sm ${isDone ? 'bg-current opacity-80' : 'bg-slate-800'}`} title={day} />
                  )
              })}
          </div>
      );
  };

  return (
    <div className="animate-fade-in pb-20 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
           <Flame className="text-orange-500" /> Thói Quen
        </h3>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary text-sm">
            <Plus size={18} /> Thêm
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddHabit} className="glass-panel p-5 rounded-2xl mb-6 border-l-4 border-l-orange-500 space-y-3">
            <input type="text" placeholder="Tên thói quen (VD: Uống nước)..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                value={newHabit.title} onChange={(e) => setNewHabit({...newHabit, title: e.target.value})} autoFocus />
            
            <textarea placeholder="Tại sao cần làm? (Mô tả/Động lực)..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-orange-500 text-sm h-20"
                value={newHabit.description} onChange={(e) => setNewHabit({...newHabit, description: e.target.value})} />

            <div className="flex gap-2 flex-wrap">
                <select className="bg-slate-900 text-slate-300 text-xs rounded p-2 border border-slate-700 outline-none flex-1"
                    value={newHabit.type} onChange={(e) => setNewHabit({...newHabit, type: e.target.value})}>
                    <option value="good">Thói quen TỐT (Thưởng)</option>
                    <option value="bad">Thói quen XẤU (Phạt)</option>
                </select>

                <select className="bg-slate-900 text-slate-300 text-xs rounded p-2 border border-slate-700 outline-none flex-1"
                    value={newHabit.difficulty} onChange={(e) => setNewHabit({...newHabit, difficulty: e.target.value})}>
                    <option value="easy">Dễ</option>
                    <option value="medium">Vừa</option>
                    <option value="hard">Khó</option>
                </select>
                <button type="submit" className="btn-primary py-2 px-4 text-xs">LƯU</button>
            </div>
        </form>
      )}

      <div className="grid gap-3">
        {habits.map((habit) => {
            const today = new Date().toISOString().split('T')[0];
            const isDone = habit.last_completed_date === today;
            const isExpanded = expandedId === habit.id;
            const isBad = habit.type === 'bad';
            
            // Màu chủ đạo
            const themeColor = isBad ? 'text-red-500' : 'text-emerald-500';
            const borderColor = isBad ? 'hover:border-red-500/50' : 'hover:border-emerald-500/50';
            const btnBg = isBad ? 'hover:bg-red-500/10' : 'hover:bg-emerald-500/10';

            // Tính giai đoạn (21/66 days)
            const streak = habit.current_streak;
            let phase = "Giai đoạn 1: Khởi động";
            let progress = (streak / 21) * 100;
            
            if (streak > 21) { phase = "Giai đoạn 2: Rèn luyện"; progress = ((streak - 21) / (66 - 21)) * 100; }
            if (streak > 66) { phase = "Giai đoạn 3: Thành thạo"; progress = 100; }

            return (
            <div key={habit.id} className={`glass-panel rounded-2xl overflow-hidden transition-all ${isDone ? 'opacity-70' : ''} ${borderColor}`}>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30" onClick={() => setExpandedId(isExpanded ? null : habit.id)}>
                    <div className="flex items-center gap-4 flex-1">
                        {/* Checkbox */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); checkHabit(habit); }}
                            disabled={isDone}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all
                                ${isDone 
                                    ? (isBad ? 'bg-red-900/50 border-red-500 text-red-500' : 'bg-emerald-600 border-emerald-500 text-white') 
                                    : 'border-slate-700 hover:border-white text-transparent'}`}
                        >
                            {isBad ? <ShieldAlert size={24} /> : <Check size={24} strokeWidth={3} />}
                        </button>
                        
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-lg ${isDone ? 'text-slate-500 line-through' : (isBad ? 'text-red-100' : 'text-white')}`}>{habit.title}</h4>
                                {isBad && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded border border-red-500/30">BAD</span>}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs mt-1">
                                <span className={`${themeColor} flex items-center gap-1 font-bold`}>
                                    <Flame size={12} fill="currentColor"/> {isBad ? 'Relapse: ' : 'Streak: '} {habit.current_streak}
                                </span>
                                <span className="text-slate-500 uppercase text-[10px] border border-slate-700 px-1 rounded">{habit.difficulty}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-slate-500">
                        {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                </div>

                {isExpanded && (
                    <div className="bg-slate-900/50 p-4 border-t border-slate-800 space-y-4 animate-fade-in">
                        {/* Mô tả riêng */}
                        {habit.description && (
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 italic flex gap-2">
                                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                {habit.description}
                            </div>
                        )}

                        {/* Progress Bar */}
                        {!isBad && (
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-slate-400">
                                    <span>{phase}</span>
                                    <span>{streak}/66</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Heatmap */}
                        <div className={themeColor}>
                            <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-1">
                                <Calendar size={14}/> Lịch sử 30 ngày
                            </h5>
                            {renderHeatmap(habit.history)}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                            <button 
                                onClick={() => setGuideHabit(habit)}
                                className="text-xs text-blue-400 flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <Lightbulb size={14}/> Gợi ý chiến thuật
                            </button>
                            <button onClick={() => deleteHabit(habit.id)} className="text-xs text-red-400 flex items-center gap-1 hover:text-white transition-colors">
                                <Trash2 size={14}/> Xóa
                            </button>
                        </div>
                    </div>
                )}
            </div>
            )
        })}
      </div>

      {/* MODAL HƯỚNG DẪN (Giữ nguyên logic cũ, chỉ thêm hiển thị desc) */}
      {guideHabit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setGuideHabit(null)}>
            <div className="glass-panel p-6 rounded-2xl w-full max-w-md relative border border-blue-500/30 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={() => setGuideHabit(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30"><Lightbulb className="text-blue-400" size={28} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Chiến thuật tâm lý</h3>
                        <p className="text-slate-400 text-xs uppercase font-bold">Độ khó: {guideHabit.difficulty}</p>
                    </div>
                </div>
                {/* Nội dung hướng dẫn cứng (như cũ) */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-4 text-slate-300 text-sm">
                    {guideHabit.difficulty === 'easy' && "Quy tắc 2 phút: Hãy biến thói quen này thành việc đơn giản đến mức không thể chối từ."}
                    {guideHabit.difficulty === 'medium' && "Habit Stacking: Hãy gắn việc này ngay sau một thói quen cũ đã vững chắc."}
                    {guideHabit.difficulty === 'hard' && "Thiết kế môi trường: Hãy chuẩn bị sẵn dụng cụ từ tối hôm trước để giảm lực cản."}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HabitList;