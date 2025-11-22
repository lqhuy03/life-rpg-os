import React, { useState } from 'react';
import { Trash2, Gift, ShoppingCart, Plus } from 'lucide-react';
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
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-yellow-400"/> Cửa Hàng
        </h3>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-glass text-sm text-emerald-400 border-emerald-500/30">
            <Plus size={16} /> Tạo Phần Thưởng
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel p-5 rounded-2xl mb-6 border-l-4 border-l-yellow-500">
             <input type="text" placeholder="Tên phần thưởng..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white mb-4 outline-none focus:border-yellow-500 transition-colors"
                value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
            <div className="flex items-center gap-3 mb-4">
                <label className="text-slate-400 text-sm font-bold">Giá (Gold):</label>
                <input type="number" className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white w-24 outline-none focus:border-yellow-500"
                    value={newItem.cost} onChange={(e) => setNewItem({...newItem, cost: parseInt(e.target.value)})} />
            </div>
            <button type="submit" className="btn-primary bg-yellow-600 hover:bg-yellow-500 border-yellow-500 text-white w-full">Thêm vào Shop</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shopItems.map((item) => {
            const canBuy = character.gold >= item.cost;
            return (
                <div key={item.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full relative group hover:border-yellow-500/40 transition-all duration-300 hover:-translate-y-1">
                    <button onClick={() => deleteShopItem(item.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    
                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-yellow-400 mb-4 border border-slate-700 shadow-inner">
                            <Gift size={24} />
                        </div>
                        <h4 className="font-bold text-lg text-slate-100 leading-tight">{item.title}</h4>
                    </div>
                    
                    <button onClick={() => buyItem(item.id)} disabled={!canBuy}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                            ${canBuy 
                                ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)]' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}>
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