import React, { useState } from 'react';
import { X, Lock, User, ShieldAlert } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin@123') {
      onLoginSuccess();
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-white/80 dark:bg-zinc-900/85 border border-zinc-200/50 dark:border-zinc-800/60 shadow-2xl rounded-2xl transition-all duration-300">
        
        {/* Decorative Top Border Line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-250 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Form Body */}
        <div className="p-7 space-y-6">
          <div className="text-center space-y-1.5 mt-2">
            <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/10 mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Administrator Authentication
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              Enter credentials to access System Console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30 p-3 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-550/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
            >
              Sign In to Console
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
