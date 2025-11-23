import React from 'react';
import { Coins, Trophy, Heart, Zap, User } from 'lucide-react';
import useGameStore from '../store/gameStore';

// Nhận prop setActiveTab
const Header = ({ setActiveTab }) => {
  const { character } = useGameStore();
  const xpPercent = Math.min(100, (character.xp / character.maxXp) * 100);
  const hpPercent = (character.hp / character.maxHp) * 100;

  return (
    <header className="glass-panel border-x-0 border-t-0 p-4 sticky top-0 z-40 mb-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        
        {/* User Info & Avatar Clickable */}
        <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => setActiveTab('profile')} // Bấm vào chuyển sang Profile
        >
          <div className="relative">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center font-black text-xl text-white border-2 border-white/10 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                {character.level}
             </div>
             {/* Badge Admin nhỏ nếu có */}
             {character.role === 'admin' && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900">
                    ADM
                </div>
             )}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {character.name}
            </h2>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {character.role === 'admin' ? 'GAME MASTER' : 'HERO'}
                </span>
                <span className="text-xs text-slate-400">Click để xem hồ sơ</span>
            </div>
          </div>
        </div>

        {/* Stats Bars (Giữ nguyên) */}
        <div className="flex-1 md:max-w-md flex flex-col gap-3">
           <div className="relative group">
              <div className="flex justify-between text-[10px] font-bold mb-1 px-1">
                 <span className="text-rose-400 flex items-center gap-1"><Heart size={10} fill="currentColor"/> HP</span>
                 <span className="text-slate-400">{character.hp}/{character.maxHp}</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner relative">
                 <div className="absolute h-full bg-rose-500 shadow-[0_0_10px_#f43f5e] transition-all duration-700 ease-out" style={{ width: `${hpPercent}%` }} />
              </div>
           </div>

           <div className="relative group">
               <div className="flex justify-between text-[10px] font-bold mb-1 px-1">
                 <span className="text-emerald-400 flex items-center gap-1"><Zap size={10} fill="currentColor"/> XP</span>
                 <span className="text-slate-400">{character.xp}/{character.maxXp}</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner relative">
                 <div className="absolute h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-700 ease-out" style={{ width: `${xpPercent}%` }} />
              </div>
           </div>
        </div>

        {/* Gold */}
        <div className="absolute top-4 right-4 md:static glass-panel px-4 py-2 rounded-full flex items-center gap-2 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <Coins size={20} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
          <span className="text-xl font-black text-yellow-400 font-mono tracking-wide">{character.gold}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;