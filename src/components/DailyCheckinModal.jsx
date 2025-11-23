import React from 'react';
import { X, CalendarCheck, Flame, Gift } from 'lucide-react';
import useGameStore from '../store/gameStore';
import Confetti from 'react-confetti'; // Cài đặt: npm install react-confetti

const DailyCheckinModal = () => {
  const { showDailyLoginModal, closeDailyModal, character } = useGameStore();

  if (!showDailyLoginModal) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <Confetti numberOfPieces={200} recycle={false} />
      
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400" />
        
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500 shadow-xl">
            <CalendarCheck size={48} className="text-emerald-400" />
        </div>

        <h2 className="text-3xl font-black text-white mb-2">ĐIỂM DANH HÀNG NGÀY!</h2>
        <p className="text-slate-400 mb-6">Chào mừng trở lại, <strong>{character.name}</strong>!</p>

        <div className="bg-slate-900/50 p-4 rounded-xl mb-6 flex items-center justify-center gap-6 border border-slate-700">
            <div className="text-center">
                <div className="text-xs text-slate-500 uppercase font-bold">Login Streak</div>
                <div className="text-3xl font-black text-orange-500 flex items-center justify-center gap-1">
                    <Flame size={24} fill="currentColor" /> {character.login_streak}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-700"></div>
            <div className="text-center">
                <div className="text-xs text-slate-500 uppercase font-bold">Bonus Hôm Nay</div>
                <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-1">
                    <Gift size={24} /> +50G
                </div>
            </div>
        </div>

        <p className="text-sm text-emerald-400 italic mb-6">
            "Kỷ luật là cầu nối giữa mục tiêu và thành tựu."
        </p>

        <button 
            onClick={closeDailyModal} 
            className="btn-primary w-full py-4 text-lg font-black shadow-xl hover:scale-[1.02] transition-transform"
        >
            NHẬN THƯỞNG & VÀO GAME
        </button>
      </div>
    </div>
  );
};

export default DailyCheckinModal;