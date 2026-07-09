import React, { useState } from 'react';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserProfile() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setFeedback(null);

    const savedPassword = localStorage.getItem('admin_auth_password') || 'admin@123';

    // Verify current password if trying to change it, or if changing username
    if (currentPassword !== savedPassword) {
      setFeedback({ type: 'error', message: 'Current password does not match.' });
      return;
    }

    // Save username
    localStorage.setItem('admin_username', username);

    // Update password if fields are filled
    if (newPassword) {
      if (newPassword.length < 6) {
        setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'New passwords do not match.' });
        return;
      }
      localStorage.setItem('admin_auth_password', newPassword);
    }

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setFeedback({ type: 'success', message: 'Profile credentials updated successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Profile Settings
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
          Update administrator access credentials and security details
        </p>
      </div>

      {/* Main card */}
      <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500" />

        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-800 my-4 pt-4">
            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 block mb-3">Change Password</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-955/20 text-rose-600'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
