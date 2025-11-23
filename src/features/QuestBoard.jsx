import React, { useState } from 'react';
import { Layers, ListTodo } from 'lucide-react';
import HabitList from './Habits/HabitList';
import ProjectBoard from './Projects/ProjectBoard';

const QuestBoard = () => {
  const [view, setView] = useState('habits'); // State chuyển tab ('habits' hoặc 'projects')

  return (
    <div className="animate-fade-in">
      {/* HEADER: TAB NAVIGATION */}
      <div className="flex gap-4 mb-6 border-b border-slate-700/50 pb-1">
        <button 
            onClick={() => setView('habits')} 
            className={`pb-3 px-4 font-bold transition-all flex items-center gap-2 border-b-2 ${view === 'habits' ? 'text-orange-400 border-orange-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
            <Layers size={18}/> Thói Quen (Habits)
        </button>
        
        <button 
            onClick={() => setView('projects')} 
            className={`pb-3 px-4 font-bold transition-all flex items-center gap-2 border-b-2 ${view === 'projects' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
            <ListTodo size={18}/> Dự Án & Việc Vặt
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[400px]">
          {view === 'habits' && <HabitList />}
          {view === 'projects' && <ProjectBoard />}
      </div>
    </div>
  );
};

export default QuestBoard;