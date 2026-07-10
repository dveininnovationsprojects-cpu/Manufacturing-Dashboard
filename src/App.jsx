import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Grid,
  Lock,
  User,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  SlidersHorizontal,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  Maximize,
  Minimize,
  Tv,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Trash2,
  History,
  Calendar,
  Palette
}

from 'lucide-react';
import PdfViewer from './components/PdfViewer';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import SystemSettings from './components/SystemSettings';
import { clearAllPdfsFromDB, getPdfFromDB } from './utils/db';
import { PDFDocument } from 'pdf-lib';
import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

// 17 Standard Dashboards base configuration
const INITIAL_DASHBOARDS = [
  { id: 1, name: '1  Executive Command Center', iconName: 'BarChart3', published: true, pdfType: 'static', fileName: 'dashboard_1.pdf', fileSize: 'Static Folder File' },
  { id: 2, name: '2  Production Analytics', iconName: 'Activity', published: true, pdfType: 'static', fileName: 'dashboard_2.pdf', fileSize: 'Static Folder File' },
  { id: 3, name: '3  Machine Performance', iconName: 'Cpu', published: true, pdfType: 'static', fileName: 'dashboard_3.pdf', fileSize: 'Static Folder File' },
  { id: 4, name: '4  Predictive Maintenance', iconName: 'CheckSquare', published: true, pdfType: 'static', fileName: 'dashboard_4.pdf', fileSize: 'Static Folder File' },
  { id: 5, name: '5  Quality Intelligence', iconName: 'Clock', published: true, pdfType: 'static', fileName: 'dashboard_5.pdf', fileSize: 'Static Folder File' },
  { id: 6, name: '6  Supply Chain Analytics', iconName: 'Truck', published: true, pdfType: 'static', fileName: 'dashboard_6.pdf', fileSize: 'Static Folder File' },
  { id: 7, name: '7  Inventory Intelligence', iconName: 'Archive', published: true, pdfType: 'static', fileName: 'dashboard_7.pdf', fileSize: 'Static Folder File' },
  { id: 8, name: '8  Financial Analytics', iconName: 'Flame', published: true, pdfType: 'static', fileName: 'dashboard_8.pdf', fileSize: 'Static Folder File' },
  { id: 9, name: '9  Workforce Analytics', iconName: 'MapPin', published: true, pdfType: 'static', fileName: 'dashboard_9.pdf', fileSize: 'Static Folder File' },
  { id: 10, name: '10  Sustainability Dashboard', iconName: 'Users', published: true, pdfType: 'static', fileName: 'dashboard_10.pdf', fileSize: 'Static Folder File' },
  { id: 11, name: '11  Customer Analytics', iconName: 'DollarSign', published: true, pdfType: 'static', fileName: 'dashboard_11.pdf', fileSize: 'Static Folder File' },
  { id: 12, name: '12  Logistics Dashboard', iconName: 'ShieldCheck', published: true, pdfType: 'static', fileName: 'dashboard_12.pdf', fileSize: 'Static Folder File' },
  { id: 13, name: '13  AI Forecasting', iconName: 'TrendingUp', published: true, pdfType: 'static', fileName: 'dashboard_13.pdf', fileSize: 'Static Folder File' },
  { id: 14, name: '14  Root Cause Analysis', iconName: 'AlertTriangle', published: true, pdfType: 'static', fileName: 'dashboard_14.pdf', fileSize: 'Static Folder File' },
  { id: 15, name: '15  Real-Time Factory Monitoring', iconName: 'Radio', published: true, pdfType: 'static', fileName: 'dashboard_15.pdf', fileSize: 'Static Folder File' },
  { id: 16, name: '16  Drill-Through Analytics', iconName: 'Cpu', published: true, pdfType: 'static', fileName: 'dashboard_16.pdf', fileSize: 'Static Folder File' },
  { id: 17, name: '17  AI Insights & Decision Intelligence', iconName: 'BrainCircuit', published: true, pdfType: 'static', fileName: 'dashboard_17.pdf', fileSize: 'Static Folder File' }
];

const THEME_MAP = {
  'classic-cream': {
    name: 'Classic Cream',
    bg: 'from-[#FAF8F5] via-[#FAF6EE] to-[#FFFDF9]',
    header: 'bg-white/70 border-zinc-200/50',
    card: 'bg-white border-zinc-200/85 text-zinc-900',
    text: 'text-zinc-900',
    subText: 'text-zinc-550',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    sidebar: 'bg-[#FAF6EE] text-zinc-800 border-zinc-200/80',
    sidebarActive: 'bg-zinc-900 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-zinc-550 hover:text-zinc-950 hover:bg-zinc-200/60',
    sidebarCard: 'bg-white border-zinc-200/60 shadow-sm',
    sidebarCardTitle: 'text-zinc-400',
    sidebarCardValue: 'text-zinc-900',
    sidebarBorder: 'border-zinc-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FAF8F5', '#FAF6EE', '#3B82F6']
  },
  'soft-lavender': {
    name: 'Soft Lavender',
    bg: 'from-[#FDFBFF] via-[#F5EFFF] to-[#EBE0FF]',
    header: 'bg-white/70 border-purple-200/50',
    card: 'bg-white border-purple-150 text-purple-950',
    text: 'text-purple-950',
    subText: 'text-purple-600',
    badge: 'bg-purple-500/10 text-purple-650 border-purple-500/20',
    sidebar: 'bg-[#F5EFFF] text-purple-900 border-purple-200/80',
    sidebarActive: 'bg-purple-600 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-purple-600 hover:text-purple-955 hover:bg-purple-200/60',
    sidebarCard: 'bg-white border-purple-200/60 shadow-sm',
    sidebarCardTitle: 'text-purple-550',
    sidebarCardValue: 'text-purple-900',
    sidebarBorder: 'border-purple-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FDFBFF', '#F5EFFF', '#8B5CF6']
  },
  'sage-garden': {
    name: 'Sage Garden',
    bg: 'from-[#FCFDFB] via-[#F1F8F3] to-[#E1EFE4]',
    header: 'bg-white/70 border-emerald-200/50',
    card: 'bg-white border-emerald-150 text-emerald-955',
    text: 'text-emerald-955',
    subText: 'text-emerald-650',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    sidebar: 'bg-[#F1F8F3] text-emerald-900 border-emerald-200/80',
    sidebarActive: 'bg-emerald-650 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-emerald-600 hover:text-emerald-955 hover:bg-emerald-200/60',
    sidebarCard: 'bg-white border-emerald-200/60 shadow-sm',
    sidebarCardTitle: 'text-emerald-550',
    sidebarCardValue: 'text-emerald-900',
    sidebarBorder: 'border-emerald-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FCFDFB', '#F1F8F3', '#10B981']
  },
  'slate-grey': {
    name: 'Slate Grey',
    bg: 'from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]',
    header: 'bg-white/70 border-slate-200/50',
    card: 'bg-white border-slate-200 text-slate-900',
    text: 'text-slate-900',
    subText: 'text-slate-550',
    badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    sidebar: 'bg-[#F1F5F9] text-slate-800 border-slate-200/80',
    sidebarActive: 'bg-slate-800 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-slate-650 hover:text-slate-950 hover:bg-slate-200/60',
    sidebarCard: 'bg-white border-slate-200/60 shadow-sm',
    sidebarCardTitle: 'text-slate-450',
    sidebarCardValue: 'text-slate-900',
    sidebarBorder: 'border-slate-200/60',
    logoutButton: 'text-rose-655 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#F8FAFC', '#F1F5F9', '#64748B']
  },
  'peach-blossom': {
    name: 'Peach Blossom',
    bg: 'from-[#FFFBF8] via-[#FFF3EB] to-[#FFE4D1]',
    header: 'bg-white/70 border-orange-200/50',
    card: 'bg-white border-orange-150 text-orange-950',
    text: 'text-orange-950',
    subText: 'text-orange-600',
    badge: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    sidebar: 'bg-[#FFF3EB] text-orange-900 border-orange-200/80',
    sidebarActive: 'bg-orange-600 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-orange-600 hover:text-orange-955 hover:bg-orange-200/60',
    sidebarCard: 'bg-white border-orange-200/60 shadow-sm',
    sidebarCardTitle: 'text-orange-550',
    sidebarCardValue: 'text-orange-900',
    sidebarBorder: 'border-orange-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FFFBF8', '#FFF3EB', '#F97316']
  },
  'powder-blue': {
    name: 'Powder Blue',
    bg: 'from-[#F8FCFF] via-[#F0F7FF] to-[#DCEBFF]',
    header: 'bg-white/70 border-sky-200/50',
    card: 'bg-white border-sky-150 text-sky-950',
    text: 'text-sky-955',
    subText: 'text-sky-600',
    badge: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    sidebar: 'bg-[#F0F7FF] text-sky-900 border-sky-200/80',
    sidebarActive: 'bg-sky-600 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-sky-600 hover:text-sky-955 hover:bg-sky-200/60',
    sidebarCard: 'bg-white border-sky-200/60 shadow-sm',
    sidebarCardTitle: 'text-sky-550',
    sidebarCardValue: 'text-sky-900',
    sidebarBorder: 'border-sky-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#F8FCFF', '#F0F7FF', '#0EA5E9']
  },
  'rose-petal': {
    name: 'Rose Petal',
    bg: 'from-[#FFFBFB] via-[#FFEBEF] to-[#FFD6DF]',
    header: 'bg-white/70 border-rose-200/50',
    card: 'bg-white border-rose-150 text-rose-955',
    text: 'text-rose-955',
    subText: 'text-rose-600',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    sidebar: 'bg-[#FFEBEF] text-rose-900 border-rose-200/80',
    sidebarActive: 'bg-rose-600 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-rose-600 hover:text-rose-955 hover:bg-rose-200/60',
    sidebarCard: 'bg-white border-rose-200/60 shadow-sm',
    sidebarCardTitle: 'text-rose-550',
    sidebarCardValue: 'text-rose-900',
    sidebarBorder: 'border-rose-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FFFBFB', '#FFEBEF', '#F43F5E']
  },
  'mint-green': {
    name: 'Mint Green',
    bg: 'from-[#FBFDFB] via-[#E8F8EE] to-[#D1F2DD]',
    header: 'bg-white/70 border-teal-200/50',
    card: 'bg-white border-teal-150 text-teal-955',
    text: 'text-teal-955',
    subText: 'text-teal-650',
    badge: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    sidebar: 'bg-[#E8F8EE] text-teal-900 border-teal-200/80',
    sidebarActive: 'bg-teal-650 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-teal-600 hover:text-teal-955 hover:bg-teal-200/60',
    sidebarCard: 'bg-white border-teal-200/60 shadow-sm',
    sidebarCardTitle: 'text-teal-550',
    sidebarCardValue: 'text-teal-900',
    sidebarBorder: 'border-teal-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FBFDFB', '#E8F8EE', '#14B8A6']
  },
  'warm-sand': {
    name: 'Warm Sand',
    bg: 'from-[#FDFDFB] via-[#F5F2E8] to-[#E9E3D3]',
    header: 'bg-white/70 border-amber-200/60',
    card: 'bg-white border-amber-200/80 text-amber-955',
    text: 'text-amber-955',
    subText: 'text-amber-600',
    badge: 'bg-amber-500/10 text-amber-655 border-amber-500/20',
    sidebar: 'bg-[#F5F2E8] text-amber-905 border-amber-250',
    sidebarActive: 'bg-amber-700 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-amber-705 hover:text-amber-955 hover:bg-amber-200/60',
    sidebarCard: 'bg-white border-amber-200/60 shadow-sm',
    sidebarCardTitle: 'text-amber-500',
    sidebarCardValue: 'text-amber-900',
    sidebarBorder: 'border-amber-250',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FDFDFB', '#F5F2E8', '#F59E0B']
  },
  'sakura-white': {
    name: 'Sakura White',
    bg: 'from-[#FFFDFD] via-[#FFF5F6] to-[#FFE6E8]',
    header: 'bg-white/70 border-rose-200/40',
    card: 'bg-white border-rose-100 text-rose-955',
    text: 'text-rose-955',
    subText: 'text-rose-600',
    badge: 'bg-rose-500/10 text-rose-650 border-rose-500/20',
    sidebar: 'bg-[#FFF5F6] text-rose-800 border-rose-200/60',
    sidebarActive: 'bg-rose-700 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-rose-650 hover:text-rose-950 hover:bg-rose-100',
    sidebarCard: 'bg-white border-rose-100 shadow-sm',
    sidebarCardTitle: 'text-rose-450',
    sidebarCardValue: 'text-rose-900',
    sidebarBorder: 'border-rose-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FFFDFD', '#FFF5F6', '#EC4899']
  },
  'silver-lilac': {
    name: 'Silver Lilac',
    bg: 'from-[#FAF9FC] via-[#F3EEFA] to-[#E4D9F5]',
    header: 'bg-white/70 border-indigo-200/40',
    card: 'bg-white border-indigo-150 text-indigo-955',
    text: 'text-indigo-955',
    subText: 'text-indigo-650',
    badge: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    sidebar: 'bg-[#F3EEFA] text-indigo-805 border-indigo-200/60',
    sidebarActive: 'bg-indigo-650 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-indigo-605 hover:text-indigo-950 hover:bg-indigo-100',
    sidebarCard: 'bg-white border-indigo-150 shadow-sm',
    sidebarCardTitle: 'text-indigo-455',
    sidebarCardValue: 'text-indigo-900',
    sidebarBorder: 'border-indigo-200/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#FAF9FC', '#F3EEFA', '#6366F1']
  },
  'corporate-steel': {
    name: 'Corporate Steel',
    bg: 'from-[#F8FAFC] via-[#EFF3F8] to-[#DFE5EE]',
    header: 'bg-white/70 border-slate-300/40',
    card: 'bg-white border-slate-200/80 text-slate-950',
    text: 'text-slate-955',
    subText: 'text-slate-500',
    badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    sidebar: 'bg-[#EFF3F8] text-slate-800 border-slate-300/60',
    sidebarActive: 'bg-slate-700 text-white shadow-md font-extrabold',
    sidebarInactive: 'text-slate-600 hover:text-slate-950 hover:bg-slate-200',
    sidebarCard: 'bg-white border-slate-200/80 shadow-sm',
    sidebarCardTitle: 'text-slate-450',
    sidebarCardValue: 'text-slate-900',
    sidebarBorder: 'border-slate-300/60',
    logoutButton: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    preview: ['#F8FAFC', '#EFF3F8', '#475569']
  }
};

export default function App() {
  const [dashboards, setDashboards] = useState(INITIAL_DASHBOARDS);
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('active_page') || 'admin';
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('active_page', activePage);
  }, [activePage]);
  const [selectedDashboardId, setSelectedDashboardId] = useState(null);

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // TV Presentation Mode States
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationPlaying, setPresentationPlaying] = useState(false);
  const [presentationInterval, setPresentationInterval] = useState(15);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef(null);

  // Combined PDF Export States
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDownloadIds, setSelectedDownloadIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // Collaborative Comments States
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(() => {
    return localStorage.getItem('comment_author') || (isAdminLoggedIn ? 'Admin' : '');
  });
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [logDateFilter, setLogDateFilter] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const dashboardsRef = useRef(dashboards);
  const logsRef = useRef(logs);

  const [customTheme, setCustomTheme] = useState(() => localStorage.getItem('custom_theme') || 'classic-cream');
  const [customLogo, setCustomLogo] = useState('');

  const activeTheme = THEME_MAP[customTheme] || THEME_MAP['classic-cream'];

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isAlert: false,
    type: '', // 'clear_logs', 'delete_log', or 'alert'
    targetId: null
  });

  const executeLogout = () => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'logout',
      detail: 'Admin logged out',
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    setIsAdminLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('active_page');
    setActivePage('admin');

    setDoc(doc(db, "dashboard_settings", "state"), {
      list: dashboards,
      comments: comments,
      logs: updatedLogs,
      updatedAt: new Date().toISOString()
    }).catch(err => console.warn(err));
  };

  const handleConfirmAction = () => {
    const { type, targetId } = confirmModal;
    setConfirmModal({ isOpen: false, title: '', message: '', isAlert: false, type: '', targetId: null });

    if (type === 'clear_logs') {
      try {
        setLogs([]);
        if (db) {
          updateDoc(doc(db, "dashboard_settings", "state"), {
            logs: [],
            updatedAt: new Date().toISOString()
          }).catch(err => console.warn("Failed to clear logs in db:", err));
        }
      } catch (e) {
        console.warn("Failed to clear logs: ", e);
      }
    } else if (type === 'delete_log') {
      try {
        setLogs(prevLogs => {
          const updated = prevLogs.filter(l => l.id !== targetId);
          if (db) {
            updateDoc(doc(db, "dashboard_settings", "state"), {
              logs: updated,
              updatedAt: new Date().toISOString()
            }).catch(err => console.warn("Failed to delete log entry in db:", err));
          }
          return updated;
        });
      } catch (e) {
        console.warn("Failed to delete log entry: ", e);
      }
    } else if (type === 'logout') {
      executeLogout();
    }
  };

  const triggerAlert = (title, message) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      isAlert: true,
      type: 'alert',
      targetId: null
    });
  };

  useEffect(() => {
    dashboardsRef.current = dashboards;
  }, [dashboards]);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (logTypeFilter !== 'all' && log.type !== logTypeFilter) {
        return false;
      }
      if (logDateFilter) {
        const logDate = log.timestamp ? log.timestamp.split('T')[0] : '';
        if (logDate !== logDateFilter) {
          return false;
        }
      }
      return true;
    });
  }, [logs, logTypeFilter, logDateFilter]);

  const logsPerPage = 10;
  const totalLogsPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;

  const paginatedLogs = useMemo(() => {
    const start = (logsPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, logsPage]);

  useEffect(() => {
    setLogsPage(1);
  }, [logTypeFilter, logDateFilter]);

  useEffect(() => {
    if (commentAuthor) {
      localStorage.setItem('comment_author', commentAuthor);
    }
  }, [commentAuthor]);

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
        const dbComments = docSnap.data().comments;
        if (Array.isArray(dbComments)) {
          setComments(dbComments);
        } else {
          setComments([]);
        }
        const dbLogs = docSnap.data().logs;
        if (Array.isArray(dbLogs)) {
          setLogs(dbLogs);
        } else {
          setLogs([]);
        }
        const dbLogo = docSnap.data().logo || '';
        setCustomLogo(dbLogo);
      } else {
        try {
          await setDoc(doc(db, "dashboard_settings", "state"), {
            list: INITIAL_DASHBOARDS,
            comments: [],
            logs: [{
              id: 'init',
              type: 'system',
              detail: 'System audit log initialized successfully',
              user: 'System',
              timestamp: new Date().toISOString()
            }],
            theme: 'classic-cream',
            logo: '',
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


  const syncDashboardsToCloud = async (updatedList, customLogs = logsRef.current) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "dashboard_settings", "state"), {
        list: updatedList,
        logs: customLogs,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Failed to sync updated dashboards to Firebase Firestore:", e);
    }
  };


  const publishedDashboards = useMemo(() => {
    return dashboards.filter(d => d.published);
  }, [dashboards]);


  // Background System Scheduler Check Effect using Refs to avoid clearance
  useEffect(() => {
    if (!db) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      let updated = false;
      let updatedLogs = [...logsRef.current];

      const nextDashboards = dashboardsRef.current.map(dbItem => {
        if (dbItem.schedule && dbItem.schedule.isEnabled) {
          // Check publish time match
          if (dbItem.schedule.publishTime === currentTimeStr && !dbItem.published) {
            updated = true;
            updatedLogs = [{
              id: Math.random().toString(36).substring(2, 9),
              type: 'publish',
              detail: `Scheduled Auto-Publish: Published dashboard "${dbItem.name}"`,
              user: 'System Scheduler',
              timestamp: new Date().toISOString()
            }, ...updatedLogs];
            return { ...dbItem, published: true, pushedAt: new Date().toISOString() };
          }
          // Check unpublish time match
          if (dbItem.schedule.unpublishTime === currentTimeStr && dbItem.published) {
            updated = true;
            updatedLogs = [{
              id: Math.random().toString(36).substring(2, 9),
              type: 'unpublish',
              detail: `Scheduled Auto-Unpublish: Unpublished dashboard "${dbItem.name}"`,
              user: 'System Scheduler',
              timestamp: new Date().toISOString()
            }, ...updatedLogs];
            return {
              ...dbItem,
              published: false,
              pdfType: dbItem.id > 17 ? dbItem.pdfType : null,
              fileName: dbItem.id > 17 ? dbItem.fileName : null,
              fileSize: dbItem.id > 17 ? dbItem.fileSize : null,
              pushedAt: null
            };
          }
        }
        return dbItem;
      });

      if (updated) {
        setDashboards(nextDashboards);
        setLogs(updatedLogs);
        syncDashboardsToCloud(nextDashboards, updatedLogs);
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [db]);

  // TV Presentation Mode Effect
  useEffect(() => {
    if (!isPresentationMode || !presentationPlaying || publishedDashboards.length === 0) {
      return;
    }

    setSecondsRemaining(presentationInterval);

    const intervalTimer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setSelectedDashboardId(currentId => {
            const currentIndex = publishedDashboards.findIndex(d => d.id === currentId);
            const nextIndex = (currentIndex + 1) % publishedDashboards.length;
            return publishedDashboards[nextIndex].id;
          });
          return presentationInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [isPresentationMode, presentationPlaying, presentationInterval, publishedDashboards]);

  useEffect(() => {
    if (isPresentationMode) {
      setSecondsRemaining(presentationInterval);
    }
  }, [selectedDashboardId, presentationInterval, isPresentationMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleExitPresentation = () => {
    setIsPresentationMode(false);
    setPresentationPlaying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keydown handler (Escape key, ArrowRight, ArrowLeft) & Fullscreen change handler to exit presentation mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPresentationMode || publishedDashboards.length === 0) return;

      if (e.key === 'Escape') {
        handleExitPresentation();
      } else if (e.key === 'ArrowRight') {
        setSelectedDashboardId(currentId => {
          const currentIndex = publishedDashboards.findIndex(d => d.id === currentId);
          const nextIndex = (currentIndex + 1) % publishedDashboards.length;
          return publishedDashboards[nextIndex].id;
        });
      } else if (e.key === 'ArrowLeft') {
        setSelectedDashboardId(currentId => {
          const currentIndex = publishedDashboards.findIndex(d => d.id === currentId);
          const prevIndex = (currentIndex - 1 + publishedDashboards.length) % publishedDashboards.length;
          return publishedDashboards[prevIndex].id;
        });
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setPresentationPlaying(prev => !prev);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        setIsPresentationMode(false);
        setPresentationPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isPresentationMode, publishedDashboards]);

  // Auto-hide TV Presentation controls on mouse inactivity
  useEffect(() => {
    if (!isPresentationMode) {
      setShowControls(true);
      return;
    }

    const resetHideTimer = () => {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000); // Hide after 2 seconds
    };

    resetHideTimer();

    window.addEventListener('mousemove', resetHideTimer);
    window.addEventListener('touchstart', resetHideTimer);

    return () => {
      window.removeEventListener('mousemove', resetHideTimer);
      window.removeEventListener('touchstart', resetHideTimer);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPresentationMode]);

  const handleDockMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowControls(true);
  };

  const handleDockMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };
  
  const handleMergeAndDownload = async () => {
    if (selectedDownloadIds.length === 0) return;
    setIsDownloading(true);
    setDownloadError('');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const id of selectedDownloadIds) {
        const dbInfo = dashboards.find(d => d.id === id);
        if (!dbInfo) continue;

        let pdfBytes;
        if (dbInfo.pdfType === 'custom') {
          const blob = await getPdfFromDB(id);
          if (!blob) {
            throw new Error(`Custom PDF report not found in browser IndexedDB for "${dbInfo.name}". Please re-upload in the Admin Panel.`);
          }
          pdfBytes = await blob.arrayBuffer();
        } else {
          const res = await fetch(`/dashboard_${id}.pdf`);
          if (!res.ok) {
            throw new Error(`Static PDF report not found on server for "${dbInfo.name}".`);
          }
          pdfBytes = await res.arrayBuffer();
        }

        const srcDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      const combinedBlob = new Blob([mergedPdfFile], { type: 'application/pdf' });

      const url = URL.createObjectURL(combinedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Manufacturing_Dashboards_Combined_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const dbNames = selectedDownloadIds.map(id => {
        const d = dashboards.find(dash => dash.id === id);
        return d ? d.name : `Dashboard ${id}`;
      }).join(', ');

      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'download',
        detail: `Downloaded combined PDF for: ${dbNames}`,
        user: isAdminLoggedIn ? 'Admin' : 'Operator',
        timestamp: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);

      if (db) {
        setDoc(doc(db, "dashboard_settings", "state"), {
          list: dashboards,
          comments: comments,
          logs: updatedLogs,
          updatedAt: new Date().toISOString()
        }).catch(err => console.warn(err));
      }

      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error("PDF Merge download failed: ", err);
      setDownloadError(err.message || 'An unexpected error occurred while merging PDF files.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !commentAuthor.trim() || !selectedDashboardId) return;

    try {
      const newComment = {
        id: Math.random().toString(36).substring(2, 9),
        dashboardId: selectedDashboardId,
        author: commentAuthor,
        text: newCommentText.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);

      const dbInfo = dashboards.find(d => d.id === selectedDashboardId);
      const dbName = dbInfo ? dbInfo.name : `Dashboard ${selectedDashboardId}`;
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'comment_add',
        detail: `Added note: "${newCommentText.trim().substring(0, 30)}${newCommentText.trim().length > 30 ? '...' : ''}" on "${dbName}"`,
        user: commentAuthor,
        timestamp: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);

      await setDoc(doc(db, "dashboard_settings", "state"), {
        list: dashboards,
        comments: updatedComments,
        logs: updatedLogs,
        updatedAt: new Date().toISOString()
      });

      setNewCommentText('');
    } catch (err) {
      console.error("Failed to add comment: ", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);

      const commentInfo = comments.find(c => c.id === commentId);
      const authorName = commentInfo ? commentInfo.author : 'user';
      const commentMsg = commentInfo ? commentInfo.text : '';
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'comment_delete',
        detail: `Deleted note by ${authorName}: "${commentMsg.substring(0, 30)}${commentMsg.length > 30 ? '...' : ''}"`,
        user: 'Admin',
        timestamp: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);

      await setDoc(doc(db, "dashboard_settings", "state"), {
        list: dashboards,
        comments: updatedComments,
        logs: updatedLogs,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to delete comment: ", err);
    }
  };

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

  const activeComments = useMemo(() => {
    return comments.filter(c => c.dashboardId === selectedDashboardId);
  }, [comments, selectedDashboardId]);

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

    const dbInfo = dashboards.find(d => d.id === id);
    const dbName = dbInfo ? dbInfo.name : `Dashboard ${id}`;
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'publish',
      detail: `Published dashboard "${dbName}"`,
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    syncDashboardsToCloud(updated, updatedLogs);
  };

  // Callback to unpublish / delete a dashboard
  const handleUnpublish = (id) => {
    let updated;
    const dbInfo = dashboards.find(d => d.id === id);
    const dbName = dbInfo ? dbInfo.name : `Dashboard ${id}`;
    const isCustom = id > 17;

    if (isCustom) {
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

    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'unpublish',
      detail: `${isCustom ? 'Deleted custom' : 'Unpublished'} dashboard "${dbName}"`,
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    syncDashboardsToCloud(updated, updatedLogs);
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

    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'create',
      detail: `Created custom dashboard "${newDashboard.name}"`,
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    syncDashboardsToCloud(updated, updatedLogs);
    return newDashboard;
  };
  const handleRenameDashboard = (id, newName) => {
    const dbInfo = dashboards.find(d => d.id === id);
    const oldName = dbInfo ? dbInfo.name : `Dashboard ${id}`;

    const updated = dashboards.map(db => {
      if (db.id === id) {
        return { ...db, name: newName };
      }
      return db;
    });
    setDashboards(updated);
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'rename',
      detail: `Renamed dashboard from "${oldName}" to "${newName}"`,
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    syncDashboardsToCloud(updated, updatedLogs);
  };
  const handleResetDefaults = async () => {
    await clearAllPdfsFromDB();
    setDashboards(INITIAL_DASHBOARDS);
    setSelectedDashboardId(null);
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'reset',
      detail: 'Reset all dashboards back to factory defaults',
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    syncDashboardsToCloud(INITIAL_DASHBOARDS, updatedLogs);
  };
  const handleClearAllLogs = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear All Logs",
      message: "Are you sure you want to delete all system logs? This action cannot be undone.",
      isAlert: false,
      type: 'clear_logs',
      targetId: null
    });
  };
  const handleDeleteIndividualLog = (logId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Log Entry",
      message: "Are you sure you want to delete this log entry?",
      isAlert: false,
      type: 'delete_log',
      targetId: logId
    });
  };
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Logout",
      message: "Are you sure you want to log out of the administration console?",
      isAlert: false,
      type: 'logout',
      targetId: null
    });
  };

  const handleUpdateSchedule = (id, newSchedule) => {
    const updated = dashboards.map(dbItem => {
      if (dbItem.id === id) {
        return { ...dbItem, schedule: newSchedule };
      }
      return dbItem;
    });
    setDashboards(updated);

    const dbInfo = dashboards.find(d => d.id === id);
    const dbName = dbInfo ? dbInfo.name : `Dashboard ${id}`;
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'scheduler_update',
      detail: `Updated schedule for "${dbName}" (${newSchedule.isEnabled ? `Active: ${newSchedule.publishTime} - ${newSchedule.unpublishTime}` : 'Disabled'})`,
      user: 'Admin',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    syncDashboardsToCloud(updated, updatedLogs);
  };

  const handleUpdateBranding = async (themeName, logoBase64) => {
    setCustomTheme(themeName);
    localStorage.setItem('custom_theme', themeName);

    if (logoBase64 !== customLogo) {
      setCustomLogo(logoBase64);

      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'branding_update',
        detail: `Updated corporate logo: ${logoBase64 ? 'Custom Logo Uploaded' : 'Default Logo'}`,
        user: 'Admin',
        timestamp: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logsRef.current];
      setLogs(updatedLogs);

      if (db) {
        try {
          await updateDoc(doc(db, "dashboard_settings", "state"), {
            logo: logoBase64,
            logs: updatedLogs,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Failed to sync logo branding update to Firestore:", e);
        }
      }
    }
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

      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'login',
        detail: 'Admin logged in successfully',
        user: 'Admin',
        timestamp: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      setDoc(doc(db, "dashboard_settings", "state"), {
        list: dashboards,
        comments: comments,
        logs: updatedLogs,
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn(err));
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${activeTheme.bg} text-zinc-900 dark:text-zinc-5- flex items-center justify-center p-4`}>
        <div className="relative w-full max-w-md overflow-hidden bg-white/80 dark:bg-zinc-900/85 border border-zinc-200/50 dark:border-zinc-800/60 shadow-2xl rounded-2xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-550 to-purple-500" />
          <div className="p-7 space-y-6">
            <div className="text-center space-y-1.5 mt-2">
              {customLogo ? (
                <div className="flex justify-center mb-3">
                  <img src={customLogo} alt="Logo" className="h-16 max-w-[260px] object-contain rounded-xl" />
                </div>
              ) : (
                <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/10 mb-2">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Manufacturing Dashboard Login
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
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
  if (['admin', 'logs', 'scheduler', 'branding', 'settings', 'profile'].includes(activePage)) {
    return (
      <div className={`h-screen overflow-hidden bg-gradient-to-br ${activeTheme.bg} text-zinc-900 flex`}>
        <aside className={`w-64 h-screen border-r flex flex-col justify-between p-5 shrink-0 select-none ${activeTheme.sidebar}`}>
          <div className="space-y-6">
            <div className={`px-2 py-3 border-b ${activeTheme.sidebarBorder} flex items-center ${customLogo ? 'justify-center' : 'gap-2'}`}>
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="h-10 max-w-[190px] object-contain rounded-lg" />
              ) : (
                <h2 className={`text-[11px] font-extrabold tracking-wider uppercase truncate ${activeTheme.text}`} title={enterpriseTitle}>
                  {enterpriseTitle}
                </h2>
              )}
            </div>

            {/* Sidebar Stats Widgets (One-by-One Light Cards) */}
            <div className="space-y-2.5 mx-1">
              {/* Total Dashboards Card */}
              <div className={`${activeTheme.sidebarCard} p-3 rounded-xl flex items-center justify-between`}>
                <div>
                  <span className={`text-[9px] font-bold ${activeTheme.sidebarCardTitle} uppercase tracking-wider block`}>Total Dashboards</span>
                  <span className={`text-base font-extrabold ${activeTheme.sidebarCardValue} mt-0.5 block`}>{dashboards.length}</span>
                </div>
              </div>

              {/* Live Dashboards Card */}
              <div className={`${activeTheme.sidebarCard} p-3 rounded-xl flex items-center justify-between`}>
                <div>
                  <span className={`text-[9px] font-bold ${activeTheme.sidebarCardTitle} uppercase tracking-wider block`}>Live Dashboards</span>
                  <span className={`text-base font-extrabold ${activeTheme.sidebarCardValue} mt-0.5 block`}>{publishedDashboards.length}</span>
                </div>
              </div>
            </div>              <nav className="space-y-1.5">
              <button
                onClick={() => setActivePage('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === 'admin'
                  ? activeTheme.sidebarActive
                  : activeTheme.sidebarInactive
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
              <button
                onClick={() => setActivePage('scheduler')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === 'scheduler'
                  ? activeTheme.sidebarActive
                  : activeTheme.sidebarInactive
                  }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Publish Schedule</span>
              </button>
              <button
                onClick={() => setActivePage('branding')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === 'branding'
                  ? activeTheme.sidebarActive
                  : activeTheme.sidebarInactive
                  }`}
              >
                <Palette className="w-4 h-4" />
                <span>Custom Theme</span>
              </button>
              <button
                onClick={() => setActivePage('logs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === 'logs'
                  ? activeTheme.sidebarActive
                  : activeTheme.sidebarInactive
                  }`}
              >
                <History className="w-4 h-4" />
                <span>System Logs</span>
              </button>
              <button
                onClick={() => setActivePage('dashboards')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === 'dashboards'
                  ? activeTheme.sidebarActive
                  : activeTheme.sidebarInactive
                  }`}
              >
                <Grid className="w-4 h-4" />
                <span>Dashboards</span>
              </button>
              <button
                onClick={() => setActivePage('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === 'profile'
                  ? activeTheme.sidebarActive
                  : activeTheme.sidebarInactive
                  }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              {/* <button
                onClick={() => setActivePage('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePage === 'settings'
                    ? 'bg-white text-zinc-950 shadow-md font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button> */}
            </nav>
          </div>
          <div className={`pt-4 border-t ${activeTheme.sidebarBorder}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTheme.logoutButton} cursor-pointer`}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden bg-transparent">
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
                logs={logs}
                onViewLogs={() => setActivePage('logs')}
              />
            )}

            {activePage === 'scheduler' && (
              /* Scheduled Publishing / Automations screen */
              <div className="space-y-6 animate-fade-in select-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5.5 h-5.5 text-blue-500" />
                      <span>Scheduled Publishing & Automations</span>
                    </h1>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider mt-1">
                      Configure automated live hours for shift reporting and safety dashboards
                    </p>
                  </div>
                </div>

                {/* Dashboard Schedules Grid */}
                <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                    <div className="col-span-4">Dashboard Name</div>
                    <div className="col-span-2">Current Status</div>
                    <div className="col-span-2">Auto-Publish Time</div>
                    <div className="col-span-2">Auto-Unpublish Time</div>
                    <div className="col-span-2">Scheduler Action</div>
                  </div>

                  {/* Scrollable List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-zinc-150 dark:divide-zinc-850">
                    {dashboards.map((dbItem) => {
                      const itemSchedule = dbItem.schedule || { publishTime: '08:00', unpublishTime: '18:00', isEnabled: false };
                      
                      return (
                        <div key={dbItem.id} className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-zinc-750 dark:text-zinc-300 hover:bg-zinc-55/40 dark:hover:bg-zinc-955/40 items-center transition-all">
                          {/* Name & Icon */}
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 border border-blue-105 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Tv className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                                {dbItem.name}
                              </span>
                              <span className="text-[9px] text-zinc-400 block mt-0.5">
                                ID: {dbItem.id} • {dbItem.pdfType || 'System static'} report
                              </span>
                            </div>
                          </div>
                          {/* Status */}
                          <div className="col-span-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-block border ${
                              dbItem.published 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                            }`}>
                              {dbItem.published ? 'Live' : 'Draft'}
                            </span>
                          </div>
                          {/* Publish Time Picker */}
                          <div className="col-span-2">
                            <input
                              type="time"
                              value={itemSchedule.publishTime}
                              disabled={!itemSchedule.isEnabled}
                              onChange={(e) => handleUpdateSchedule(dbItem.id, {
                                ...itemSchedule,
                                publishTime: e.target.value
                              })}
                              className={`bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-all ${
                                !itemSchedule.isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            />
                          </div>

                          {/* Unpublish Time Picker */}
                          <div className="col-span-2">
                            <input
                              type="time"
                              value={itemSchedule.unpublishTime}
                              disabled={!itemSchedule.isEnabled}
                              onChange={(e) => handleUpdateSchedule(dbItem.id, {
                                ...itemSchedule,
                                unpublishTime: e.target.value
                              })}
                              className={`bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-all ${
                                !itemSchedule.isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            />
                          </div>

                          {/* Toggle Switch */}
                          <div className="col-span-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateSchedule(dbItem.id, {
                                ...itemSchedule,
                                isEnabled: !itemSchedule.isEnabled
                              })}
                              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer outline-none border border-transparent ${
                                itemSchedule.isEnabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-800'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                                  itemSchedule.isEnabled ? 'left-5' : 'left-0.5'
                                }`}
                              />
                            </button>
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              {itemSchedule.isEnabled ? 'On' : 'Off'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activePage === 'branding' && (
              /* Dedicated Custom Branding Screen */
              <div className="space-y-6 animate-fade-in select-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Palette className="w-5.5 h-5.5 text-blue-500" />
                      <span>Custom Branding & Theme Selector</span>
                    </h1>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider mt-1">
                      Personalize your industrial dashboard's color palette and upload your corporate logo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Selector Card */}
                  <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      Grid Theme Selector
                    </h3>
                    <p className="text-xs text-zinc-550 dark:text-zinc-400">
                      Select a color scheme tailored to your control room or manufacturing floor environment.
                    </p>

                    <div className="space-y-2.5 pt-2 max-h-[360px] overflow-y-auto pr-1">
                      {Object.keys(THEME_MAP).map((themeKey) => {
                        const theme = THEME_MAP[themeKey];
                        const isSelected = customTheme === themeKey;
                        return (
                          <button
                            key={themeKey}
                            onClick={() => handleUpdateBranding(themeKey, customLogo)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-50 dark:bg-zinc-900/40 ring-1 ring-zinc-950'
                                : 'border-zinc-200 bg-transparent hover:bg-zinc-50/50'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold text-zinc-850 block">{theme.name}</span>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                {themeKey === 'classic-cream' ? 'Classic warm sand sandcastles' :
                                 themeKey === 'soft-lavender' ? 'Subtle lavender-indigo pastels' :
                                 themeKey === 'sage-garden' ? 'Organic sage-green herbal tones' :
                                 themeKey === 'slate-grey' ? 'Sleek minimalist steel-slate look' :
                                 themeKey === 'peach-blossom' ? 'Soft golden peach-apricot sunset' :
                                 themeKey === 'powder-blue' ? 'Refreshing powder sky-blue layout' :
                                 themeKey === 'rose-petal' ? 'Dusty rose-pink blush highlights' :
                                 themeKey === 'mint-green' ? 'Clean herbal mint-teal accents' :
                                 themeKey === 'warm-sand' ? 'Soft sand dune beige layout' :
                                 themeKey === 'sakura-white' ? 'Ultra-clean cherry blossom white' :
                                 themeKey === 'silver-lilac' ? 'Muted silver lilac grey tones' :
                                 'Polished metallic steel layout'}
                              </span>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              {theme.preview.map((color, idx) => (
                                <span
                                  key={idx}
                                  style={{ backgroundColor: color }}
                                  className="w-3.5 h-3.5 rounded-full border border-zinc-250 block"
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logo Customization Card */}
                  <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
                    <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      Company Corporate Logo
                    </h3>
                    <p className="text-xs text-zinc-550 dark:text-zinc-400">
                      Upload your logo (preferably PNG with a transparent background, max size 1.00 MB) to show it across headers and login guard pages.
                    </p>

                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/25 space-y-4 w-full">
                      {customLogo ? (
                        <div className="text-center space-y-2">
                          <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl inline-block shadow-inner max-w-full">
                            <img src={customLogo} alt="Preview Logo" className="h-20 max-w-[280px] object-contain" />
                          </div>
                          <span className="text-[9px] text-zinc-400 font-semibold block uppercase tracking-wider">Active Logo Preview</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-2xl block">🏢</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Default Branding Active</span>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex items-center gap-3 w-full">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] text-xs font-bold text-zinc-750 dark:text-zinc-250 hover:bg-zinc-55 dark:hover:bg-zinc-900 transition-all cursor-pointer shadow-sm">
                            <span>Choose Logo Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.size > 1024 * 1024) { // 1MB Limit
                                    triggerAlert(
                                      "File Too Large",
                                      `The selected logo image file size is ${(file.size / 1024 / 1024).toFixed(2)} MB. Please choose a smaller image file under 1.00 MB to maintain database performance and stability.`
                                    );
                                    // Clear file input value
                                    e.target.value = '';
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleUpdateBranding(customTheme, reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {customLogo && (
                            <button
                              onClick={() => handleUpdateBranding(customTheme, '')}
                              className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer shadow-sm"
                            >
                              Remove Logo
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block text-center">Max limit: 1.00 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            {activePage === 'logs' && (
              /* Dedicated System Logs Screen */
              <div className="space-y-6 animate-fade-in select-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <History className="w-5.5 h-5.5 text-blue-500" />
                      <span>System Audit Logs & Activity History</span>
                    </h1>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider mt-1">
                      Monitor user logons, PDF compile events, and database actions in real time
                    </p>
                  </div>
                  {logs.length > 0 && (
                    <button
                      onClick={handleClearAllLogs}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-955/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-4 h-4 pointer-events-none" />
                      <span>Clear All Logs</span>
                    </button>
                  )}
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                  {/* Event Type Filter */}
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                      Filter by Event Type
                    </label>
                    <select
                      value={logTypeFilter}
                      onChange={(e) => setLogTypeFilter(e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer min-w-44"
                    >
                      <option value="all">All Events</option>
                      <option value="login">Login</option>
                      <option value="logout">Logout</option>
                      <option value="publish">Publish</option>
                      <option value="unpublish">Unpublish</option>
                      <option value="rename">Rename</option>
                      <option value="create">Create Custom</option>
                      <option value="reset">Factory Reset</option>
                      <option value="comment_add">Add Note</option>
                      <option value="comment_delete">Delete Note</option>
                      <option value="download">Download PDF</option>
                      <option value="scheduler_update">Schedule Update</option>
                      <option value="branding_update">Branding Update</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                      Filter by Date
                    </label>
                    <input
                      type="date"
                      value={logDateFilter}
                      onChange={(e) => setLogDateFilter(e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    />
                  </div>

                  {/* Reset Filters button */}
                  {(logTypeFilter !== 'all' || logDateFilter) && (
                    <button
                      onClick={() => {
                        setLogTypeFilter('all');
                        setLogDateFilter('');
                      }}
                      className="mt-4 sm:mt-auto px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-240px)]">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                    <div className="col-span-3 sm:col-span-2">Timestamp</div>
                    <div className="col-span-3 sm:col-span-2">User / Role</div>
                    <div className="col-span-3 sm:col-span-2">Event</div>
                    <div className="col-span-2 sm:col-span-5">Action Detail</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {/* Scrollable Rows */}
                  <div className="flex-1 overflow-y-auto divide-y divide-zinc-150 dark:divide-zinc-850">
                    {paginatedLogs.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-20 text-center text-zinc-450 dark:text-zinc-550 font-bold text-xs uppercase tracking-wider">
                        No logs matched these criteria
                      </div>
                    ) : (
                      paginatedLogs.map((log) => (
                        <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 text-xs font-semibold text-zinc-750 dark:text-zinc-300 hover:bg-zinc-55/30 dark:hover:bg-zinc-955/40 items-center transition-all">
                          <div className="col-span-3 sm:col-span-2 text-[10px] text-zinc-400 dark:text-zinc-555 font-bold">
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                          </div>
                          
                          <div className="col-span-3 sm:col-span-2 font-extrabold text-zinc-800 dark:text-zinc-200">
                            {log.user}
                          </div>

                          <div className="col-span-3 sm:col-span-2">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide inline-block ${
                              log.type === 'publish' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              log.type === 'unpublish' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                              log.type === 'login' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              log.type === 'logout' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/15' :
                              log.type === 'rename' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              log.type === 'comment_add' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                              log.type === 'comment_delete' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                              log.type === 'download' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                              log.type === 'scheduler_update' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' :
                              log.type === 'branding_update' ? 'bg-amber-500/10 text-amber-500 border border-amber-550/20' :
                              'bg-zinc-500/10 text-zinc-550'
                            }`}>
                              {log.type === 'scheduler_update' ? 'schedule update' : 
                               log.type === 'branding_update' ? 'branding update' : log.type}
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-5 space-y-1.5">
                            {log.detail.length > 50 ? (
                              <>
                                {expandedLogId === log.id ? (
                                  <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 max-h-40 overflow-y-auto pr-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed shadow-inner scrollbar-thin">
                                    {log.detail}
                                  </div>
                                ) : (
                                  <div className="font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                                    {log.detail}
                                  </div>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                  className="text-[9px] font-extrabold text-blue-555 dark:text-blue-450 hover:text-blue-650 transition-colors uppercase tracking-wider cursor-pointer mt-1 block w-fit"
                                >
                                  {expandedLogId === log.id ? 'Show Less' : 'View More'}
                                </button>
                              </>
                            ) : (
                              <div className="font-semibold text-zinc-550 dark:text-zinc-400">
                                {log.detail}
                              </div>
                            )}
                          </div>

                          <div className="col-span-1 text-right">
                            <button
                              onClick={() => handleDeleteIndividualLog(log.id)}
                              className="p-1.5 rounded-lg border border-rose-205 dark:border-rose-955 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer shadow-sm"
                              title="Delete this log entry"
                            >
                              <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Logs Table Footer (Pagination) */}
                  {totalLogsPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4.5 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                      <div className="text-xs text-zinc-505 dark:text-zinc-450 font-semibold">
                        Showing{' '}
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                          {Math.min((logsPage - 1) * logsPerPage + 1, filteredLogs.length)}
                        </span>{' '}
                        to{' '}
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                          {Math.min(logsPage * logsPerPage, filteredLogs.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                          {filteredLogs.length}
                        </span>{' '}
                        log entries
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLogsPage(prev => Math.max(prev - 1, 1))}
                          disabled={logsPage === 1}
                          className={`p-2 rounded-lg border text-zinc-650 dark:text-zinc-400 transition-all cursor-pointer ${
                            logsPage === 1
                              ? 'border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] hover:bg-zinc-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {(() => {
                          const getPaginationRange = (curr, total) => {
                            const range = [];
                            const max = 5;
                            if (total <= max) {
                              for (let i = 1; i <= total; i++) range.push(i);
                            } else {
                              if (curr <= 3) {
                                range.push(1, 2, 3, 4, '...', total);
                              } else if (curr >= total - 2) {
                                range.push(1, '...', total - 3, total - 2, total - 1, total);
                              } else {
                                range.push(1, '...', curr - 1, curr, curr + 1, '...', total);
                              }
                            }
                            return range;
                          };

                          return getPaginationRange(logsPage, totalLogsPages).map((page, index) => {
                            if (page === '...') {
                              return (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2.5 py-1.5 text-xs text-zinc-450 dark:text-zinc-550 font-bold select-none"
                                >
                                  ...
                                </span>
                              );
                            }
                            return (
                              <button
                                key={page}
                                type="button"
                                onClick={() => setLogsPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  logsPage === page
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-955 shadow-sm font-extrabold'
                                    : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] text-zinc-650 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          });
                        })()}

                        <button
                          type="button"
                          onClick={() => setLogsPage(prev => Math.min(prev + 1, totalLogsPages))}
                          disabled={logsPage === totalLogsPages}
                          className={`p-2 rounded-lg border text-zinc-650 dark:text-zinc-400 transition-all cursor-pointer ${
                            logsPage === totalLogsPages
                              ? 'border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] hover:bg-zinc-50 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            )}
            {activePage === 'profile' && (
              <UserProfile onLogout={handleLogout} />
            )}
            {activePage === 'settings' && (
              <SystemSettings 
                dashboards={dashboards} 
                onRestoreConfig={handleRestoreConfig}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </main>

          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-[#0c0c0f]/40 py-5 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-555 shrink-0">
            <p>© 2026 Manufacturing Dashboard. Secure administrative data synchronization active.</p>
          </footer>
        </div>
        
        {/* Premium Confirm Modal (Admin Views) */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm select-none">
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  confirmModal.isAlert
                    ? 'bg-amber-50 dark:bg-amber-955/20 border-amber-100 dark:border-amber-900/30 text-amber-500'
                    : 'bg-rose-50 dark:bg-rose-955/20 border-rose-200 dark:border-rose-900/30 text-rose-500'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-905 dark:text-white uppercase tracking-wider">
                    {confirmModal.title}
                  </h3>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    {confirmModal.isAlert ? 'Validation Warning' : 'Verification Required'}
                  </p>
                </div>
              </div>
              
              <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex items-center justify-end gap-2.5 pt-2">
                {!confirmModal.isAlert && (
                  <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-transparent text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer shadow-sm"
                  >
                    No, Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-md ${
                    confirmModal.isAlert
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                  }`}
                >
                  {confirmModal.isAlert ? 'OK' : 'Yes, Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={`min-h-screen bg-gradient-to-br ${activeTheme.bg} text-zinc-900 dark:text-zinc-50 transition-colors duration-300 flex`}>
      <div className="flex-1 flex flex-col min-h-screen"> 
        {!isPresentationMode && (
          <header className={`border-b backdrop-blur-md sticky top-0 z-30 transition-colors duration-305 flex items-center justify-between px-6 py-4.5 gap-4 ${activeTheme.header}`}>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setActivePage('admin')}
                className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all cursor-pointer shrink-0 shadow-sm ${
                  activeTheme 
                    ? `${activeTheme.sidebarInactive} ${activeTheme.sidebarBorder} bg-white/40 dark:bg-zinc-900/40` 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-55 dark:hover:bg-zinc-900 hover:text-blue-555'
                }`}
                title="Back to Admin Console"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>

              {publishedDashboards.length > 0 && (
                <button
                  onClick={() => {
                    setIsPresentationMode(true);
                    setPresentationPlaying(true);
                  }}
                  className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5 ${
                    activeTheme 
                      ? `${activeTheme.sidebarInactive} ${activeTheme.sidebarBorder} bg-white/40 dark:bg-zinc-900/40` 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] text-zinc-750 dark:text-zinc-350 hover:bg-zinc-55 dark:hover:bg-zinc-900 hover:text-blue-550'
                  }`}
                  title="Enter TV Presentation Slideshow"
                >
                  <Tv className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">Slideshow</span>
                </button>
              )}

              {publishedDashboards.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedDownloadIds(publishedDashboards.map(d => d.id));
                    setDownloadError('');
                    setIsDownloadModalOpen(true);
                  }}
                  className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5 ${
                    activeTheme 
                      ? `${activeTheme.sidebarInactive} ${activeTheme.sidebarBorder} bg-white/40 dark:bg-zinc-900/40` 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] text-zinc-750 dark:text-zinc-350 hover:bg-zinc-55 dark:hover:bg-zinc-900 hover:text-blue-550'
                  }`}
                  title="Download Combined PDF Reports"
                >
                  <Download className="w-4.5 h-4.5 text-emerald-600" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">Download</span>
                </button>
              )}

              {publishedDashboards.length > 0 && (
                <button
                  onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                  className={`p-2.5 rounded-xl border backdrop-blur-sm cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5 transition-all ${
                    isCommentsOpen 
                      ? activeTheme.sidebarActive
                      : activeTheme 
                        ? `${activeTheme.sidebarInactive} ${activeTheme.sidebarBorder} bg-white/40 dark:bg-zinc-900/40` 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] text-zinc-750 dark:text-zinc-350 hover:bg-zinc-55 dark:hover:bg-zinc-900 hover:text-blue-550'
                  }`}
                  title="Toggle Comments Panel"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">Comments</span>
                </button>
              )}
            </div>

            {publishedDashboards.length > 0 && (
              <nav className={`flex-1 grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[82px] scrollbar-none p-1.5 rounded-2xl border ml-2 ${
                activeTheme 
                  ? `${activeTheme.sidebarBorder} bg-white/30 dark:bg-black/10` 
                  : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-805/30'
              }`}>
                {publishedDashboards.map((db) => {
                  const isSelected = db.id === selectedDashboardId;
                  return (
                    <button
                      key={db.id}
                      onClick={() => setSelectedDashboardId(db.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center truncate ${
                        isSelected
                          ? activeTheme ? activeTheme.sidebarActive : 'bg-zinc-900 text-white'
                          : activeTheme ? activeTheme.sidebarInactive : 'text-zinc-555 dark:text-zinc-450 hover:text-zinc-900'
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
        )}         <main className={`flex-1 flex gap-6 overflow-hidden ${isPresentationMode ? 'p-0' : 'p-6'}`}>
          {publishedDashboards.length === 0 ? (
            <div className="h-full flex-1 flex items-center justify-center py-12">
              <div className="max-w-xl text-center space-y-6 p-8 glass-panel bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-blue-500/10 dark:bg-blue-500/5 rounded-full animate-ping" />
                  <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-xl shadow-blue-500/10">
                    <Grid className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-555 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                    Standby Status
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                    Analytics Console Offline
                  </h2>
                  <p className="text-xs text-zinc-555 dark:text-zinc-450 leading-relaxed max-w-md mx-auto font-medium">
                    No analytical dashboards are currently published to the live terminal. The portal is ready and waiting for report uploads.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* PDF Viewer */}
              <div className="flex-1 min-w-0 h-full relative">
                {activeDashboard ? (
                  <div className="relative w-full h-full">
                    {isPresentationMode && (
                      <div className={`absolute inset-0 bg-transparent z-10 ${showControls ? 'cursor-default' : 'cursor-none'}`} />
                    )}
                    <PdfViewer
                      dashboardId={selectedDashboardId}
                      dashboardName={activeDashboard.name}
                      pdfType={activeDashboard.pdfType}
                      fileName={activeDashboard.fileName}
                      fileSize={activeDashboard.fileSize}
                      isFullscreen={isPresentationMode}
                      activeTheme={activeTheme}
                    />
                  </div>
                ) : null}
              </div>

              {/* Collaborative Comments Panel */}
              {!isPresentationMode && isCommentsOpen && (
                <div className="w-80 shrink-0 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg flex flex-col h-full relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
                  
                  {/* Comments Header */}
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between mt-[3px] shrink-0">
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span>Collaborative Notes</span>
                      </h4>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider mt-0.5">
                        Real-time dashboard feedback
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsCommentsOpen(false)}
                      className="p-1 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/40 dark:bg-zinc-950/20 scrollbar-none animate-fade-in">
                    {activeComments.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                        <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">No notes yet</p>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-normal max-w-[180px]">Be the first to post a collaborative note here!</p>
                      </div>
                    ) : (
                      activeComments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className="bg-white dark:bg-[#09090b] border border-zinc-200/60 dark:border-zinc-800/80 p-3 rounded-xl shadow-sm space-y-1 group relative transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-blue-500 tracking-wide block">
                                {comment.author}
                              </span>
                              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5">
                                {comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </span>
                            </div>
                            
                            {isAdminLoggedIn && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-955/30 text-zinc-400 hover:text-rose-600 transition-opacity cursor-pointer absolute top-2 right-2"
                                title="Delete Note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-250 whitespace-pre-wrap leading-relaxed pr-6">
                            {comment.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Comment Input Box */}
                  <form onSubmit={handleAddCommentSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] space-y-2 shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (e.g. Supervisor)"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-1.5 items-end">
                      <textarea
                        placeholder="Type a sticky note..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        rows={2}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 resize-none"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer h-fit"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
        
        {!isPresentationMode && (
          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-[#0c0c0f]/40 py-5 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-550">
            <p>© 2026 Manufacturing Dashboard. Secure administrative data synchronization active.</p>
          </footer>
        )}

        {/* TV Presentation Mode Floating Dock Controls */}
        {isPresentationMode && (
          <div 
            onMouseEnter={handleDockMouseEnter}
            onMouseLeave={handleDockMouseLeave}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/95 text-white border border-zinc-800 rounded-2xl px-5 py-3 flex items-center gap-5 shadow-2xl backdrop-blur-md select-none transition-all duration-500 ${
              showControls 
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
            }`}
          >
            
            {/* Play/Pause */}
            <button
              onClick={() => setPresentationPlaying(!presentationPlaying)}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white hover:text-blue-400 transition-all cursor-pointer border border-zinc-800"
              title={presentationPlaying ? "Pause Slideshow" : "Play Slideshow"}
            >
              {presentationPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Previous */}
            <button
              onClick={() => {
                const currentIndex = publishedDashboards.findIndex(d => d.id === selectedDashboardId);
                const prevIndex = (currentIndex - 1 + publishedDashboards.length) % publishedDashboards.length;
                setSelectedDashboardId(publishedDashboards[prevIndex].id);
              }}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800"
              title="Previous Dashboard"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Active Title & Progress Info */}
            <div className="text-center min-w-[180px] max-w-[240px]">
              <p className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest truncate">
                {activeDashboard ? activeDashboard.name : 'Dashboard'}
              </p>
              <p className="text-[9px] font-bold text-blue-400 mt-0.5">
                {presentationPlaying ? `Advancing in ${secondsRemaining}s` : 'Paused'}
              </p>
            </div>

            {/* Next */}
            <button
              onClick={() => {
                const currentIndex = publishedDashboards.findIndex(d => d.id === selectedDashboardId);
                const nextIndex = (currentIndex + 1) % publishedDashboards.length;
                setSelectedDashboardId(publishedDashboards[nextIndex].id);
              }}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800"
              title="Next Dashboard"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-zinc-800" />

            {/* Time Interval Selector/Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Interval:</span>
              <select
                value={presentationInterval}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPresentationInterval(val);
                  setSecondsRemaining(val);
                }}
                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-zinc-800" />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800"
              title="Toggle Fullscreen"
            >
              {document.fullscreenElement ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Exit Presentation Mode */}
            <button
              onClick={handleExitPresentation}
              className="p-2 bg-rose-955/40 hover:bg-rose-900/50 rounded-lg text-rose-455 transition-all cursor-pointer border border-rose-900/30"
              title="Exit Presentation Mode"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        )}
      </div>

      {/* Combined PDF Export Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xl rounded-2xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
            <div className="p-6 space-y-5">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Download className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Export Combined Reports</span>
                  </h3>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Select dashboards to merge into a single PDF
                  </p>
                </div>
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-405 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Select All Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-150 dark:border-zinc-800/60">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Select All Published ({publishedDashboards.length})</span>
                <input
                  type="checkbox"
                  checked={selectedDownloadIds.length === publishedDashboards.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDownloadIds(publishedDashboards.map(d => d.id));
                    } else {
                      setSelectedDownloadIds([]);
                    }
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                />
              </div>

              {/* Checklist Body */}
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
                {publishedDashboards.map(db => {
                  const isChecked = selectedDownloadIds.includes(db.id);
                  return (
                    <label
                      key={db.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-150/70 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400">#{db.id}</span>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{db.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedDownloadIds(selectedDownloadIds.filter(id => id !== db.id));
                          } else {
                            setSelectedDownloadIds([...selectedDownloadIds, db.id]);
                          }
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>

              {/* Error Display */}
              {downloadError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-2.5 rounded-lg text-xs font-bold text-rose-600 leading-normal">
                  {downloadError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="px-4 py-2 border border-zinc-250 dark:border-zinc-750 hover:bg-zinc-55 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs rounded-lg transition-all cursor-pointer"
                  disabled={isDownloading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMergeAndDownload}
                  disabled={isDownloading || selectedDownloadIds.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:dark:bg-zinc-800 disabled:text-zinc-450 disabled:dark:text-zinc-650 text-white font-extrabold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Combined PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span> Download Combined PDF ({selectedDownloadIds.length})</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Premium Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm select-none">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                confirmModal.isAlert
                  ? 'bg-amber-50 dark:bg-amber-955/20 border-amber-100 dark:border-amber-900/30 text-amber-500'
                  : 'bg-rose-50 dark:bg-rose-955/20 border-rose-105 dark:border-rose-900/30 text-rose-500'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-905 dark:text-white uppercase tracking-wider">
                  {confirmModal.title}
                </h3>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                  {confirmModal.isAlert ? 'Validation Warning' : 'Verification Required'}
                </p>
              </div>
            </div>
            
            <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 leading-relaxed">
              {confirmModal.message}
            </p>
            
            <div className="flex items-center justify-end gap-2.5 pt-2">
              {!confirmModal.isAlert && (
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-transparent text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer shadow-sm"
                >
                  No, Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-md ${
                  confirmModal.isAlert
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                }`}
              >
                {confirmModal.isAlert ? 'OK' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
