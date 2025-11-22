import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles, Swords } from 'lucide-react';
import useGameStore from '../store/gameStore';

const QuestBoard = () => {
  const { quests, addQuest, toggleQuest, deleteQuest } = useGameStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', difficulty: 'easy' });

  const handleAdd = (e) => {
    e.preventDefault();
    if(!newQuest.title) return;
    let reward = { xp: 10, gold: 5 };
    if(newQuest.difficulty === 'medium') reward = { xp: 30, gold: 15 };
    if(newQuest.difficulty === 'hard') reward = { xp: 50, gold: 30 };
    addQuest({ ...newQuest, type: 'daily', reward });
    setNewQuest({ title: '', difficulty: 'easy' });
    setIsAdding(false);
  };

  return (
    <div className="pb-20 md:pb-0 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
           <Swords className="text-rose-400" /> Nhiệm Vụ
        </h3>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary text-sm">
            <Plus size={18} /> Thêm Mới
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel p-5 rounded-2xl mb-6 animate-fade-in border-l-4 border-l-emerald-500">
            <input type="text" placeholder="Nhập tên nhiệm vụ..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white mb-4 outline-none focus:border-emerald-500 transition-colors"
                value={newQuest.title} onChange={(e) => setNewQuest({...newQuest, title: e.target.value})} autoFocus />
            <div className="flex gap-3">
                <select className="bg-slate-950/50 border border-slate-700 rounded-xl p-2 text-sm text-slate-300 outline-none focus:border-emerald-500 flex-1"
                    value={newQuest.difficulty} onChange={(e) => setNewQuest({...newQuest, difficulty: e.target.value})}>
                    <option value="easy">Dễ (+10 XP)</option>
                    <option value="medium">Vừa (+30 XP)</option>
                    <option value="hard">Khó (+50 XP)</option>
                </select>
                <button type="submit" className="btn-primary px-6">Lưu</button>
            </div>
        </form>
      )}

      <div className="space-y-3">
        {quests.length === 0 && (
            <div className="glass-panel p-10 rounded-2xl text-center border-dashed border-2 border-slate-700">
                <p className="text-slate-500">Danh sách trống. Hãy khởi tạo hành trình!</p>
            </div>
        )}
        {quests.map((quest) => (
          <div key={quest.id} className={`group glass-panel p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01] ${quest.isCompleted ? 'opacity-50 bg-slate-900' : 'hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleQuest(quest.id)}>
                    <div className={`transition-transform duration-300 ${quest.isCompleted ? 'text-emerald-500 scale-110' : 'text-slate-600 group-hover:text-emerald-400'}`}>
                        {quest.isCompleted ? <CheckCircle2 size={28} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> : <Circle size={28} />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg ${quest.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{quest.title}</h4>
                        <div className="flex gap-3 mt-1">
                             <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 uppercase font-bold tracking-wider">{quest.difficulty}</span>
                             <span className="text-[10px] text-yellow-400 flex items-center gap-1 font-bold"><Sparkles size={10}/> +{quest.reward.gold}G</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => deleteQuest(quest.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBoard;