import React, { useState, useEffect } from 'react';
import { 
  Grid,
  Lock,
  User,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';
import PdfViewer from './components/PdfViewer';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import { clearAllPdfsFromDB } from './utils/db';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2050/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><path d="M50 22c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 35c-16.6 0-30 10-30 22.5h60c0-12.5-13.4-22.5-30-22.5z" fill="white" opacity="0.95"/></svg>`;

// 17 Standard Dashboards base configuration
const INITIAL_DASHBOARDS = [
  { id: 1, name: '1 – Executive Command Center', iconName: 'BarChart3', published: true, pdfType: 'static', fileName: 'dashboard_1.pdf', fileSize: 'Static Folder File' },
  { id: 2, name: '2 – Production Analytics', iconName: 'Activity', published: true, pdfType: 'static', fileName: 'dashboard_2.pdf', fileSize: 'Static Folder File' },
  { id: 3, name: '3 – Machine Performance', iconName: 'Cpu', published: true, pdfType: 'static', fileName: 'dashboard_3.pdf', fileSize: 'Static Folder File' },
  { id: 4, name: '4 – Predictive Maintenance', iconName: 'CheckSquare', published: true, pdfType: 'static', fileName: 'dashboard_4.pdf', fileSize: 'Static Folder File' },
  { id: 5, name: '5 – Quality Intelligence', iconName: 'Clock', published: true, pdfType: 'static', fileName: 'dashboard_5.pdf', fileSize: 'Static Folder File' },
  { id: 6, name: '6 – Supply Chain Analytics', iconName: 'Truck', published: true, pdfType: 'static', fileName: 'dashboard_6.pdf', fileSize: 'Static Folder File' },
  { id: 7, name: '7 – Inventory Intelligence', iconName: 'Archive', published: true, pdfType: 'static', fileName: 'dashboard_7.pdf', fileSize: 'Static Folder File' },
  { id: 8, name: '8 – Financial Analytics', iconName: 'Flame', published: true, pdfType: 'static', fileName: 'dashboard_8.pdf', fileSize: 'Static Folder File' },
  { id: 9, name: '9 – Workforce Analytics', iconName: 'MapPin', published: true, pdfType: 'static', fileName: 'dashboard_9.pdf', fileSize: 'Static Folder File' },
  { id: 10, name: '10 – Sustainability Dashboard', iconName: 'Users', published: true, pdfType: 'static', fileName: 'dashboard_10.pdf', fileSize: 'Static Folder File' },
  { id: 11, name: '11 – Customer Analytics', iconName: 'DollarSign', published: true, pdfType: 'static', fileName: 'dashboard_11.pdf', fileSize: 'Static Folder File' },
  { id: 12, name: '12 – Logistics Dashboard', iconName: 'ShieldCheck', published: true, pdfType: 'static', fileName: 'dashboard_12.pdf', fileSize: 'Static Folder File' },
  { id: 13, name: '13 – AI Forecasting', iconName: 'TrendingUp', published: true, pdfType: 'static', fileName: 'dashboard_13.pdf', fileSize: 'Static Folder File' },
  { id: 14, name: '14 – Root Cause Analysis', iconName: 'AlertTriangle', published: true, pdfType: 'static', fileName: 'dashboard_14.pdf', fileSize: 'Static Folder File' },
  { id: 15, name: '15 – Real-Time Factory Monitoring', iconName: 'Radio', published: true, pdfType: 'static', fileName: 'dashboard_15.pdf', fileSize: 'Static Folder File' },
  { id: 16, name: '16 – Drill-Through Analytics', iconName: 'Cpu', published: true, pdfType: 'static', fileName: 'dashboard_16.pdf', fileSize: 'Static Folder File' },
  { id: 17, name: '17 – AI Insights & Decision Intelligence', iconName: 'BrainCircuit', published: true, pdfType: 'static', fileName: 'dashboard_17.pdf', fileSize: 'Static Folder File' }
];

export default function App() {
  const [dashboards, setDashboards] = useState(INITIAL_DASHBOARDS);
  const [activePage, setActivePage] = useState('admin');
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('admin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved profile:", e);
      }
    }
    return {
      fullName: 'Sara Chen',
      email: 'sara@dvein.com',
      status: 'Active',
      joinedDate: 'March 10, 2023',
      about: 'HR executives and Financial operations',
      specializations: ['HR', 'Management', 'Finance', 'operation'],
      phone: '1234567890',
      linkedin: 'sara-chen',
      github: 'sarachen',
      avatar: '',
      coursesTaught: 1,
      totalStudents: 32,
      experience: '4 yrs',
      skillsCount: 4
    };
  });

  useEffect(() => {
    localStorage.setItem('admin_profile', JSON.stringify(profile));
  }, [profile]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [selectedDashboardId, setSelectedDashboardId] = useState(null);
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [enterpriseTitle, setEnterpriseTitle] = useState(() => {
    return localStorage.getItem('enterprise_title') || 'Enterprise Analytics';
  });

  useEffect(() => {
    const handleTitleChange = () => {
      setEnterpriseTitle(localStorage.getItem('enterprise_title') || 'Enterprise Analytics');
    };
    window.addEventListener('enterpriseTitleChanged', handleTitleChange);
    return () => window.removeEventListener('enterpriseTitleChanged', handleTitleChange);
  }, []);

  // Sync theme setting on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleRestoreConfig = (restoredList) => {
    setDashboards(restoredList);
    syncDashboardsToCloud(restoredList);
  };

  // Synchronize dynamic dashboards list from Firebase Firestore on mount and auto-initialize if blank
  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(doc(db, "dashboard_settings", "state"), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().list;
        if (Array.isArray(data) && data.length > 0) {
          setDashboards(data);
        }
      } else {
        try {
          await setDoc(doc(db, "dashboard_settings", "state"), {
            list: INITIAL_DASHBOARDS,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Failed to initialize Firestore document: ", e);
        }
      }
    }, (err) => {
      console.warn("Firebase Firestore listener failed: ", err);
    });

    return () => unsub();
  }, []);

  // Helper to synchronize local updates with Firebase Firestore
  const syncDashboardsToCloud = async (updatedList) => {
    if (!db) return;
    try {
      await setDoc(doc(db, "dashboard_settings", "state"), {
        list: updatedList,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Failed to sync updated dashboards to Firebase Firestore:", e);
    }
  };

  // Filter published dashboards for the User View
  const publishedDashboards = dashboards.filter(d => d.published);

  // Synchronize selectedDashboardId when published list changes
  useEffect(() => {
    if (publishedDashboards.length > 0) {
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
    const updated = dashboards.map(db => {
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
    });
    setDashboards(updated);
    syncDashboardsToCloud(updated);
  };

  // Callback to unpublish / delete a dashboard
  const handleUnpublish = (id) => {
    let updated;
    if (id > 17) {
      updated = dashboards.filter(db => db.id !== id);
    } else {
      updated = dashboards.map(db => {
        if (db.id === id) {
          return {
            ...db,
            published: false,
            pdfType: null,
            fileName: null,
            fileSize: null,
            pushedAt: null
          };
        }
        return db;
      });
    }
    setDashboards(updated);
    syncDashboardsToCloud(updated);
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

    const updated = [...dashboards, newDashboard];
    setDashboards(updated);
    syncDashboardsToCloud(updated);
    return newDashboard;
  };

  // Callback to rename an existing dashboard
  const handleRenameDashboard = (id, newName) => {
    const updated = dashboards.map(db => {
      if (db.id === id) {
        return { ...db, name: newName };
      }
      return db;
    });
    setDashboards(updated);
    syncDashboardsToCloud(updated);
  };

  // Callback to restore factory defaults
  const handleResetDefaults = async () => {
    await clearAllPdfsFromDB();
    setDashboards(INITIAL_DASHBOARDS);
    setSelectedDashboardId(null);
    syncDashboardsToCloud(INITIAL_DASHBOARDS);
  };

  // Callback to log out admin
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const savedUsername = localStorage.getItem('admin_username') || 'admin';
    const savedPassword = localStorage.getItem('admin_auth_password') || 'admin@123';

    if (username === savedUsername && password === savedPassword) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
      setActivePage('admin');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  // 1. Login Guard View
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FAF6EE] to-[#FFFDF9] dark:from-[#0c0c0f] dark:via-[#09090b] dark:to-[#121214] text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md overflow-hidden bg-white/80 dark:bg-zinc-900/85 border border-zinc-200/50 dark:border-zinc-800/60 shadow-2xl rounded-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div className="p-7 space-y-6">
            <div className="text-center space-y-1.5 mt-2">
              <div className="relative inline-flex mb-2">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Admin Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-850 shadow-md"
                  />
                ) : (
                  <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/10">
                    <Lock className="w-5 h-5" />
                  </div>
                )}
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                {profile.avatar ? `Welcome back, ${profile.fullName}` : 'Enterprise Analytics Login'}
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
                Enter credentials to access System Console
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
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

              {loginError && (
                <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-200/40 dark:border-rose-900/30 p-3 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-550/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin Console View (Sidebar Layout)
  if (activePage === 'admin' || activePage === 'profile') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0c0c0f] text-zinc-900 dark:text-zinc-550 flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-zinc-950 text-zinc-300 border-r border-zinc-800 flex flex-col justify-between p-5 shrink-0 select-none">
          <div className="space-y-6">
            {/* Logo / Header */}
            <div className="px-2 py-3 border-b border-zinc-800">
              <h2 className="text-[11px] font-extrabold tracking-wider uppercase text-white truncate" title={enterpriseTitle}>
                {enterpriseTitle}
              </h2>
            </div>

            {/* Sidebar Tabs */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActivePage('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 'admin'
                    ? 'bg-white text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
              <button
                onClick={() => setActivePage('dashboards')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 'dashboards'
                    ? 'bg-white text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Dashboards</span>
              </button>
              <button
                onClick={() => setActivePage('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 'profile'
                    ? 'bg-white text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Bottom Profile Card & Logout */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={profile.avatar || DEFAULT_AVATAR}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">{profile.fullName}</p>
                <p className="text-[9px] text-zinc-400 font-semibold truncate">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-rose-400 hover:text-rose-350 hover:bg-rose-955/20 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-gradient-to-br from-[#FAF8F5] via-[#FAF6EE] to-[#FFFDF9] dark:from-[#0c0c0f] dark:via-[#09090b] dark:to-[#121214]">
          <main className="flex-1 p-6">
            {activePage === 'admin' && (
              <AdminPanel
                dashboards={dashboards}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onCreateDashboard={handleCreateDashboard}
                onResetDefaults={handleResetDefaults}
                onRenameDashboard={handleRenameDashboard}
                onLogout={handleLogout}
              />
            )}
            {activePage === 'profile' && (
              <UserProfile 
                profile={profile} 
                onUpdateProfile={setProfile} 
                onLogout={handleLogout} 
              />
            )}
          </main>
          
          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-[#0c0c0f]/40 py-5 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-555 shrink-0">
            <p>© 2026 Enterprise Manufacturing Analytics. Secure administrative data synchronization active.</p>
          </footer>
        </div>
      </div>
    );
  }

  // 3. User Dashboards View (No Sidebar, Header Navigation with Back Button)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FAF6EE] to-[#FFFDF9] dark:from-[#0c0c0f] dark:via-[#09090b] dark:to-[#121214] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 flex">
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Dashboards Header */}
        <header className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-white/70 dark:bg-[#0c0c0f]/60 backdrop-blur-md sticky top-0 z-30 transition-colors duration-305 flex items-center justify-between px-6 py-4.5 gap-4">
          
          {/* Back button on the left */}
          <button
            onClick={() => setActivePage('admin')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border bg-white dark:bg-[#0c0c0f] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:text-blue-550 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Console</span>
          </button>

          {/* Right side: Capsules Navigation Bar */}
          {publishedDashboards.length > 0 && (
            <nav className="flex-1 grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[82px] scrollbar-none bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-805/30 ml-4 max-w-4xl">
              {publishedDashboards.map((db) => {
                const isSelected = db.id === selectedDashboardId;
                return (
                  <button
                    key={db.id}
                    onClick={() => setSelectedDashboardId(db.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-955 shadow-sm'
                        : 'text-zinc-555 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                    title={db.name}
                  >
                    {db.name}
                  </button>
                );
              })}
            </nav>
          )}

        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {publishedDashboards.length === 0 ? (
            <div className="h-full flex items-center justify-center py-12">
              <div className="max-w-xl text-center space-y-6 p-8 glass-panel bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-blue-500/10 dark:bg-blue-500/5 rounded-full animate-ping" />
                  <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-xl shadow-blue-500/10">
                    <Grid className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                    Standby Status
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                    Analytics Console Offline
                  </h2>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed max-w-md mx-auto font-medium">
                    No analytical dashboards are currently published to the live terminal. The portal is ready and waiting for report uploads.
                  </p>
                </div>
              </div>
            </div>
          ) : activeDashboard ? (
            /* Render Active Dashboard PDF */
            <PdfViewer
              dashboardId={selectedDashboardId}
              dashboardName={activeDashboard.name}
              pdfType={activeDashboard.pdfType}
              fileName={activeDashboard.fileName}
              fileSize={activeDashboard.fileSize}
            />
          ) : null}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-[#0c0c0f]/40 py-5 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-550">
          <p>© 2026 Enterprise Manufacturing Analytics. Secure administrative data synchronization active.</p>
        </footer>

      </div>
    </div>
  );
}
