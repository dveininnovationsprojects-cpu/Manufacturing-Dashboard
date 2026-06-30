import React, { useState, useEffect } from 'react';
import { 
  Sun,
  Moon,
  SlidersHorizontal,
  ArrowRight,
  Grid
} from 'lucide-react';
import PdfViewer from './components/PdfViewer';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import { clearAllPdfsFromDB } from './utils/db';

// 17 Standard Dashboards base configuration
const INITIAL_DASHBOARDS = [
  { id: 1, name: '1 – Executive Command Center', iconName: 'BarChart3', published: false },
  { id: 2, name: '2 – Production Analytics', iconName: 'Activity', published: false },
  { id: 3, name: '3 – Machine Performance', iconName: 'Cpu', published: false },
  { id: 4, name: '4 – Predictive Maintenance', iconName: 'CheckSquare', published: false },
  { id: 5, name: '5 – Quality Intelligence', iconName: 'Clock', published: false },
  { id: 6, name: '6 – Supply Chain Analytics', iconName: 'Truck', published: false },
  { id: 7, name: '7 – Inventory Intelligence', iconName: 'Archive', published: false },
  { id: 8, name: '8 – Financial Analytics', iconName: 'Flame', published: false },
  { id: 9, name: '9 – Workforce Analytics', iconName: 'MapPin', published: false },
  { id: 10, name: '10 – Sustainability Dashboard', iconName: 'Users', published: false },
  { id: 11, name: '11 – Customer Analytics', iconName: 'DollarSign', published: false },
  { id: 12, name: '12 – Logistics Dashboard', iconName: 'ShieldCheck', published: false },
  { id: 13, name: '13 – AI Forecasting', iconName: 'TrendingUp', published: false },
  { id: 14, name: '14 – Root Cause Analysis', iconName: 'AlertTriangle', published: false },
  { id: 15, name: '15 – Real-Time Factory Monitoring', iconName: 'Radio', published: false },
  { id: 16, name: '16 – Drill-Through Analytics', iconName: 'Cpu', published: false },
  { id: 17, name: '17 – AI Insights & Decision Intelligence', iconName: 'BrainCircuit', published: false }
];

export default function App() {
  const [dashboards, setDashboards] = useState(() => {
    const saved = localStorage.getItem('enterprise_dashboards');
    if (!saved) return INITIAL_DASHBOARDS;
    
    // Auto-migrate standard dashboard names if they contain the old name format
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(db => {
        if (db.id <= 17) {
          const foundDefault = INITIAL_DASHBOARDS.find(d => d.id === db.id);
          if (foundDefault) {
            return {
              ...db,
              name: foundDefault.name
            };
          }
        }
        return db;
      });
    } catch {
      return INITIAL_DASHBOARDS;
    }
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState(null);
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
  }, [publishedDashboards, selectedDashboardId]);

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

  // Callback to log out admin
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
    localStorage.removeItem('admin_logged_in');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FAF6EE] to-[#FFFDF9] dark:from-[#0c0c0f] dark:via-[#09090b] dark:to-[#121214] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 flex">
      
      {/* Main content Pane */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Dynamic Navigation Header */}
        <header className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-white/70 dark:bg-[#0c0c0f]/60 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
          <div className="w-full px-6 py-3 flex items-center justify-between gap-4">
            
            {/* Left/Middle Section: Dashboard Horizontal Navigation Tabs */}
            {!isAdminMode && publishedDashboards.length > 0 && (
              <nav className="flex-1 grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[82px] scrollbar-none bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-805/30 mr-4">
                {publishedDashboards.map((db) => {
                  const isSelected = db.id === selectedDashboardId;
                  return (
                    <button
                      key={db.id}
                      onClick={() => setSelectedDashboardId(db.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center truncate ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                          : 'text-zinc-550 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                      title={db.name}
                    >
                      {db.name}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Middle Section: Admin Title (when in Admin mode) */}
            {isAdminMode && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <h1 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-white">
                  System Administrator Console
                </h1>
              </div>
            )}

            {/* Right Section: Theme Toggle and Admin Toggle */}
            <div className="flex items-center gap-3 shrink-0">

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#0c0c0f] text-zinc-550 hover:text-zinc-850 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm cursor-pointer"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* Admin Mode Toggle */}
              <button
                onClick={() => {
                  if (isAdminMode) {
                    setIsAdminMode(false);
                  } else {
                    if (isAdminLoggedIn) {
                      setIsAdminMode(true);
                    } else {
                      setShowLoginModal(true);
                    }
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                  isAdminMode 
                    ? 'bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 border-rose-250/40 hover:bg-rose-100/40' 
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
              onLogout={handleLogout}
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
                  onClick={() => {
                    if (isAdminLoggedIn) {
                      setIsAdminMode(true);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-755 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-550/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Go to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeDashboard ? (
            activeDashboard.pdfType === 'custom' ? (
              /* Render Active Dashboard PDF */
              <PdfViewer 
                dashboardId={selectedDashboardId} 
                dashboardName={activeDashboard.name} 
                pdfType={activeDashboard.pdfType}
                fileName={activeDashboard.fileName}
                fileSize={activeDashboard.fileSize}
              />
            ) : (
              /* Render Default Static Interactive Dashboard UI */
              <Dashboard 
                isDarkMode={isDarkMode} 
                dashboardId={selectedDashboardId} 
                dashboardName={activeDashboard.name} 
              />
            )
          ) : null}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-[#0c0c0f]/40 py-5 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
          <p>© 2026 Enterprise Manufacturing Analytics. Secure administrative data synchronization active.</p>
        </footer>

        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            localStorage.setItem('admin_logged_in', 'true');
            setIsAdminMode(true);
            setShowLoginModal(false);
          }}
        />

      </div>
    </div>
  );
}
