import React, { useState } from 'react';
import { Plus, FolderPlus, CheckSquare, Square, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import useGameStore from '../../store/gameStore';

const ProjectBoard = () => {
  const { projects, tasks, addProject, deleteProject, addTask, toggleTask, deleteTask } = useGameStore();
  
  // UI States
  const [isAddingProj, setIsAddingProj] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [expandedProj, setExpandedProj] = useState(null); // ID dự án đang mở
  const [newTask, setNewTask] = useState({ title: '', projectId: null }); // Task đang nhập

  // Handlers
  const handleAddProject = (e) => {
      e.preventDefault();
      if (!newProjTitle) return;
      addProject(newProjTitle);
      setNewProjTitle("");
      setIsAddingProj(false);
  };

  const handleAddTask = (e, projectId) => {
      e.preventDefault();
      if (!newTask.title) return;
      addTask({ title: newTask.title, projectId, difficulty: 'medium', priority: 'normal' });
      setNewTask({ title: '', projectId: null });
  };

  // Lọc task không thuộc dự án nào (Việc vặt)
  const looseTasks = tasks.filter(t => !t.project_id);

  return (
    <div className="animate-fade-in pb-20 space-y-8">
        
        {/* --- PHẦN 1: DỰ ÁN (PROJECTS) --- */}
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><FolderPlus size={20}/> Dự Án / OKRs</h3>
                <button onClick={() => setIsAddingProj(true)} className="text-xs text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1 rounded-lg">+ Dự án mới</button>
            </div>

            {isAddingProj && (
                <form onSubmit={handleAddProject} className="mb-4 flex gap-2">
                    <input type="text" placeholder="Tên dự án lớn (VD: Học IELTS)..." className="flex-1 bg-slate-900 border border-blue-500 rounded-lg p-2 text-white focus:outline-none"
                        value={newProjTitle} onChange={e => setNewProjTitle(e.target.value)} autoFocus />
                    <button className="bg-blue-600 px-4 rounded-lg font-bold text-white">OK</button>
                </form>
            )}

            <div className="space-y-3">
                {projects.map(proj => {
                    const projTasks = tasks.filter(t => t.project_id === proj.id);
                    const completedCount = projTasks.filter(t => t.is_completed).length;
                    const progress = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
                    const isExpanded = expandedProj === proj.id;

                    return (
                        <div key={proj.id} className="glass-panel rounded-xl overflow-hidden border-l-4 border-l-blue-500">
                            {/* Header Dự án */}
                            <div className="p-4 flex items-center justify-between bg-slate-800/30 cursor-pointer hover:bg-slate-800/50"
                                onClick={() => setExpandedProj(isExpanded ? null : proj.id)}>
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown size={18} className="text-blue-400"/> : <ChevronRight size={18} className="text-slate-500"/>}
                                    <div>
                                        <h4 className="font-bold text-white">{proj.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{progress}% ({completedCount}/{projTasks.length})</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }} className="text-slate-600 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>

                            {/* Danh sách Task con (Chỉ hiện khi mở) */}
                            {isExpanded && (
                                <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
                                    {/* Form thêm task */}
                                    <form onSubmit={(e) => handleAddTask(e, proj.id)} className="mb-3 flex gap-2">
                                        <input type="text" placeholder="Thêm công việc nhỏ..." className="flex-1 bg-transparent border-b border-slate-700 text-sm p-1 text-white focus:border-blue-500 outline-none"
                                            value={newTask.projectId === proj.id ? newTask.title : ''}
                                            onChange={e => setNewTask({ title: e.target.value, projectId: proj.id })}
                                        />
                                        <button className="text-blue-400 text-xs font-bold">THÊM</button>
                                    </form>
                                    
                                    {/* List Tasks */}
                                    <div className="space-y-2 pl-2">
                                        {projTasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-3 group">
                                                <button onClick={() => toggleTask(task.id)} className="text-slate-400 hover:text-blue-400">
                                                    {task.is_completed ? <CheckSquare size={18} className="text-blue-500"/> : <Square size={18}/>}
                                                </button>
                                                <span className={`text-sm flex-1 ${task.is_completed ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{task.title}</span>
                                                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                        {projTasks.length === 0 && <p className="text-xs text-slate-600 italic">Chưa có công việc nào.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- PHẦN 2: VIỆC VẶT (LOOSE TASKS) --- */}
        <div>
            <h3 className="text-lg font-bold text-slate-400 mb-3 flex items-center gap-2"><CheckSquare size={18}/> Việc Vặt (Side Quests)</h3>
            
            <form onSubmit={(e) => handleAddTask(e, null)} className="glass-panel p-3 rounded-xl flex gap-2 mb-3">
                <input type="text" placeholder="Nhập việc cần làm nhanh..." className="flex-1 bg-transparent text-white outline-none"
                    value={newTask.projectId === null ? newTask.title : ''}
                    onChange={e => setNewTask({ title: e.target.value, projectId: null })}
                />
                <button className="btn-primary text-xs py-1 px-3">+</button>
            </form>

            <div className="space-y-2">
                {looseTasks.map(task => (
                    <div key={task.id} className={`glass-panel p-3 rounded-xl flex items-center justify-between ${task.is_completed ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleTask(task.id)}>
                                {task.is_completed ? <CheckSquare size={20} className="text-emerald-500"/> : <Square size={20} className="text-slate-500"/>}
                            </button>
                            <span className={task.is_completed ? 'text-slate-500 line-through' : 'text-white'}>{task.title}</span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>

    </div>
  );
};

export default ProjectBoard;