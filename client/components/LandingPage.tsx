import React from 'react';
import { Button } from './ui/Button';
import { Gamepad2, Brain, Trophy, Map, ArrowRight, Star, User as UserIcon, CheckCircle2, Sparkles, Heart } from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  onDashboard?: () => void;
  user?: User | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin, onDashboard, user }) => {
  return (
    <div className="min-h-screen flex flex-col bg-pastel-bg text-pastel-text overflow-x-hidden relative dot-pattern font-sans">

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4361EE] border-b-4 border-[#3A0CA3] flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
            <Gamepad2 size={24} className="text-white" />
          </div>
          <span className="font-game text-2xl tracking-tight text-slate-800 hidden sm:block">LEVELR</span>
        </div>

        {user ? (
          <button
            onClick={onDashboard}
            className="flex items-center gap-2 bg-white pl-2 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#4361EE] text-white flex items-center justify-center font-bold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-700 text-sm group-hover:text-[#4361EE] transition-colors max-w-[100px] truncate">
              {user.username}
            </span>
          </button>
        ) : (
          <Button variant="secondary" size="md" onClick={onLogin}>
            Log In
          </Button>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 px-6 text-center z-10 max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[#4361EE] text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in hover:scale-105 transition-transform cursor-crosshair">
          <Star size={12} className="text-[#FACC15] fill-[#FACC15]" />
          Life is an RPG. Start playing.
        </div>

        <h1 className="font-game text-5xl sm:text-7xl leading-tight mb-8 text-slate-800 drop-shadow-sm tracking-tight">
          TURN YOUR GOALS <br /> INTO A <span className="text-[#4361EE] relative inline-block hover:rotate-2 transition-transform cursor-default">
            GAME
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FACC15] opacity-100" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Stop planning, start playing. Levelr uses AI to break your biggest dreams into bite-sized, playable quests.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" onClick={onStart} className="shadow-2xl shadow-blue-400/40 text-lg px-8 py-6 rounded-2xl">
            Start Your Adventure <ArrowRight className="ml-2" />
          </Button>
          {!user && (
            <button onClick={onLogin} className="text-slate-500 font-bold hover:text-[#4361EE] px-6 py-4 rounded-2xl hover:bg-white/50 transition-colors">
              Already have an account?
            </button>
          )}
        </div>

        {/* Floating Mockup Elements (CSS Only) */}
        {/* Floating Mockup Elements (CSS Only) */}
        <div className="relative w-full max-w-4xl mx-auto sm:h-36 hidden md:block mt-10 perspective-1000">

          {/* Background Gradient - Moved behind content */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20 pointer-events-none"></div> */}

          {/* Floating Notifications */}
          <div className="absolute top-0 left-[15%] w-56 h-16 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center p-4 gap-3 animate-bounce-slight z-30">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 shadow-sm"><CheckCircle2 size={18} /></div>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
              <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
            </div>
          </div>

          <div className="absolute top-12 right-[15%] w-64 h-20 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center p-4 gap-4 animate-bounce-slight z-30" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shadow-sm"><Trophy size={24} /></div>
            <div className="flex-1">
              <div className="h-2.5 w-28 bg-slate-200 rounded-full mb-2"></div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-game text-3xl md:text-5xl text-slate-800 mb-6">How It Works</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Gamifying your life is as easy as 1-2-3.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-200 -z-10 border-t-2 border-dashed border-slate-300"></div>

            <StepStep
              number="1"
              title="Dream It"
              desc="Tell Levelr your goal. Learn a language? Get fit? Build an app?"
              icon={<Sparkles size={32} className="text-[#F72585]" />}
            />
            <StepStep
              number="2"
              title="Map It"
              desc="AI instantly generates a custom roadmap with bite-sized levels."
              icon={<Map size={32} className="text-[#4361EE]" />}
            />
            <StepStep
              number="3"
              title="Play It"
              desc="Complete tasks, earn XP, unlock rewards, and level up your life."
              icon={<Gamepad2 size={32} className="text-[#4CC9F0]" />}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-[#4361EE] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
              <div>
                <h3 className="font-game text-3xl mb-4">AI Powered</h3>
                <p className="opacity-90 leading-relaxed text-lg">Our Gemini-powered engine understands context, nuance, and pacing to build the perfect curriculum for you.</p>
              </div>
              <div className="mt-8 flex justify-end">
                <Brain size={64} className="opacity-50" />
              </div>
            </div>

            <FeatureCard
              color="bg-[#A7F3D0]"
              icon={<Map className="text-[#064E3B]" size={28} />}
              title="Visual Roadmaps"
              description="Forget boring lists. Visualize your journey as a vibrant map that grows as you progress."
            />

            <FeatureCard
              color="bg-[#FEF08A]"
              icon={<Trophy className="text-[#854D0E]" size={28} />}
              title="Real Rewards"
              description="Earn XP, coins, and badges. Add accountability and dopmaine to your daily grind."
            />
            <FeatureCard
              color="bg-[#FBCFE8]"
              icon={<Heart className="text-[#BE185D]" size={28} />}
              title="Self Care"
              description="Balanced pacing ensures you stay motivated without burning out."
            />
            <FeatureCard
              color="bg-[#E2E8F0]"
              icon={<UserIcon className="text-[#475569]" size={28} />}
              title="Personalized"
              description="Your journey is unique. Your map should be too. Customize every detail."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 mt-auto relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#4361EE] flex items-center justify-center">
                <Gamepad2 size={18} className="text-white" />
              </div>
              <span className="font-game text-xl tracking-tight">LEVELR</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8">
              Levelr turns self-improvement into a game you actually want to play. Built with love and AI.
            </p>
            <div className="flex gap-4">
              {/* Social Dummies */}
              <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#4361EE] flex items-center justify-center transition-colors cursor-pointer"><span className="font-game">X</span></div>
              <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#4361EE] flex items-center justify-center transition-colors cursor-pointer"><span className="font-game">In</span></div>
              <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#4361EE] flex items-center justify-center transition-colors cursor-pointer"><span className="font-game">Gh</span></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-200">Product</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="hover:text-white cursor-pointer">Roadmap</li>
              <li className="hover:text-white cursor-pointer">Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-200">Company</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="hover:text-white cursor-pointer">About</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Levelr Inc. All rights reserved. Game on.
        </div>
      </footer>

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[2%] animate-float">
          <div className="w-32 h-32 bg-[#4CC9F0] rounded-full opacity-20 blur-3xl"></div>
        </div>
        <div className="absolute top-[40%] right-[5%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-64 h-64 bg-[#F72585] rounded-full opacity-10 blur-3xl"></div>
        </div>
      </div>

    </div>
  );
};

const StepStep = ({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="w-24 h-24 rounded-[2rem] bg-white border-b-8 border-slate-100 flex items-center justify-center shadow-lg mb-6 group-hover:-translate-y-2 transition-transform duration-300 relative">
      <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full text-white font-game flex items-center justify-center border-4 border-pastel-bg z-10">
        {number}
      </div>
      {icon}
    </div>
    <h3 className="font-bold text-xl mb-3 text-slate-800">{title}</h3>
    <p className="text-slate-500 leading-relaxed max-w-xs">{desc}</p>
  </div>
);

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <div className="bg-white border-b-4 border-slate-200 p-8 rounded-[2.5rem] hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl hover:border-[#4361EE]">
    <div className={`mb-6 ${color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner`}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 text-xl mb-3 font-game">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);