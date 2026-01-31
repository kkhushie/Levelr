import React from 'react';
import { Button } from './ui/Button';
import { Star, Trophy, ArrowRight } from 'lucide-react';

interface RewardPopupProps {
  xp: number;
  coins: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const RewardPopup: React.FC<RewardPopupProps> = ({ xp, coins, isOpen, onClose, title = "Level Up!", message = "Awesome work!" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white border-b-8 border-[#E6D57A] w-full max-w-xs rounded-[2.5rem] p-8 text-center shadow-2xl transform scale-100 animate-bounce-slight relative overflow-hidden">

        {/* Background confetti effect placeholder */}
        <div className="absolute top-0 left-0 w-full h-32 bg-[#FFEF96]/30 -z-10 rounded-b-[50%]"></div>

        <div className="flex justify-center mb-4">
          <div className="relative">
            <Star size={72} className="text-[#FFEF96] fill-[#FFEF96] animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 animate-ping opacity-50 bg-[#FFEF96] rounded-full blur-xl"></div>
          </div>
        </div>

        <h2 className="font-game text-2xl text-slate-800 mb-2 uppercase">
          {title}
        </h2>
        <p className="text-slate-400 text-sm mb-6 font-bold">{message}</p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <Trophy size={18} className="text-[#CDB4DB]" />
              <span className="text-sm font-bold">XP</span>
            </div>
            <span className="text-slate-800 font-game">+{xp}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 rounded-full bg-[#FFEF96] border-2 border-[#E6D57A]"></div>
              <span className="text-sm font-bold">Coins</span>
            </div>
            <span className="text-slate-800 font-game">+{coins}</span>
          </div>
        </div>

        <Button fullWidth onClick={onClose} variant="primary">
          Continue <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};