import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Check, 
  X,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Eye,
  Activity,
  BarChart3,
  Cpu,
  CheckSquare,
  Clock,
  Truck,
  Archive,
  Flame,
  MapPin,
  Users,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Radio,
  BrainCircuit,
  Settings
} from 'lucide-react';
import { savePdfToDB, deletePdfFromDB } from '../utils/db';

// Map icon strings to Lucide components for dynamic rendering
export const ICON_MAP = {
  BarChart3,
  Activity,
  Cpu,
  CheckSquare,
  Clock,
  Truck,
  Archive,
  Flame,
  MapPin,
  Users,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Radio,
  BrainCircuit
};

export default function AdminPanel({ 
  dashboards, 
  onPublish, 
  onUnpublish, 
  onCreateDashboard, 
  onResetDefaults, 
  onRenameDashboard 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, live, draft
  
  // Custom dashboard form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [newDashIcon, setNewDashIcon] = useState('BarChart3');
  const [newDashPdfType, setNewDashPdfType] = useState('static'); // static or upload
  const [newDashFile, setNewDashFile] = useState(null);
  const [newDashError, setNewDashError] = useState('');

  // Dashboard-specific edits/uploads states
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [pendingUploads, setPendingUploads] = useState({}); // dashboardId -> File object
  const [useStaticFallback, setUseStaticFallback] = useState({}); // dashboardId -> boolean
  const [actionFeedback, setActionFeedback] = useState(null); // { type: 'success'|'error', message: '' }

  // Set alert feedback helper
  const showFeedback = (type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Handle custom dashboard file select
  const handleNewDashFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewDashFile(file);
      setNewDashError('');
    } else {
      setNewDashFile(null);
      setNewDashError('Please select a valid PDF file.');
    }
  };

  // Handle new custom dashboard creation
  const handleCreateDashboard = async (e) => {
    e.preventDefault();
    setNewDashError('');

    if (!newDashName.trim()) {
      setNewDashError('Dashboard name is required.');
      return;
    }

    if (newDashPdfType === 'upload' && !newDashFile) {
      setNewDashError('Please upload a PDF file for the dashboard.');
      return;
    }

    try {
      // 1. Trigger App.jsx callback to create record in localStorage
      const newDashboard = onCreateDashboard({
        name: newDashName.trim(),
        iconName: newDashIcon,
        pdfType: newDashPdfType,
        fileName: newDashPdfType === 'upload' ? newDashFile.name : `custom_${Date.now()}.pdf`,
        fileSize: newDashPdfType === 'upload' ? `${(newDashFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Static System File',
        published: true // Publish immediately on creation
      });

      // 2. If uploading file, save it to IndexedDB
      if (newDashPdfType === 'upload' && newDashFile) {
        await savePdfToDB(newDashboard.id, newDashFile);
      }

      // Reset form
      setNewDashName('');
      setNewDashIcon('BarChart3');
      setNewDashPdfType('static');
      setNewDashFile(null);
      setShowCreateForm(false);
      showFeedback('success', `Successfully created and published "${newDashboard.name}"!`);
    } catch (err) {
      console.error(err);
      setNewDashError('Failed to save dashboard. ' + err.message);
    }
  };

  // Handles staging a file for upload on an existing dashboard
  const handleFileChange = (dashboardId, e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPendingUploads(prev => ({
        ...prev,
        [dashboardId]: file
      }));
      // turn off static fallback if they pick a file
      setUseStaticFallback(prev => ({
        ...prev,
        [dashboardId]: false
      }));
    } else {
      showFeedback('error', 'Please select a valid PDF file only.');
    }
  };

  // Handle publishing a dashboard
  const handlePublish = async (db) => {
    const file = pendingUploads[db.id];
    const isStatic = useStaticFallback[db.id] || db.pdfType === 'static' || (!file && !db.fileName);

    if (!file && isStatic && db.id > 17) {
      showFeedback('error', 'Custom dashboards require an uploaded PDF.');
      return;
    }

    try {
      let fileName = db.fileName || '';
      let fileSize = db.fileSize || '';

      if (file) {
        // Save uploaded PDF to IndexedDB
        await savePdfToDB(db.id, file);
        fileName = file.name;
        fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        onPublish(db.id, 'custom', fileName, fileSize);
      } else {
        // Using static file path
        fileName = db.id === 2 ? 'dashboard.pdf' : `dashboard_${db.id}.pdf`;
        fileSize = 'Static Folder File';
        onPublish(db.id, 'static', fileName, fileSize);
      }

      // Clear pending upload state
      setPendingUploads(prev => {
        const updated = { ...prev };
        delete updated[db.id];
        return updated;
      });

      showFeedback('success', `Pushed "${db.name}" to Live Dashboard view!`);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Failed to publish: ' + err.message);
    }
  };

  // Handle unpublishing/deleting a dashboard
  const handleUnpublish = async (db) => {
    try {
      // 1. Delete PDF blob from IndexedDB if it was custom
      if (db.pdfType === 'custom') {
        await deletePdfFromDB(db.id);
      }

      // 2. Trigger parent unpublish (also deletes custom dashboard if id > 17)
      onUnpublish(db.id);
      
      // Clear pending uploads for this id
      setPendingUploads(prev => {
        const updated = { ...prev };
        delete updated[db.id];
        return updated;
      });

      showFeedback('success', `Unpublished and deleted "${db.name}" configuration.`);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Failed to unpublish: ' + err.message);
    }
  };

  // Handle renaming action
  const startEditing = (db) => {
    setEditingId(db.id);
    setEditName(db.name);
  };

  const saveRename = (id) => {
    if (editName.trim()) {
      onRenameDashboard(id, editName.trim());
      setEditingId(null);
      showFeedback('success', 'Dashboard renamed successfully.');
    }
  };

  // Stats calculation
  const totalCount = dashboards.length;
  const liveCount = dashboards.filter(d => d.published).length;
  const draftCount = totalCount - liveCount;

  // Filtered list
  const filteredDashboards = dashboards.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(db.id).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' ? true :
                          statusFilter === 'live' ? db.published : !db.published;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Alert Banner */}
      {actionFeedback && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl animate-bounce ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-250 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-250 dark:border-rose-800'
        }`}>
          {actionFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-bold">{actionFeedback.message}</span>
        </div>
      )}

      {/* 2. Admin Quick Stats Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-blue-500 bg-white/60 dark:bg-[#0c0c0f]/60">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Dashboards</span>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1 block">{totalCount}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-emerald-500 bg-white/60 dark:bg-[#0c0c0f]/60">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Live on User View</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{liveCount}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-zinc-400 bg-white/60 dark:bg-[#0c0c0f]/60">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Draft / Hidden</span>
            <span className="text-2xl font-extrabold text-zinc-550 dark:text-zinc-400 mt-1 block">{draftCount}</span>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-xl text-zinc-500 dark:text-zinc-400">
            <Settings className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-amber-500 bg-white/60 dark:bg-[#0c0c0f]/60">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Local Storage DB</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 block">IndexedDB Active</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
        
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search dashboards by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Status Tabs */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg flex w-full sm:w-auto">
            {['all', 'live', 'draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-450 shadow-sm'
                    : 'text-zinc-555 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to reset all dashboards to factory default unpublished state? This will delete all custom dashboards and uploaded files.')) {
                onResetDefaults();
                showFeedback('success', 'Reset completed. All dashboards set back to unpublished draft.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
            title="Reset all settings to initial defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Factory Reset</span>
          </button>
          
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showCreateForm ? 'Close Form' : 'New Custom Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* 4. New Custom Dashboard Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateDashboard} className="glass-panel p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-l-4 border-blue-600 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Create Custom Dashboard
            </h3>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Instantly Publishes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Name & Icon */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Dashboard Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. 18. Logistics & Fleet Overview"
                  value={newDashName}
                  onChange={(e) => setNewDashName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Sidebar Icon</label>
                <select 
                  value={newDashIcon}
                  onChange={(e) => setNewDashIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition-all font-bold"
                >
                  {Object.keys(ICON_MAP).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. PDF Selection Type */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">PDF Configuration</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewDashPdfType('upload'); setNewDashFile(null); }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      newDashPdfType === 'upload'
                        ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    Upload Custom PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewDashPdfType('static'); setNewDashFile(null); }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      newDashPdfType === 'static'
                        ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    Public folder path
                  </button>
                </div>
              </div>

              {newDashPdfType === 'static' && (
                <div className="bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  System will automatically attempt to load the static file <code className="text-rose-500 font-mono">/dashboard_[id].pdf</code> inside the public folder.
                </div>
              )}
            </div>

            {/* 3. Uploader zone */}
            <div className="flex flex-col justify-end">
              {newDashPdfType === 'upload' ? (
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Select PDF</label>
                  <label className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block">
                      {newDashFile ? newDashFile.name : 'Choose File'}
                    </span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleNewDashFileChange}
                      className="hidden" 
                    />
                  </label>
                </div>
              ) : (
                <div className="bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 p-3 rounded-lg text-[10px] text-blue-650 dark:text-blue-450 leading-relaxed font-semibold">
                  <strong>Note:</strong> Make sure you have placed the PDF in the project's public folder and renamed it appropriately.
                </div>
              )}

              <div className="mt-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow transition-all cursor-pointer"
                >
                  Create & Push Live
                </button>
              </div>
            </div>

          </div>

          {newDashError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-2.5 rounded-lg text-xs font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{newDashError}</span>
            </div>
          )}
        </form>
      )}

      {/* 5. Dashboards Management List */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-zinc-50/80 dark:bg-zinc-950/30 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <div className="col-span-1">ID</div>
          <div className="col-span-3">Dashboard Info</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-4">Configuration & Files</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Content */}
        {filteredDashboards.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-450 text-xs font-bold">
            No dashboards match your criteria. Try adjusting the search query or status filter.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredDashboards.map((db) => {
              const IconComponent = ICON_MAP[db.iconName] || ICON_MAP.BarChart3;
              const isEditing = editingId === db.id;
              const isLive = db.published;
              const stagedFile = pendingUploads[db.id];
              const staticToggled = useStaticFallback[db.id] || false;

              return (
                <div key={db.id} className="grid grid-cols-12 items-center px-6 py-4.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                  
                  {/* ID */}
                  <div className="col-span-1 text-xs font-bold text-zinc-400 dark:text-zinc-650 font-mono">
                    #{db.id}
                  </div>

                  {/* Dashboard Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${isLive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 text-xs font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded focus:outline-none"
                        />
                        <button 
                          onClick={() => saveRename(db.id)}
                          className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-zinc-400 text-white hover:bg-zinc-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">{db.name}</span>
                        <button 
                          onClick={() => startEditing(db)}
                          className="text-[10px] text-blue-500 hover:text-blue-600 hover:underline font-bold mt-0.5 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Rename</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live / Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        Draft / Hidden
                      </span>
                    )}
                  </div>

                  {/* Configuration & Files */}
                  <div className="col-span-4 space-y-1.5">
                    {/* Current File Meta */}
                    {isLive ? (
                      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-450 shrink-0" />
                        <span className="truncate max-w-[200px]" title={db.fileName}>
                          {db.fileName || 'Static Dashboard File'}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                          ({db.fileSize || 'Static'})
                        </span>
                      </div>
                    ) : (
                      /* Draft Controls: select file or toggle static fallback */
                      <div className="space-y-2">
                        {/* Static Toggle (Only for core 17 dashboards) */}
                        {db.id <= 17 && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={staticToggled}
                              onChange={(e) => setUseStaticFallback(prev => ({
                                ...prev,
                                [db.id]: e.target.checked
                              }))}
                              className="rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400">
                              Use default static file (<code className="font-mono text-zinc-450">{db.id === 2 ? 'dashboard.pdf' : `dashboard_${db.id}.pdf`}</code>)
                            </span>
                          </label>
                        )}

                        {/* Custom PDF Upload Zone */}
                        {!staticToggled && (
                          <div className="flex items-center gap-2">
                            <label className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-950/20 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-500">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{stagedFile ? 'Change PDF' : 'Upload PDF Dashboard'}</span>
                              <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={(e) => handleFileChange(db.id, e)} 
                                className="hidden" 
                              />
                            </label>
                            
                            {stagedFile && (
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold truncate max-w-[150px]" title={stagedFile.name}>
                                {stagedFile.name} ({(stagedFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-right">
                    {isLive ? (
                      <button 
                        onClick={() => handleUnpublish(db)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        title={db.id > 17 ? "Delete custom dashboard completely" : "Unpublish to draft"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{db.id > 17 ? 'Delete' : 'Unpublish'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePublish(db)}
                        disabled={!stagedFile && !staticToggled && db.id > 17}
                        className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          stagedFile || staticToggled || db.id <= 17
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Push to Live</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
