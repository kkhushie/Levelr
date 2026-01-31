import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Goal, LevelData, LevelStatus } from '../types';
import { storageService } from '../services/storageService';
import { LevelMap } from './LevelMap';
import { LevelModal } from './LevelModal'; // We might not need this if we go to detail page directly? 
// The user asked for "separate page for it". 
// Previous LevelModal was a popup. 
// Now we should navigate to `/quest/:id/level/:levelId`.
// So onLevelClick should navigate.

export const QuestView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGoal = async () => {
            if (!id) return;
            try {
                // Ideally getGoal(id)
                // We only have getGoals() returning all.
                const goals = await storageService.getGoals();
                const found = goals.find(g => g.id === id);
                setGoal(found || null);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadGoal();
    }, [id]);

    const handleLevelClick = (level: LevelData) => {
        // Navigate to detail page
        if (level.status === LevelStatus.LOCKED) return;
        navigate(`/quest/${id}/level/${level.levelNumber}`);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this quest? This action cannot be undone.")) {
            return;
        }

        if (goal) {
            await storageService.deleteGoal(goal.id);
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="text-center p-10">Loading map...</div>;
    if (!goal) return <div className="text-center p-10">Quest not found.</div>;

    return (
        <div className="flex-1 relative h-screen bg-pastel-bg flex flex-col">
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-white shadow-sm"
                >
                    &larr; Dashboard
                </button>
            </div>

            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={handleDelete}
                    className="bg-red-50/80 backdrop-blur px-4 py-2 rounded-xl font-bold text-red-500 hover:bg-red-100 shadow-sm flex items-center gap-2"
                >
                    <Trash2 size={18} /> Delete Quest
                </button>
            </div>

            {/* We might want a header tailored for the quest */}

            <LevelMap levels={goal.levels} onLevelClick={handleLevelClick} />

            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFF9F2] to-transparent pointer-events-none"></div>
        </div>
    );
};
