import React from 'react';
import { Package, Sparkles } from 'lucide-react';
import useGameStore from '../store/gameStore';

const Inventory = () => {
  const { inventory, useItem } = useGameStore();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header đẹp hơn */}
      <div className="flex items-center gap-3 mb-6">
         <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <Package className="text-purple-400" size={24} />
         </div>
         <div>
            <h3 className="text-xl font-bold text-white">Túi Đồ</h3>
            <p className="text-xs text-slate-400">Quản lý vật phẩm của bạn</p>
         </div>
      </div>
      
      {(!inventory || inventory.length === 0) ? (
        <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-slate-700">
            <Package className="mx-auto text-slate-600 mb-3" size={48} />
            <p className="text-slate-500">Túi đang trống rỗng...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {inventory.map((item) => (
            <div key={item.id} className="glass-panel p-4 rounded-xl flex justify-between items-center group hover:border-purple-500/50 transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center border border-slate-700">
                    <Sparkles size={16} className="text-purple-400" />
                  </div>
                  <span className="font-bold text-slate-200">{item.title}</span>
               </div>
               
               <button 
                onClick={() => useItem(item.id)}
                className="btn-glass text-xs py-1.5 px-3 hover:bg-purple-600 hover:text-white hover:border-purple-500"
               >
                 Dùng
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;