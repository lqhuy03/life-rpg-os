import React from 'react';
import { Zap, Coins, Heart } from 'lucide-react';
import useGameStore from '../store/gameStore';

const Header = () => {
  const { character } = useGameStore();
  const xpPercent = Math.min(100, (character.xp / character.maxXp) * 100);
  const hpPercent = (character.hp / character.maxHp) * 100;

  return (
    <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 p-4 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white border border-emerald-400 shadow-lg shadow-emerald-500/20">
            {character.level}
          </div>
          <div>
            <h2 className="font-bold text-slate-100">{character.name}</h2>
            <span className="text-xs text-emerald-400 font-mono">LVL {character.level} HERO</span>
          </div>
        </div>

        <div className="flex-1 md:max-w-md flex flex-col gap-2">
           {/* HP Bar */}
           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute h-full bg-red-500 transition-all duration-500" style={{ width: `${hpPercent}%` }} />
           </div>
           {/* XP Bar */}
           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute h-full bg-yellow-400 transition-all duration-500" style={{ width: `${xpPercent}%` }} />
           </div>
           <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>HP {character.hp}/{character.maxHp}</span>
              <span>XP {character.xp}/{character.maxXp}</span>
           </div>
        </div>

        <div className="absolute top-4 right-4 md:static bg-slate-950 border border-yellow-500/30 px-3 py-1 rounded-full flex items-center gap-2">
          <Coins size={16} className="text-yellow-500" />
          <span className="text-yellow-400 font-bold">{character.gold}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;