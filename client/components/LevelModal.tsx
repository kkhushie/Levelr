import React from 'react';
import { LevelData, LevelStatus } from '../types';
import { Button } from './ui/Button';
import { X, Trophy, Coins, CheckCircle2 } from 'lucide-react';

interface LevelModalProps {
  level: LevelData | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({ level, isOpen, onClose, onComplete }) => {
  if (!isOpen || !level) return null;

  const isCompleted = level.status === LevelStatus.COMPLETED;
  const isLocked = level.status === LevelStatus.LOCKED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-b-4 border-slate-200 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl transform transition-all scale-100">
        
        {/* Header */}
        <div className="relative h-20 bg-[#CDB4DB] flex items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="font-game text-xl text-white mt-2">LEVEL {level.levelNumber}</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          <div className="-mt-12 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 inline-block w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-1">{level.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{level.description}</p>
          </div>

          {/* Rewards Preview */}
          <div className="flex justify-center gap-3">
            <div className="flex flex-col items-center p-3 bg-[#CDB4DB]/10 rounded-2xl border border-[#CDB4DB]/30 min-w-[80px]">
              <Trophy size={20} className="text-[#CDB4DB] mb-1" />
              <span className="text-xs text-slate-400 font-bold uppercase">XP</span>
              <span className="font-bold text-slate-700">+{level.xpReward}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-[#FFEF96]/20 rounded-2xl border border-[#FFEF96] min-w-[80px]">
              <Coins size={20} className="text-orange-300 fill-orange-300 mb-1" />
              <span className="text-xs text-slate-400 font-bold uppercase">Coins</span>
              <span className="font-bold text-slate-700">+{level.coinReward}</span>
            </div>
          </div>

          {/* Action */}
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-[#B5EAD7]/50 py-3 rounded-2xl border border-[#B5EAD7]">
              <CheckCircle2 size={20} />
              Mission Completed
            </div>
          ) : isLocked ? (
             <div className="text-slate-400 text-sm italic py-2 bg-slate-50 rounded-xl">
               Locked. Complete previous levels first.
             </div>
          ) : (
            <Button 
              fullWidth 
              size="lg" 
              onClick={onComplete}
              variant="success"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};