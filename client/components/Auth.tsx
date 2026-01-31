import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Gamepad2, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
  isLoading: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, isLoading }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      if (email && password) {
        onLogin(email, password);
      }
    } else {
      if (username && email && password) {
        onRegister(username, email, password);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pastel-bg dot-pattern">
      <div className="w-full max-w-md bg-white border-b-4 border-slate-200 p-8 rounded-[2rem] shadow-xl animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#4361EE] border-b-4 border-[#3A0CA3] mb-4 shadow-lg shadow-blue-200 transform -rotate-6">
            <Gamepad2 size={40} className="text-white" />
          </div>
          <h1 className="font-game text-2xl text-slate-800 mb-2">LEVELR</h1>
          <p className="text-slate-500 text-sm font-medium">
            {isLoginMode ? 'Welcome back, Player 1.' : 'Ready to start the game?'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Player Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Hero123"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@guild.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              disabled={isLoading}
              className="group"
            >
              {isLoading ? 'Loading...' : (
                <span className="flex items-center gap-2">
                  {isLoginMode ? 'Enter Portal' : 'Create Character'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setPassword('');
            }}
            className="text-sm text-[#4361EE] hover:text-[#3A0CA3] font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isLoginMode ? (
              <>
                <UserPlus size={16} /> Create New Account
              </>
            ) : (
              <>
                <LogIn size={16} /> Back to Login
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};