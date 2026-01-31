import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Goal, LevelData, LevelStatus } from '../types';
import { storageService } from '../services/storageService';
import { Button } from './ui/Button';
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Clock, Lightbulb } from 'lucide-react';

interface TaskDetailViewProps {
    // If we want to pass props directly, or we can fetch inside.
    // Since we are moving to routing, fetching inside might be safer or we pass activeGoal state if parent has it.
    // For now, let's assume we can fetch goal by ID from the params.
}

export const TaskDetailView: React.FC = () => {
    const { id: goalId, levelId } = useParams<{ id: string; levelId: string }>();
    const navigate = useNavigate();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [level, setLevel] = useState<LevelData | null>(null);
    const [loading, setLoading] = useState(true);

    // Parse levelId to number since it's stored as number
    const levelNum = parseInt(levelId || '0', 10);

    useEffect(() => {
        const loadData = async () => {
            if (!goalId) {
                setLoading(false);
                return;
            }
            try {
                const goals = await storageService.getGoals();
                const foundGoal = goals.find(g => g.id === goalId);
                if (foundGoal) {
                    setGoal(foundGoal);
                    const foundLevel = foundGoal.levels.find(l => l.levelNumber === levelNum);
                    setLevel(foundLevel || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [goalId, levelNum]);

    const handleToggleTask = async (taskIndex: number) => {
        // This is optional complexity: saving "checked" state of sub-tasks.
        // Our data model created "tasks" as string[]. 
        // To support checking, we might need an object { text: string, completed: boolean } or just store state locally.
        // Given the prompt asked for "more detailed and separate page", I'll implement local state first or assume we want to save it?
        // Let's assume for now the user just wants to see the details. 
        // BUT the best PX is to be able to check them off.
        // I can't easily change the DB schema on the fly for deep nested objects without more work.
        // Limit scope: Just show the checklist. 
        // OR: I can modify the goal locally and save it.
        // Let's try to support it by modifying the string to have a prefix like "[x]" or just keep it simple.
        // Actually, let's just make them clickable for satisfaction but maybe not persist granular sub-task state if schema is string[].
        // Wait, I can easily change schema to { text: string, done: boolean } but I already pushed schema code.
        // Let's stick to simple display for this interaction unless I have time to refactor.
        // I'll stick to a simple toggle that reverts on refresh for now (client state), OR persist if I can.
        // Let's just persist the fact that the level is "in progress" or "completed".
    };

    const handleCompleteLevel = async () => {
        if (!goal || !level) return;

        // Logic similar to App.tsx handleCompleteLevel
        // We basically need to call the parent or storage service.
        // Since we are routed, we probably need to replicate the logic or move it to a Context/Store.
        // For MVP, let's replicate the update logic here or just mark it complete and navigate back.

        const updatedLevels = goal.levels.map(l => {
            if (l.levelNumber === level.levelNumber) return { ...l, status: LevelStatus.COMPLETED };
            if (l.levelNumber === level.levelNumber + 1) return { ...l, status: LevelStatus.UNLOCKED };
            return l;
        });

        const isLast = level.levelNumber === goal.totalLevels;
        const progress = Math.round((level.levelNumber / goal.totalLevels) * 100);

        const updatedGoal = {
            ...goal,
            levels: updatedLevels,
            currentLevel: isLast ? goal.totalLevels : level.levelNumber + 1,
            progress: isLast ? 100 : progress,
            isCompleted: isLast
        };

        await storageService.saveGoal(updatedGoal);

        // Also update User XP (would need to fetch user first)
        const user = await storageService.getCurrentUser();
        if (user) {
            const reward = { xp: level.xpReward, coins: level.coinReward };
            const updatedUser = {
                ...user,
                stats: {
                    xp: user.stats.xp + reward.xp,
                    coins: user.stats.coins + reward.coins,
                    completedQuests: isLast ? user.stats.completedQuests + 1 : user.stats.completedQuests
                }
            };
            await storageService.updateUser(updatedUser);
        }

        navigate(`/quest/${goalId}`);
    };

    if (loading) return <div className="p-8 text-center">Loading level details...</div>;
    if (!goal || !level) return <div className="p-8 text-center">Level not found.</div>;

    return (
        <div className="min-h-screen bg-pastel-bg text-slate-700 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <button
                    onClick={() => navigate(`/quest/${goalId}`)}
                    className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-bold"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Map
                </button>

                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-slate-100">
                    {/* Header */}
                    <div className="bg-[#CDB4DB] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                                Level {level.levelNumber}
                            </span>
                            <h1 className="text-3xl font-game mb-2">{level.title}</h1>
                            <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                                {level.estimatedTime && (
                                    <span className="flex items-center gap-1">
                                        <Clock size={16} /> {level.estimatedTime}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    🏆 {level.xpReward} XP
                                </span>
                                <span className="flex items-center gap-1">
                                    🪙 {level.coinReward} Coins
                                </span>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">

                        {/* Description */}
                        <section>
                            <h3 className="text-sm uppercase tracking-wide text-slate-400 font-bold mb-3">Overview</h3>
                            <p className="text-lg leading-relaxed text-slate-700">{level.description}</p>
                        </section>

                        {/* Checklist */}
                        {level.tasks && level.tasks.length > 0 && (
                            <section>
                                <h3 className="text-sm uppercase tracking-wide text-slate-400 font-bold mb-3">Mission Checklist</h3>
                                <div className="space-y-3">
                                    {level.tasks.map((task, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <div className="mt-1 text-slate-300 group-hover:text-[#CDB4DB] transition-colors">
                                                <Circle size={20} />
                                            </div>
                                            <span className="text-slate-600 leading-snug">{task}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Tips */}
                        {level.tips && (
                            <section className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                <Lightbulb className="text-blue-400 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm mb-1">Pro Tip</h4>
                                    <p className="text-blue-800/80 text-sm italic">{level.tips}</p>
                                </div>
                            </section>
                        )}

                        {/* Resources */}
                        {level.resources && level.resources.length > 0 && (
                            <section>
                                <h3 className="text-sm uppercase tracking-wide text-slate-400 font-bold mb-3">Intel & Resources</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {level.resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#CDB4DB] hover:bg-[#CDB4DB]/5 transition-all group"
                                        >
                                            <span className="font-semibold text-slate-700 truncate mr-2">{res.title}</span>
                                            <ExternalLink size={16} className="text-slate-400 group-hover:text-[#CDB4DB]" />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Action */}
                        <div className="pt-4 border-t border-slate-100">
                            {level.status === LevelStatus.COMPLETED ? (
                                <div className="w-full py-4 bg-green-50 text-green-600 font-bold text-center rounded-xl border border-green-200 flex items-center justify-center gap-2">
                                    <CheckCircle2 /> Top Class! Mission Accomplished.
                                </div>
                            ) : (
                                <Button fullWidth size="lg" onClick={handleCompleteLevel}>
                                    Complete Level
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
