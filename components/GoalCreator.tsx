import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Difficulty, GoalCategory } from '../types';
import { Brain, Dumbbell, Briefcase, Sprout, Layers, Loader2 } from 'lucide-react';

interface GoalCreatorProps {
  onSubmit: (goal: string, category: GoalCategory, difficulty: Difficulty, levels: number) => void;
  isLoading: boolean;
}

export const GoalCreator: React.FC<GoalCreatorProps> = ({ onSubmit, isLoading }) => {
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.PERSONAL);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [levelCount, setLevelCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal, category, difficulty, levelCount);
    }
  };

  const categories = [
    { value: GoalCategory.STUDY, icon: Brain, color: 'text-purple-500' },
    { value: GoalCategory.FITNESS, icon: Dumbbell, color: 'text-blue-500' },
    { value: GoalCategory.WORK, icon: Briefcase, color: 'text-slate-500' },
    { value: GoalCategory.PERSONAL, icon: Sprout, color: 'text-green-500' },
    { value: GoalCategory.PROJECT, icon: Layers, color: 'text-orange-500' },
  ];

  return (
    <div className="max-w-md mx-auto w-full p-6 bg-white border-b-4 border-slate-200 rounded-3xl shadow-xl animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="font-game text-xl text-slate-800 mb-1">
          New Quest
        </h1>
        <p className="text-slate-400 text-sm">Design your next adventure.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
            Goal Name
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Learn Spanish, Run 10k..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
            required
            disabled={isLoading}
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
                  category === cat.value
                    ? 'bg-blue-50 border-[#4361EE] shadow-sm'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <cat.icon size={20} className={`mb-1 ${category === cat.value ? 'text-[#4361EE]' : 'text-slate-300'}`} />
                <span className={`text-[10px] font-bold ${category === cat.value ? 'text-slate-700' : 'text-slate-400'}`}>
                    {cat.value.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty & Length Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 font-bold cursor-pointer"
            >
              {Object.values(Difficulty).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Levels
            </label>
            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
              {[5, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLevelCount(num)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${
                    levelCount === num
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          size="lg" 
          disabled={isLoading || !goal}
          className="mt-4"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} /> Generating...
            </span>
          ) : (
            "Start Adventure 🚀"
          )}
        </Button>
      </form>
    </div>
  );
};