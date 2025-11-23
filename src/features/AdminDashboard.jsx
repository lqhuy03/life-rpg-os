import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Activity, Search, Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [userList, setUserList] = useState([]);
  const [globalShop, setGlobalShop] = useState([]);
  const [newItem, setNewItem] = useState({ title: '', cost: 100 });
  
  // State cho Modal Sửa User
  const [editingUser, setEditingUser] = useState(null); // User đang được chọn để sửa
  const [editForm, setEditForm] = useState({}); // Dữ liệu form sửa

  useEffect(() => {
    fetchUsers();
    fetchGlobalShop();
  }, []);

  // --- USER MANAGEMENT FUNCTIONS ---
  
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (!error) setUserList(data);
  };

  const handleDeleteUser = async (id) => {
      if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa người chơi này? Dữ liệu sẽ không thể phục hồi.")) return;
      
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
          toast.error("Lỗi xóa user: " + error.message);
      } else {
          toast.success("Đã xóa người chơi khỏi hệ thống");
          fetchUsers();
      }
  };

  const openEditModal = (user) => {
      setEditingUser(user);
      setEditForm({ ...user }); // Copy dữ liệu user vào form
  };

  const handleUpdateUser = async (e) => {
      e.preventDefault();
      const { error } = await supabase.from('profiles').update({
          username: editForm.username,
          role: editForm.role,
          gold: parseInt(editForm.gold),
          level: parseInt(editForm.level),
          hp: parseInt(editForm.hp)
      }).eq('id', editForm.id);

      if (error) {
          toast.error("Lỗi cập nhật: " + error.message);
      } else {
          toast.success("Cập nhật thông tin thành công!");
          setEditingUser(null); // Đóng modal
          fetchUsers(); // Load lại danh sách
      }
  };

  // --- SHOP FUNCTIONS ---

  const fetchGlobalShop = async () => {
    const { data, error } = await supabase.from('shop_items').select('*').is('user_id', null);
    if (!error) setGlobalShop(data);
  };

  const handleAddGlobalItem = async (e) => {
      e.preventDefault();
      const { error } = await supabase.from('shop_items').insert([{
          title: newItem.title,
          cost: newItem.cost,
          user_id: null 
      }]);
      if (!error) {
          toast.success("Đã thêm vật phẩm chung");
          setNewItem({ title: '', cost: 100 });
          fetchGlobalShop();
      }
  };

  const handleDeleteGlobalItem = async (id) => {
      await supabase.from('shop_items').delete().eq('id', id);
      fetchGlobalShop();
      toast.success("Đã xóa vật phẩm");
  };

  return (
    <div className="animate-fade-in pb-20 relative">
      <h2 className="text-3xl font-black text-red-500 mb-6 flex items-center gap-2">
        <Activity /> TRUNG TÂM QUẢN TRỊ
      </h2>

      {/* Admin Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-4 rounded-xl border-red-500/30 bg-red-500/5">
            <div className="text-slate-400 text-xs uppercase font-bold">Tổng User</div>
            <div className="text-3xl font-black text-white">{userList.length}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border-yellow-500/30 bg-yellow-500/5">
            <div className="text-slate-400 text-xs uppercase font-bold">Vật phẩm Global</div>
            <div className="text-3xl font-black text-yellow-400">{globalShop.length}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border-blue-500/30 bg-blue-500/5">
            <div className="text-slate-400 text-xs uppercase font-bold">Trạng thái</div>
            <div className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/> ADMIN MODE
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700 pb-1">
        <button onClick={() => setTab('users')} 
            className={`pb-2 px-4 font-bold transition-colors ${tab === 'users' ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-500 hover:text-white'}`}>
            <Users size={18} className="inline mr-2"/> Quản Lý User
        </button>
        <button onClick={() => setTab('shop_global')} 
            className={`pb-2 px-4 font-bold transition-colors ${tab === 'shop_global' ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-500 hover:text-white'}`}>
            <ShoppingCart size={18} className="inline mr-2"/> Cửa Hàng Hệ Thống
        </button>
      </div>

      {/* --- TAB: USER MANAGEMENT --- */}
      {tab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 border-b border-slate-700">
                    <tr>
                        <th className="p-3">Tên Nhân Vật</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Level</th>
                        <th className="p-3">Gold</th>
                        <th className="p-3 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {userList.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-bold text-white">{u.username}</td>
                            <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="p-3 text-cyan-400 font-mono">{u.level}</td>
                            <td className="p-3 text-yellow-400 font-mono">{u.gold}</td>
                            <td className="p-3 flex justify-end gap-2">
                                <button onClick={() => openEditModal(u)} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-all">
                                    <Edit size={16}/>
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={16}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* --- TAB: GLOBAL SHOP --- */}
      {tab === 'shop_global' && (
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-red-500">
                <h4 className="font-bold text-white mb-4">Thêm Vật Phẩm Mẫu</h4>
                <form onSubmit={handleAddGlobalItem} className="flex gap-3">
                    <input type="text" placeholder="Tên vật phẩm..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-red-500"
                        value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                    <input type="number" placeholder="Giá" className="w-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-red-500"
                        value={newItem.cost} onChange={e => setNewItem({...newItem, cost: parseInt(e.target.value)})} />
                    <button className="btn-glass bg-red-600/20 text-red-400 border-red-500/50 hover:bg-red-500 hover:text-white">
                        <Plus size={20}/> Thêm
                    </button>
                </form>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {globalShop.map(item => (
                    <div key={item.id} className="glass-panel p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <div className="font-bold text-white">{item.title}</div>
                            <div className="text-xs text-yellow-400 font-mono">{item.cost} Gold</div>
                        </div>
                        <button onClick={() => handleDeleteGlobalItem(item.id)} className="p-2 text-slate-500 hover:text-red-400">
                            <Trash2 size={18}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- MODAL EDIT USER (Cửa sổ nổi) --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="glass-panel p-6 rounded-2xl w-full max-w-md animate-fade-in border border-blue-500/30 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit className="text-blue-400"/> Sửa Thông Tin User
                    </h3>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tên hiển thị</label>
                        <input type="text" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-white focus:border-blue-500 outline-none"
                            value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Role</label>
                            <select className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-white focus:border-blue-500 outline-none"
                                value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Level</label>
                            <input type="number" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-white focus:border-blue-500 outline-none"
                                value={editForm.level} onChange={e => setEditForm({...editForm, level: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Gold (Tiền)</label>
                            <input type="number" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-yellow-400 font-mono focus:border-blue-500 outline-none"
                                value={editForm.gold} onChange={e => setEditForm({...editForm, gold: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">HP (Máu)</label>
                            <input type="number" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-rose-400 font-mono focus:border-blue-500 outline-none"
                                value={editForm.hp} onChange={e => setEditForm({...editForm, hp: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary bg-blue-600 hover:bg-blue-500 border-blue-500 w-full py-3 mt-4">
                        <Save size={18}/> Lưu Thay Đổi
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;