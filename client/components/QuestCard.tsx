import React from 'react';
import { Goal, GoalCategory } from '../types';
import { Brain, Dumbbell, Briefcase, Sprout, Layers, Play, CheckCircle2 } from 'lucide-react';

interface QuestCardProps {
  goal: Goal;
  onClick: () => void;
}

const CategoryIcons = {
  [GoalCategory.STUDY]: Brain,
  [GoalCategory.FITNESS]: Dumbbell,
  [GoalCategory.WORK]: Briefcase,
  [GoalCategory.PERSONAL]: Sprout,
  [GoalCategory.PROJECT]: Layers,
};

export const QuestCard: React.FC<QuestCardProps> = ({ goal, onClick }) => {
  const Icon = CategoryIcons[goal.category];
  
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col w-full bg-white border border-slate-200 border-b-4 hover:border-b-4 hover:border-[#4361EE] rounded-3xl p-5 text-left transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4 w-full">
        <div className={`p-2.5 rounded-2xl bg-[#F0F9FF] text-[#4361EE] group-hover:bg-[#4361EE] group-hover:text-white transition-colors duration-300`}>
          <Icon size={22} />
        </div>
        
        {goal.isCompleted ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-[#4ADE80] text-white px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} /> Done
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
            Lvl {goal.currentLevel} / {goal.totalLevels}
          </span>
        )}
      </div>

      <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
        {goal.title}
      </h3>
      <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">
        {goal.difficulty} Quest
      </p>

      {/* Progress Bar */}
      <div className="w-[96%] h-3 bg-slate-100 rounded-full overflow-hidden mt-auto border border-slate-100">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${goal.isCompleted ? 'bg-[#4ADE80]' : 'bg-[#4361EE]'}`}
          style={{ width: `${goal.progress}%` }}
        ></div>
      </div>
      
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
        <Play size={24} className="text-[#4361EE] fill-[#4361EE]" />
      </div>
    </button>
  );
};