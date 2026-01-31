import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Goal, LevelData, LevelStatus } from '../types';
import { storageService } from '../services/storageService';
import { Button } from './ui/Button';
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Clock, Lightbulb, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardPopup } from './RewardPopup';

const MOTIVATIONAL_QUOTES = [
    "Every step counts! 🚀",
    "You're leveling up! 🌟",
    "Keep the momentum going! 🔥",
    "One step closer to greatness! 💎",
    "Victory is yours! 🏆",
    "Unstoppable! ⚡",
    "Great job, keep pushing! 💪",
    "You are a learning machine! 🧠"
];

export const TaskDetailView: React.FC = () => {
    const { id: goalId, levelId } = useParams<{ id: string; levelId: string }>();
    const navigate = useNavigate();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [level, setLevel] = useState<LevelData | null>(null);
    const [loading, setLoading] = useState(true);

    // Checklist State
    const [checklist, setChecklist] = useState<boolean[]>([]);

    // Reward State
    const [showReward, setShowReward] = useState(false);
    const [rewardData, setRewardData] = useState({ xp: 0, coins: 0, title: '', message: '' });

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

                    if (foundLevel) {
                        setLevel(foundLevel);
                        // Init checklist from saved data or default to false
                        if (foundLevel.completedTasks && foundLevel.completedTasks.length === foundLevel.tasks?.length) {
                            setChecklist(foundLevel.completedTasks);
                        } else {
                            setChecklist(new Array(foundLevel.tasks?.length || 0).fill(false));
                        }
                    }
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
        if (!goal || !level) return;

        const newChecklist = [...checklist];
        newChecklist[taskIndex] = !newChecklist[taskIndex];
        setChecklist(newChecklist);

        // Auto-save checklist state
        const updatedLevels = goal.levels.map(l => {
            if (l.levelNumber === level.levelNumber) {
                return { ...l, completedTasks: newChecklist };
            }
            return l;
        });

        const updatedGoal = { ...goal, levels: updatedLevels };
        setGoal(updatedGoal); // Optimistic update
        await storageService.saveGoal(updatedGoal);
    };

    const handleCompleteLevel = async () => {
        if (!goal || !level) return;

        // Calculate rewards and next state
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

        // Save to DB
        await storageService.saveGoal(updatedGoal);

        // Update User Rewards
        const user = await storageService.getCurrentUser();
        const reward = { xp: level.xpReward, coins: level.coinReward };

        // Bonus for quest completion?
        let finalXp = reward.xp;
        let finalCoins = reward.coins;

        if (isLast) {
            finalXp += 500; // Quest Completion Bonus
            finalCoins += 200;
        }

        if (user) {
            const updatedUser = {
                ...user,
                stats: {
                    xp: user.stats.xp + finalXp,
                    coins: user.stats.coins + finalCoins,
                    completedQuests: isLast ? user.stats.completedQuests + 1 : user.stats.completedQuests
                }
            };
            await storageService.updateUser(updatedUser);
        }

        // Show Popup & Confetti for Quest Completion
        if (isLast) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4361EE', '#3A0CA3', '#F72585', '#4CC9F0']
            });
        }

        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

        setRewardData({
            xp: finalXp,
            coins: finalCoins,
            title: isLast ? "Quest Complete!" : "Level Complete!",
            message: isLast ? "You are a legend! Quest finished." : randomQuote
        });
        setShowReward(true);
    };

    const handleRewardClose = () => {
        setShowReward(false);
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
                                    {level.tasks.map((task, idx) => {
                                        const isChecked = checklist[idx] || false;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleToggleTask(idx)}
                                                className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${isChecked ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
                                            >
                                                <div className={`mt-1 transition-colors ${isChecked ? 'text-green-500' : 'text-slate-300'}`}>
                                                    {isChecked ? <CheckCircle size={20} className="fill-green-100" /> : <Circle size={20} />}
                                                </div>
                                                <span className={`leading-snug transition-all ${isChecked ? 'text-green-800 line-through opacity-70' : 'text-slate-600'}`}>
                                                    {task}
                                                </span>
                                            </div>
                                        );
                                    })}
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
                                    <CheckCircle2 /> Mission Accomplished
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

            <RewardPopup
                isOpen={showReward}
                onClose={handleRewardClose}
                xp={rewardData.xp}
                coins={rewardData.coins}
                title={rewardData.title}
                message={rewardData.message}
            />
        </div>
    );
};
