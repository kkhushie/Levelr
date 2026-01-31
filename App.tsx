import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { GoalCreator } from './components/GoalCreator';
import { QuestView } from './components/QuestView';
import { TaskDetailView } from './components/TaskDetailView';
import { DashboardHeader } from './components/DashboardHeader';
import { QuestCard } from './components/QuestCard';
import { Button } from './components/ui/Button';
import { User, Goal } from './types';
import { storageService } from './services/storageService';
import { Plus } from 'lucide-react';

// Wrapper for protected routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.getCurrentUser()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// Dashboard Component (extracted for cleaner Router)
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const u = await storageService.getCurrentUser();
        setUser(u);
        if (u) {
          const g = await storageService.getGoals();
          setGoals(g);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await storageService.logout();
    navigate('/');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-pastel-bg text-slate-700 font-sans flex flex-col dot-pattern">
      <DashboardHeader
        user={user}
        activeGoal={null}
        onBack={() => { }}
        onLogout={handleLogout}
        onSettings={() => { }} // settings modal logic would need to be moved here or global
      // onBack is not really needed in dashboard root
      />

      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full animate-fade-in pt-20">
        <div className="flex items-center justify-between mb-6 mt-4">
          <h2 className="text-xl font-bold font-game text-slate-700">Your Quests</h2>
          <Button size="sm" onClick={() => navigate('/create')}>
            <Plus size={16} className="mr-1" /> New
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-4 border-dashed border-slate-200 rounded-[2rem] bg-white">
            <p className="mb-4 text-sm font-bold">No active quests found.</p>
            <Button onClick={() => navigate('/create')}>Create your first roadmap</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-20">
            {goals.map(goal => (
              <QuestCard
                key={goal.id}
                goal={goal}
                onClick={() => navigate(`/quest/${goal.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Creator Page Wrapper
const CreatorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (title: string, category: any, difficulty: any, levels: number) => {
    // Logic from App.tsx handleCreateGoal
    // For simplicity, we import generateLevelPlan and do it here or inside GoalCreator? 
    // GoalCreator usually just passes data up.
    // Let's implement the logic here quickly.
    setLoading(true);
    try {
      // We need to dynamic import or just use the service
      const { generateLevelPlan } = await import('./services/geminiService');
      const { v4: uuidv4 } = await import('uuid');

      const generatedLevels = await generateLevelPlan(title, category, difficulty, levels);

      const newGoal: Goal = {
        id: uuidv4(),
        title,
        category,
        difficulty,
        totalLevels: levels,
        createdAt: new Date().toISOString(),
        levels: generatedLevels,
        currentLevel: 1,
        progress: 0,
        isCompleted: false
      };

      await storageService.saveGoal(newGoal);
      navigate(`/quest/${newGoal.id}`);

    } catch (e) {
      console.error(e);
      alert("Failed to create quest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-sm text-slate-400 hover:text-slate-600 font-bold flex items-center"
        >
          &larr; Cancel
        </button>
        <GoalCreator onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/auth" element={<AuthWrapper />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/create" element={
          <ProtectedRoute><CreatorPage /></ProtectedRoute>
        } />

        <Route path="/quest/:id" element={
          <ProtectedRoute><QuestView /></ProtectedRoute>
        } />

        <Route path="/quest/:id/level/:levelId" element={
          <ProtectedRoute><TaskDetailView /></ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
};

// Utils Wrappers
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  // Check if user is logged in, redirect to dashboard?
  return <LandingPage onStart={() => navigate('/auth')} onLogin={() => navigate('/auth')} />;
};

const AuthWrapper = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: string, p: string) => {
    setLoading(true);
    try {
      await storageService.login(e, p);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (u: string, e: string, p: string) => {
    setLoading(true);
    try {
      await storageService.register(u, e, p);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <Auth onLogin={handleLogin} onRegister={handleRegister} isLoading={loading} />;
};

export default App;