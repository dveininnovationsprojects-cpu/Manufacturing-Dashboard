import React, { useState, useEffect } from 'react';
import { 
  Sun,
  Moon,
  FileText,
  Settings,
  LayoutDashboard,
  Radio,
  BrainCircuit,
  BarChart3,
  ShieldAlert,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Database,
  Grid
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import PdfViewer from './components/PdfViewer';
import PowerBiGuide from './components/PowerBiGuide';
import AdminPanel, { ICON_MAP } from './components/AdminPanel';
import { clearAllPdfsFromDB } from './utils/db';

// 17 Standard Dashboards base configuration
const INITIAL_DASHBOARDS = [
  { id: 1, name: '01. Executive Command Center', iconName: 'BarChart3', published: false },
  { id: 2, name: '02. Production Analytics', iconName: 'Activity', published: false },
  { id: 3, name: '03. Machine Efficiency & OEE', iconName: 'Cpu', published: false },
  { id: 4, name: '04. Quality & Defect Analysis', iconName: 'CheckSquare', published: false },
  { id: 5, name: '05. Downtime Tracker', iconName: 'Clock', published: false },
  { id: 6, name: '06. Supply Chain & Logistics', iconName: 'Truck', published: false },
  { id: 7, name: '07. Inventory & Warehouse', iconName: 'Archive', published: false },
  { id: 8, name: '08. Energy & Emissions', iconName: 'Flame', published: false },
  { id: 9, name: '09. Plant Performance', iconName: 'MapPin', published: false },
  { id: 10, name: '10. Operator & Shift Stats', iconName: 'Users', published: false },
  { id: 11, name: '11. Financial Cost & ROI', iconName: 'DollarSign', published: false },
  { id: 12, name: '12. Safety & Compliance', iconName: 'ShieldCheck', published: false },
  { id: 13, name: '13. AI Predictive Forecasting', iconName: 'TrendingUp', published: false },
  { id: 14, name: '14. Anomaly Alerts', iconName: 'AlertTriangle', published: false },
  { id: 15, name: '15. IoT Sensor Monitor', iconName: 'Radio', published: false },
  { id: 16, name: '16. Drill-Through Audit', iconName: 'Cpu', published: false },
  { id: 17, name: '17. AI Decision Support', iconName: 'BrainCircuit', published: false }
];

export default function App() {
  const [dashboards, setDashboards] = useState(() => {
    const saved = localStorage.getItem('enterprise_dashboards');
    return saved ? JSON.parse(saved) : INITIAL_DASHBOARDS;
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState(null);
  const [activeTab, setActiveTab] = useState('pdf');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Synchronize dynamic dashboards list to localStorage
  useEffect(() => {
    localStorage.setItem('enterprise_dashboards', JSON.stringify(dashboards));
  }, [dashboards]);

  // Synchronize HTML dark class for Tailwind
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter published dashboards for the User View
  const publishedDashboards = dashboards.filter(d => d.published);

  // Synchronize selectedDashboardId when published list changes
  useEffect(() => {
    if (publishedDashboards.length > 0) {
      // If currently selected dashboard is no longer published, select the first available one
      const currentStillPublished = publishedDashboards.some(d => d.id === selectedDashboardId);
      if (!selectedDashboardId || !currentStillPublished) {
        setSelectedDashboardId(publishedDashboards[0].id);
      }
    } else {
      setSelectedDashboardId(null);
    }
  }, [dashboards, selectedDashboardId]);

  // Get active dashboard metadata object
  const activeDashboard = publishedDashboards.find(d => d.id === selectedDashboardId);

  // Callback to publish / push a dashboard to live
  const handlePublish = (id, pdfType, fileName, fileSize) => {
    setDashboards(prev => prev.map(db => {
      if (db.id === id) {
        return { 
          ...db, 
          published: true, 
          pdfType, 
          fileName, 
          fileSize,
          pushedAt: new Date().toISOString()
        };
      }
      return db;
    }));
  };

  // Callback to unpublish / delete a dashboard
  const handleUnpublish = (id) => {
    setDashboards(prev => {
      // For custom dashboards (id > 17), delete entirely
      if (id > 17) {
        return prev.filter(db => db.id !== id);
      }
      // For default core 17, mark as unpublished draft
      return prev.map(db => {
        if (db.id === id) {
          return { 
            ...db, 
            published: false, 
            pdfType: undefined, 
            fileName: undefined, 
            fileSize: undefined,
            pushedAt: undefined
          };
        }
        return db;
      });
    });
  };

  // Callback to create a new custom dashboard
  const handleCreateDashboard = (newMeta) => {
    const nextId = Math.max(...dashboards.map(d => d.id), 17) + 1;
    const newDashboard = {
      id: nextId,
      name: newMeta.name,
      iconName: newMeta.iconName,
      pdfType: newMeta.pdfType,
      fileName: newMeta.fileName,
      fileSize: newMeta.fileSize,
      published: newMeta.published,
      pushedAt: new Date().toISOString()
    };

    setDashboards(prev => [...prev, newDashboard]);
    return newDashboard;
  };

  // Callback to rename an existing dashboard
  const handleRenameDashboard = (id, newName) => {
    setDashboards(prev => prev.map(db => {
      if (db.id === id) {
        return { ...db, name: newName };
      }
      return db;
    }));
  };

  // Callback to restore factory defaults
  const handleResetDefaults = async () => {
    // Clear PDFs from IndexedDB
    await clearAllPdfsFromDB();
    // Reset state
    setDashboards(INITIAL_DASHBOARDS);
    localStorage.removeItem('enterprise_dashboards');
    setSelectedDashboardId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 flex">
      
      {/* 1. Left Sidebar - Only visible in User Mode */}
      {!isAdminMode && (
        <aside className="w-72 bg-white dark:bg-[#0c0c0f] border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen fixed left-0 top-0 z-40 transition-colors duration-300">
          
          {/* Logo Section */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-950/10">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-md shadow-blue-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                Enterprise Analytics
              </h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-wider uppercase mt-0.5">
                Manufacturing Systems
              </p>
            </div>
          </div>

          {/* Published Dashboards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Live Dashboards ({publishedDashboards.length})
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {publishedDashboards.length === 0 ? (
              <div className="px-3 py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-950/10 space-y-2 mt-2">
                <Compass className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">No active publications</p>
              </div>
            ) : (
              publishedDashboards.map((db) => {
                const IconComponent = ICON_MAP[db.iconName] || BarChart3;
                const isSelected = db.id === selectedDashboardId;
                return (
                  <button
                    key={db.id}
                    onClick={() => setSelectedDashboardId(db.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    <span className="truncate">{db.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold text-center flex flex-col gap-1 bg-zinc-50/20 dark:bg-zinc-950/5">
            <div>v1.5.0 • Enterprise License</div>
            <div className="text-[8px] font-medium text-zinc-400 dark:text-zinc-650">Local Browser DB Store Active</div>
          </div>
        </aside>
      )}

      {/* 2. Main content Pane */}
      <div className={`flex-1 flex flex-col min-h-screen ${!isAdminMode ? 'pl-72' : ''}`}>
        
        {/* Dynamic Navigation Header */}
        <header className={`border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300`}>
          <div className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Header Title Section */}
            {isAdminMode ? (
              <div className="flex items-center gap-3">
                <div className="bg-rose-500 text-white p-2 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                    System Administrator Console
                  </h1>
                  <p className="text-[10px] text-rose-500 font-extrabold tracking-widest uppercase mt-0.5">
                    Authorized Access Only
                  </p>
                </div>
              </div>
            ) : activeDashboard ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h1 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    {activeDashboard.name}
                  </h1>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                  Dynamic Reporting Console • Pushed Live
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Enterprise Analytics Terminal
                </h1>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-550 font-bold uppercase tracking-wider mt-0.5">
                  Standby Mode • Awaiting Connection
                </p>
              </div>
            )}

            {/* View Indicators (Hidden in Admin Mode) */}
            {!isAdminMode && activeDashboard && (
              <div className="hidden lg:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Sensors Live
                </span>
                <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  AI Models Online
                </span>
              </div>
            )}

            {/* Controls (Tabs, Mode toggle, Admin Toggle) */}
            <div className="flex items-center gap-3 ml-auto sm:ml-0">
              
              {/* Tab Selector (Only when dashboards exist and not in Admin Mode) */}
              {!isAdminMode && activeDashboard && (
                <div className="bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 p-1 rounded-xl flex shadow-sm">
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'pdf'
                        ? 'bg-white dark:bg-zinc-850 text-blue-600 dark:text-blue-450 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Show PDF Embedded view"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">PDF Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('interactive')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'interactive'
                        ? 'bg-white dark:bg-zinc-850 text-blue-600 dark:text-blue-450 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Show native React UI elements & charts"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Interactive Charts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'guide'
                        ? 'bg-white dark:bg-zinc-850 text-blue-600 dark:text-blue-450 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Show Microsoft integration guides"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Embed Guide</span>
                  </button>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#0c0c0f] text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm cursor-pointer"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* Admin Mode Toggle */}
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                  isAdminMode 
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/40 hover:bg-rose-100/40' 
                    : 'bg-white dark:bg-[#0c0c0f] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:text-blue-500'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isAdminMode ? 'Exit Admin View' : 'Admin Console'}</span>
              </button>

            </div>

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {isAdminMode ? (
            /* Render System Admin Console */
            <AdminPanel 
              dashboards={dashboards}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onCreateDashboard={handleCreateDashboard}
              onResetDefaults={handleResetDefaults}
              onRenameDashboard={handleRenameDashboard}
            />
          ) : publishedDashboards.length === 0 ? (
            /* Empty State Landing Page for User Mode */
            <div className="h-full flex items-center justify-center py-12">
              <div className="max-w-xl text-center space-y-6 p-8 glass-panel bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
                {/* Background design elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                {/* Pulsing Central graphic */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-blue-500/10 dark:bg-blue-500/5 rounded-full animate-ping" />
                  <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-xl shadow-blue-500/10">
                    <Grid className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                    🔒 Standby Status
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                    Analytics Console Offline
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed max-w-md mx-auto font-medium">
                    No analytical dashboards are currently published to the live terminal. The portal is ready and waiting for report uploads.
                  </p>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/20 text-left space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Deployment instructions:</h4>
                  <ul className="text-[11px] font-semibold text-zinc-650 dark:text-zinc-450 space-y-1.5 list-disc list-inside">
                    <li>Click the <strong className="text-blue-550 dark:text-blue-400">Admin Console</strong> button at the top-right.</li>
                    <li>Select a dashboard, upload its Power BI PDF file (or choose static path).</li>
                    <li>Click <strong className="text-blue-550 dark:text-blue-400">Push to Live</strong> to publish the page instantly.</li>
                  </ul>
                </div>

                {/* Call-to-action button */}
                <button
                  onClick={() => setIsAdminMode(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-550/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Go to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeDashboard ? (
            /* Render Active Tab Views */
            <>
              {activeTab === 'pdf' && (
                <PdfViewer 
                  dashboardId={selectedDashboardId} 
                  dashboardName={activeDashboard.name} 
                  pdfType={activeDashboard.pdfType}
                  fileName={activeDashboard.fileName}
                  fileSize={activeDashboard.fileSize}
                />
              )}
              {activeTab === 'interactive' && (
                <Dashboard 
                  isDarkMode={isDarkMode} 
                  dashboardId={selectedDashboardId} 
                  dashboardName={activeDashboard.name} 
                />
              )}
              {activeTab === 'guide' && (
                <PowerBiGuide 
                  dashboardId={selectedDashboardId} 
                  dashboardName={activeDashboard.name} 
                />
              )}
            </>
          ) : null}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-[#0c0c0f]/40 py-5 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
          <p>© 2026 Enterprise Manufacturing Analytics. Secure administrative data synchronization active.</p>
        </footer>

      </div>
    </div>
  );
}
