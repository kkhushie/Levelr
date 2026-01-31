import React from 'react';
import { User, Goal } from '../types';
import { Trophy, Coins, ChevronLeft, LogOut, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  user: User | null;
  activeGoal: Goal | null;
  onBack: () => void;
  onLogout: () => void;
  onSettings: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, activeGoal, onBack, onLogout, onSettings }) => {
  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 transition-all">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Left: Navigation or Brand */}
        <div className="flex items-center gap-3">
          {activeGoal ? (
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-slate-200"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:block">MAP</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#4361EE] flex items-center justify-center border-b-4 border-[#3A0CA3]">
                 <span className="font-game text-white text-xs mt-1">L</span>
              </div>
              <span className="font-game text-slate-700 text-sm hidden sm:block">LEVELR</span>
            </div>
          )}
        </div>

        {/* Center: Title */}
        {activeGoal && (
           <h3 className="absolute left-1/2 transform -translate-x-1/2 text-sm font-bold text-slate-700 max-w-[150px] truncate hidden sm:block bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
             {activeGoal.title}
           </h3>
        )}

        {/* Right: Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#FACC15] px-3 py-1.5 rounded-xl border-b-4 border-[#CA8A04] shadow-sm">
             <Coins size={14} className="text-white fill-white" />
             <span className="text-xs font-bold font-mono text-slate-800">{user.stats.coins}</span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-[#4CC9F0] px-3 py-1.5 rounded-xl border-b-4 border-[#0096C7] shadow-sm">
             <Trophy size={14} className="text-white" />
             <span className="text-xs font-bold font-mono text-white">{user.stats.xp}</span>
          </div>

          <button 
            onClick={onSettings}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Settings size={20} />
          </button>

          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};