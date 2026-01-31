import React from 'react';
import { Button } from './ui/Button';
import { Gamepad2, Brain, Trophy, Map, ArrowRight, Star } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col bg-pastel-bg text-pastel-text overflow-hidden relative dot-pattern">
      
      {/* Navigation */}
      <nav className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4361EE] border-b-4 border-[#3A0CA3] flex items-center justify-center">
             <Gamepad2 size={24} className="text-white" />
          </div>
          <span className="font-game text-xl tracking-tight text-slate-800 hidden sm:block">LEVELR</span>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogin}>
          Log In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 pb-20 pt-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[#4361EE] text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
          <Star size={12} className="text-[#FACC15] fill-[#FACC15]" />
          Life is an RPG. Start playing.
        </div>

        <h1 className="font-game text-4xl sm:text-5xl md:text-6xl leading-tight mb-8 max-w-4xl text-slate-800 drop-shadow-sm">
          TURN YOUR GOALS <br/> INTO A <span className="text-[#4361EE] inline-block transform hover:rotate-2 transition-transform cursor-default">GAME</span>
        </h1>

        <p className="text-slate-500 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
          Levelr uses AI to break your biggest dreams into bite-sized, playable levels. 
          <br/>Unlock rewards, earn XP, and win at life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={onStart} 
            className="shadow-xl shadow-blue-200"
          >
            Start Your Adventure <ArrowRight className="ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full text-left">
          <FeatureCard 
            color="bg-[#BFDBFE]" 
            icon={<Brain className="text-[#1E3A8A]" size={28} />}
            title="AI Strategy"
            description="Our AI breaks down complex goals into achievable missions instantly."
          />
          <FeatureCard 
            color="bg-[#A7F3D0]"
            icon={<Map className="text-[#064E3B]" size={28} />}
            title="Visual Maps"
            description="See your progress on a beautiful game map. One step at a time."
          />
          <FeatureCard 
            color="bg-[#FEF08A]"
            icon={<Trophy className="text-[#854D0E]" size={28} />}
            title="Real Rewards"
            description="Earn XP and coins. Watch your stats grow as you improve."
          />
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] animate-float">
          <div className="w-16 h-16 bg-[#4CC9F0] rounded-full opacity-30 blur-xl"></div>
        </div>
        <div className="absolute bottom-[20%] right-[10%] animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-24 h-24 bg-[#4361EE] rounded-full opacity-20 blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <div className="bg-white border-b-4 border-slate-200 p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300 shadow-sm">
    <div className={`mb-4 ${color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner`}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 text-lg mb-2 font-game text-sm">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </div>
);