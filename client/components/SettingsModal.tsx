import React, { useState } from 'react';
import { Button } from './ui/Button';
import { X, Lock, Save, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onUpdatePassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await onUpdatePassword(newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (e) {
      setError("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-b-4 border-slate-200 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative p-6 border-b border-slate-100 bg-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-[#4361EE]" />
            Security Settings
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all font-bold"
              placeholder="New password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all font-bold"
              placeholder="Confirm new password"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          
          {success ? (
            <div className="bg-green-500/10 text-green-600 text-center py-2 rounded-xl text-sm font-bold border border-green-500/20">
              Password Updated Successfully!
            </div>
          ) : (
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
              className="mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2"><Save size={18} /> Update Password</span>}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};