import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
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
        <h3 className="text-xl font-bold text-white">Bảng Nhiệm Vụ</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
            <Plus size={18} /> Thêm
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
            <input type="text" placeholder="Tên nhiệm vụ..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mb-3 outline-none focus:border-emerald-500"
                value={newQuest.title} onChange={(e) => setNewQuest({...newQuest, title: e.target.value})} autoFocus />
            <select className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 w-full mb-3"
                value={newQuest.difficulty} onChange={(e) => setNewQuest({...newQuest, difficulty: e.target.value})}>
                <option value="easy">Dễ (+10 XP)</option>
                <option value="medium">Trung bình (+30 XP)</option>
                <option value="hard">Khó (+50 XP)</option>
            </select>
            <button type="submit" className="w-full bg-emerald-600 py-2 rounded-lg text-white font-bold text-sm">Xác nhận</button>
        </form>
      )}

      <div className="space-y-3">
        {quests.length === 0 && <p className="text-slate-500 text-center py-8">Chưa có nhiệm vụ. Hãy tạo mới!</p>}
        {quests.map((quest) => (
          <div key={quest.id} className={`group relative p-4 rounded-xl border-2 transition-all ${quest.isCompleted ? 'bg-slate-900 border-slate-800 opacity-50' : 'bg-slate-800 border-slate-700 hover:border-emerald-500/30'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleQuest(quest.id)}>
                    <div className={`text-emerald-500 transition-transform ${quest.isCompleted ? 'scale-110' : 'scale-100'}`}>
                        {quest.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div>
                        <h4 className={`font-bold ${quest.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{quest.title}</h4>
                        <div className="flex gap-2 mt-1">
                             <span className="text-[10px] text-yellow-500 flex items-center gap-1"><Sparkles size={10}/> +{quest.reward.gold}G +{quest.reward.xp}XP</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => deleteQuest(quest.id)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
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