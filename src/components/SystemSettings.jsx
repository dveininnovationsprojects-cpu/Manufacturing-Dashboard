import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function SystemSettings({ dashboards, onRestoreConfig, onResetDefaults }) {
  // General Configurations
  const [orgName, setOrgName] = useState(() => {
    return localStorage.getItem('enterprise_title') || 'Enterprise Analytics';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const [feedback, setFeedback] = useState(null);

  const showFeedbackMsg = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('enterprise_title', orgName);
    
    // Toggle theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Fire event to notify App.jsx brand title
    window.dispatchEvent(new Event('enterpriseTitleChanged'));
    showFeedbackMsg('success', 'System configurations saved successfully.');
  };

  // Export Configurations as JSON file
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dashboards, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dashboard_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedbackMsg('success', 'Backup JSON file downloaded.');
    } catch (err) {
      showFeedbackMsg('error', 'Failed to export backup: ' + err.message);
    }
  };

  // Import Configurations from JSON file
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Validation check for correct dashboard list structure
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].hasOwnProperty('id') && parsed[0].hasOwnProperty('name')) {
          onRestoreConfig(parsed);
          showFeedbackMsg('success', 'Backup restored successfully.');
        } else {
          showFeedbackMsg('error', 'Invalid backup file structure.');
        }
      } catch (err) {
        showFeedbackMsg('error', 'Parsing failed. Make sure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Dashboard Settings
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
          Configure branding, user interface theme, and backup dashboard settings
        </p>
      </div>

      {/* General Settings Card */}
      <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500" />
        
        <form onSubmit={handleSaveSettings} className="space-y-5">
          
          {/* Dashboard Title */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              Dashboard Header / Brand Title
            </label>
            <input 
              type="text" 
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
              required
            />
          </div>

          {/* Theme Settings Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">Dark Mode</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-semibold">
                Toggle between light and dark theme mode for the dashboard interface.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650' : 'bg-rose-50 dark:bg-rose-955/20 text-rose-600'
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
              <span>Save Settings</span>
            </button>
          </div>

        </form>
      </div>

      {/* Backup and Maintenance Card */}
      <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
        
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-950 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4">
          Maintenance & Backups
        </h3>

        <div className="space-y-4">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-semibold">
            Backup your dashboard slot configurations as a JSON file, or restore them from a previous backup.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Backup Anchor Button */}
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Configurations</span>
            </button>

            {/* Restore Selector */}
            <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center">
              <Upload className="w-4 h-4" />
              <span>Import Configurations</span>
              <input 
                type="file" 
                accept="application/json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Reset Defaults */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-rose-200/50 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-955/5 mt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">Factory Reset</span>
              <span className="text-[10px] text-rose-650 dark:text-rose-400 block font-semibold">
                Reset all dashboards configuration back to unpublished defaults.
              </span>
            </div>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to reset all configurations to factory default?')) {
                  onResetDefaults();
                  showFeedbackMsg('success', 'Reset configuration successfully.');
                }
              }}
              className="flex items-center gap-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
