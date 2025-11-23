import React, { useState } from 'react';
import { Plus, FolderPlus, CheckSquare, Square, Trash2, Sword, Target, AlertCircle, Clock } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { toast } from 'sonner';

const ProjectBoard = () => {
  const { projects, tasks, addProject, deleteProject, addTask, toggleTask, deleteTask } = useGameStore();
  
  // UI States
  const [isAddingProj, setIsAddingProj] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  
  // State thêm task mới (chứa thông tin Eisenhower)
  const [activeProjId, setActiveProjId] = useState(null); // ID dự án đang muốn thêm task (null = việc vặt)
  const [newTask, setNewTask] = useState({ title: '', priority: 'normal', difficulty: 'easy' });

  // Handlers
  const handleAddProject = (e) => {
      e.preventDefault();
      if (!newProjTitle.trim()) return;
      addProject(newProjTitle);
      setNewProjTitle("");
      setIsAddingProj(false);
  };

  const handleAddTask = (e, projectId) => {
      e.preventDefault();
      if (!newTask.title.trim()) return;
      
      addTask({ 
          title: newTask.title, 
          projectId, 
          priority: newTask.priority,
          difficulty: newTask.difficulty
      });
      setNewTask({ title: '', priority: 'normal', difficulty: 'easy' }); // Reset form
      setActiveProjId('RESET'); // Đóng form (trick)
  };

  // Helper: Render màu theo độ ưu tiên (Eisenhower)
  const getPriorityColor = (p) => {
      switch(p) {
          case 'urgent': return 'text-red-500 border-red-500/50 bg-red-500/10'; // Gấp & Quan trọng
          case 'high': return 'text-orange-400 border-orange-400/50 bg-orange-400/10'; // Quan trọng
          case 'normal': return 'text-blue-400 border-blue-400/50 bg-blue-400/10'; // Bình thường
          default: return 'text-slate-400 border-slate-600 bg-slate-800'; // Thấp
      }
  };

  const looseTasks = tasks.filter(t => !t.project_id);

  return (
    <div className="animate-fade-in pb-20 space-y-10">
        
        {/* --- PHẦN 1: CHIẾN DỊCH (PROJECTS - BOSS BATTLES) --- */}
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    <Sword size={24}/> Chiến Dịch (Boss Battles)
                </h3>
                <button onClick={() => setIsAddingProj(!isAddingProj)} className="btn-primary text-xs py-1.5 px-3">
                    <FolderPlus size={16} /> Tạo Chiến Dịch
                </button>
            </div>

            {isAddingProj && (
                <form onSubmit={handleAddProject} className="mb-6 flex gap-2 glass-panel p-4 rounded-xl">
                    <input type="text" placeholder="Tên Boss/Dự án (VD: Đồ án tốt nghiệp)..." className="flex-1 bg-transparent border-b border-slate-600 text-white outline-none focus:border-blue-500"
                        value={newProjTitle} onChange={e => setNewProjTitle(e.target.value)} autoFocus />
                    <button className="text-blue-400 font-bold text-xs">TRIỆU HỒI</button>
                </form>
            )}

            <div className="grid gap-6">
                {projects.map(proj => {
                    const projTasks = tasks.filter(t => t.project_id === proj.id);
                    const completedCount = projTasks.filter(t => t.is_completed).length;
                    const totalHP = projTasks.length * 100; // Giả sử mỗi task là 100 HP
                    const currentHP = totalHP - (completedCount * 100);
                    const progressPercent = projTasks.length > 0 ? (completedCount / projTasks.length) * 100 : 0;
                    
                    // Màu thanh máu Boss
                    let hpColor = "bg-emerald-500"; // Máu xanh (đầy)
                    if (progressPercent > 50) hpColor = "bg-yellow-500"; // Máu vàng (sắp chết)
                    if (progressPercent > 80) hpColor = "bg-red-600"; // Máu đỏ (hấp hối)

                    return (
                        <div key={proj.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-700/50 group">
                            {/* BOSS HEADER */}
                            <div className="p-5 bg-slate-900/50 relative overflow-hidden">
                                <div className="flex justify-between items-start z-10 relative">
                                    <div>
                                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                                            <Target className="text-red-500" size={20} /> {proj.title}
                                        </h4>
                                        <div className="text-xs text-slate-400 mt-1 flex gap-3">
                                            <span>HP: {currentHP}/{totalHP || '???'}</span>
                                            <span>Tasks: {completedCount}/{projTasks.length}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteProject(proj.id)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                </div>
                                
                                {/* HP BAR */}
                                <div className="w-full h-1.5 bg-slate-800 mt-4 rounded-full overflow-hidden">
                                    {/* Thanh máu Boss giảm dần khi làm task (Ngược lại với progress bar thường) */}
                                    <div className={`h-full ${hpColor} transition-all duration-700`} style={{ width: `${100 - progressPercent}%` }} />
                                </div>
                            </div>

                            {/* TASK LIST */}
                            <div className="p-4 space-y-2">
                                {projTasks.map(task => (
                                    <div key={task.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-slate-800/50 ${task.is_completed ? 'opacity-50' : ''}`}>
                                        <button onClick={() => toggleTask(task.id)} className="text-slate-400 hover:text-blue-400 transition-transform active:scale-90">
                                            {task.is_completed ? <CheckSquare size={20} className="text-blue-500"/> : <Square size={20}/>}
                                        </button>
                                        
                                        <div className="flex-1">
                                            <p className={`text-sm ${task.is_completed ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</p>
                                            {/* Priority Badge */}
                                            <span className={`text-[10px] px-1.5 rounded border ${getPriorityColor(task.priority)}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        
                                        <button onClick={() => deleteTask(task.id)} className="text-slate-700 hover:text-red-400"><Trash2 size={14}/></button>
                                    </div>
                                ))}

                                {/* FORM THÊM TASK CON */}
                                {activeProjId === proj.id ? (
                                    <form onSubmit={(e) => handleAddTask(e, proj.id)} className="mt-3 p-3 bg-slate-800/30 rounded-xl border border-blue-500/30 animate-fade-in">
                                        <input type="text" placeholder="Tên công việc..." className="w-full bg-transparent border-b border-slate-600 text-sm text-white mb-2 focus:outline-none"
                                            value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus />
                                        
                                        <div className="flex justify-between items-center">
                                            <select className="bg-slate-900 text-xs text-slate-300 p-1 rounded border border-slate-700"
                                                value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                                                <option value="normal">Bình thường</option>
                                                <option value="high">Quan trọng</option>
                                                <option value="urgent">Gấp & Quan trọng</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setActiveProjId(null)} className="text-xs text-slate-500">Hủy</button>
                                                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-bold">Thêm</button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setActiveProjId(proj.id)} className="w-full py-2 text-xs text-slate-500 border border-dashed border-slate-700 rounded-lg hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                                        + Thêm đòn tấn công
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {projects.length === 0 && <div className="text-center text-slate-600 py-4 italic">Chưa có chiến dịch nào.</div>}
            </div>
        </div>

        {/* --- PHẦN 2: NHIỆM VỤ LẺ (SIDE QUESTS) --- */}
        <div>
            <div className="flex justify-between items-center mb-4 border-t border-slate-800 pt-6">
                <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                    <Clock size={20}/> Việc Vặt (Side Quests)
                </h3>
                {activeProjId !== 'loose' && (
                    <button onClick={() => setActiveProjId('loose')} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                        + Thêm việc vặt
                    </button>
                )}
            </div>

            {/* Form thêm việc vặt */}
            {activeProjId === 'loose' && (
                <form onSubmit={(e) => handleAddTask(e, null)} className="mb-4 glass-panel p-3 rounded-xl border border-slate-600">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Nhập việc cần làm..." className="flex-1 bg-transparent text-white outline-none text-sm"
                            value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus />
                        <select className="bg-slate-900 text-xs text-slate-300 p-1 rounded border border-slate-700 outline-none"
                            value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                            <option value="normal">Thường</option>
                            <option value="urgent">Gấp</option>
                        </select>
                        <button className="text-xs bg-slate-700 text-white px-3 rounded font-bold">OK</button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {looseTasks.map(task => (
                    <div key={task.id} className={`glass-panel p-3 rounded-xl flex items-center justify-between group hover:border-slate-500/50 transition-all ${task.is_completed ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleTask(task.id)}>
                                {task.is_completed ? <CheckSquare size={20} className="text-emerald-500"/> : <Square size={20} className="text-slate-500 hover:text-white"/>}
                            </button>
                            <div className="flex flex-col">
                                <span className={`text-sm ${task.is_completed ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</span>
                                <span className={`text-[10px] px-1.5 rounded border w-fit mt-0.5 ${getPriorityColor(task.priority)}`}>
                                    {task.priority.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                ))}
                {looseTasks.length === 0 && <div className="text-center text-slate-700 text-xs">Danh sách trống.</div>}
            </div>
        </div>

    </div>
  );
};

export default ProjectBoard;