import React, { useEffect, useRef } from 'react';
import { LevelData, LevelStatus } from '../types';
import { Check, Lock, Star } from 'lucide-react';

interface LevelMapProps {
  levels: LevelData[];
  onLevelClick: (level: LevelData) => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ levels, onLevelClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeLevel = levels.find(l => l.status === LevelStatus.UNLOCKED) || levels[levels.length - 1];
      if (activeLevel.levelNumber === 1) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  }, [levels]);

  // Winding path logic
  const getPosition = (index: number) => {
    const ySpacing = 140; 
    const xAmplitude = 90; 
    
    // Bottom up
    const y = (levels.length - 1 - index) * ySpacing + 120;
    
    // Zig-zag sine wave
    const xOffset = Math.sin(index * 1.8) * xAmplitude; 
    
    return { x: `calc(50% + ${xOffset}px)`, y: `${y}px` };
  };

  const totalHeight = levels.length * 140 + 240;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto bg-pastel-bg dot-pattern"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div 
        className="relative w-full mx-auto max-w-md"
        style={{ height: `${totalHeight}px` }}
      >
        {/* Render Path Lines (Dashed Road) */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          {levels.map((_, i) => {
             if (i === levels.length - 1) return null;
             
             const currentY = (levels.length - 1 - i) * 140 + 120;
             const currentXOff = Math.sin(i * 1.8) * 90;
             
             const nextY = (levels.length - 1 - (i + 1)) * 140 + 120;
             const nextXOff = Math.sin((i + 1) * 1.8) * 90;

             const isCompleted = levels[i].status === LevelStatus.COMPLETED && levels[i+1].status !== LevelStatus.LOCKED;
             const strokeColor = isCompleted ? '#4361EE' : '#CBD5E1'; // Blue or Slate

             return (
               <line 
                key={`line-${i}`}
                x1={`calc(50% + ${currentXOff}px)`} 
                y1={currentY + 36} // Center of node (h-18/2 approx 36)
                x2={`calc(50% + ${nextXOff}px)`} 
                y2={nextY + 36}
                stroke={strokeColor} 
                strokeWidth="8" 
                strokeDasharray="16 12"
                strokeLinecap="round"
                className="transition-colors duration-500"
              />
             );
          })}
        </svg>

        {/* Start Label */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 font-game text-xs opacity-50">
          START
        </div>

        {/* Render Nodes */}
        {levels.map((level, i) => {
          const { x, y } = getPosition(i);
          const isLocked = level.status === LevelStatus.LOCKED;
          const isCompleted = level.status === LevelStatus.COMPLETED;
          const isCurrent = level.status === LevelStatus.UNLOCKED;

          // Node Styles
          let bgClass = "bg-white text-slate-300 border-slate-200"; // Locked
          if (isCompleted) bgClass = "bg-[#4ADE80] text-white border-[#16A34A]"; // Green
          if (isCurrent) bgClass = "bg-[#4361EE] text-white border-[#3A0CA3]"; // Vivid Blue

          return (
            <div
              key={level.levelNumber}
              className="absolute transform -translate-x-1/2 flex flex-col items-center group z-10"
              style={{ left: x, top: y }}
            >
              <button
                onClick={() => onLevelClick(level)}
                disabled={isLocked}
                className={`
                  relative w-20 h-20 rounded-2xl flex items-center justify-center 
                  border-b-[6px] transition-all duration-200
                  ${bgClass}
                  ${isLocked ? 'cursor-not-allowed opacity-80' : 'hover:-translate-y-1 hover:brightness-105 active:translate-y-1 active:border-b-0 active:mt-[6px]'}
                  ${isCurrent ? 'animate-bounce-slight shadow-xl shadow-blue-300' : ''}
                `}
              >
                {isLocked && <Lock size={24} />}
                {isCompleted && <Check size={32} strokeWidth={4} />}
                {isCurrent && <span className="font-game text-xl">{level.levelNumber}</span>}
                
                {/* Completion Stars */}
                {isCompleted && (
                   <div className="absolute -top-3 -right-3 text-[#FACC15] drop-shadow-sm bg-white rounded-full p-1 border-2 border-[#FACC15]">
                     <Star size={16} fill="#FACC15" strokeWidth={0} />
                   </div>
                )}
              </button>
              
              {/* Level Title Bubble */}
              <div className={`
                mt-3 px-4 py-2 rounded-xl text-xs font-bold shadow-sm border border-slate-200 max-w-[140px] text-center truncate transition-all bg-white
                ${isCurrent ? 'text-slate-800 scale-105 ring-2 ring-blue-100' : 'text-slate-400'}
                ${isLocked ? 'opacity-50' : 'opacity-100'}
              `}>
                {level.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};