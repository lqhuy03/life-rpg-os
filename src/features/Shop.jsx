import React, { useState } from 'react';
import { Trash2, Gift } from 'lucide-react';
import useGameStore from '../store/gameStore';

const Shop = () => {
  const { shopItems, addShopItem, buyItem, deleteShopItem, character } = useGameStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', cost: 50 });

  const handleAdd = (e) => {
    e.preventDefault();
    if(!newItem.title) return;
    addShopItem(newItem);
    setNewItem({ title: '', cost: 50 });
    setIsAdding(false);
  };

  return (
    <div className="pb-20 md:pb-0 animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Cửa Hàng</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="text-emerald-400 hover:bg-emerald-500/10 px-3 py-1 rounded-lg text-sm border border-emerald-500/50">
            + Tạo phần thưởng
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700">
             <input type="text" placeholder="Tên phần thưởng (VD: Xem phim)..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mb-3 outline-none"
                value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
            <div className="flex items-center gap-3 mb-3">
                <label className="text-slate-400 text-sm">Giá (Gold):</label>
                <input type="number" className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white w-24"
                    value={newItem.cost} onChange={(e) => setNewItem({...newItem, cost: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="w-full bg-emerald-600 py-2 rounded-lg text-white font-bold text-sm">Thêm vào cửa hàng</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shopItems.map((item) => {
            const canBuy = character.gold >= item.cost;
            return (
                <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between h-full relative group">
                    <button onClick={() => deleteShopItem(item.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Gift size={20} /></div>
                        <h4 className="font-bold text-slate-100">{item.title}</h4>
                    </div>
                    <button onClick={() => buyItem(item.id)} disabled={!canBuy}
                        className={`w-full py-2 rounded-lg font-bold text-sm ${canBuy ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                        {item.cost} Gold
                    </button>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default Shop;