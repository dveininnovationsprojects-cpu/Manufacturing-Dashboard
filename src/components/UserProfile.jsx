import React, { useState, useRef } from 'react';
import { 
  User, 
  Lock, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Edit2, 
  Mail, 
  Phone, 
  X,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><path d="M50 22c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 35c-16.6 0-30 10-30 22.5h60c0-12.5-13.4-22.5-30-22.5z" fill="white" opacity="0.95"/></svg>`;

export default function UserProfile({ profile, onUpdateProfile, onLogout, activeTheme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Local Form States
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [status, setStatus] = useState(profile.status);
  const [joinedDate, setJoinedDate] = useState(profile.joinedDate);
  const [about, setAbout] = useState(profile.about);
  const [specializationsText, setSpecializationsText] = useState(profile.specializations.join(', '));
  const [phone, setPhone] = useState(profile.phone);
  const [website, setWebsite] = useState(profile.website || '');
  const [avatar, setAvatar] = useState(profile.avatar);

  // Security Credentials Local States
  const [adminUsername, setAdminUsername] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Eye Icon States for password visibility toggle
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Confirmation Modal state for security credentials update
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fileInputRef = useRef(null);

  // Theme Helpers
  const getThemeBgColor = () => {
    if (!activeTheme || !activeTheme.sidebarActive) return 'bg-purple-600';
    const match = activeTheme.sidebarActive.match(/(bg-\[?[#a-zA-Z0-9/-]+\]?)/);
    return match ? match[1] : 'bg-zinc-900';
  };

  const getThemeTextColor = () => {
    const bgClass = getThemeBgColor();
    return bgClass.replace('bg-', 'text-');
  };

  const showFeedbackMsg = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      showFeedbackMsg('error', 'Profile image must be less than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Saves general profile details
  const handleSave = (e) => {
    e.preventDefault();
    setFeedback(null);

    const updatedProfile = {
      ...profile,
      fullName,
      email,
      status,
      joinedDate,
      about,
      specializations: specializationsText.split(',').map(s => s.trim()).filter(Boolean),
      phone,
      website,
      avatar
    };

    onUpdateProfile(updatedProfile);
    setIsEditing(false);
    showFeedbackMsg('success', 'Profile details updated successfully!');
  };

  // Handles security credentials update specifically with a confirmation dialog
  const handleSecurityUpdate = () => {
    const savedPassword = localStorage.getItem('admin_auth_password') || 'admin@123';
    const isUsernameChanging = adminUsername !== (localStorage.getItem('admin_username') || 'admin');

    if (!isUsernameChanging && !newPassword && !currentPassword && !confirmPassword) {
      showFeedbackMsg('error', 'Please fill in the fields to update security credentials.');
      return;
    }

    if (!currentPassword) {
      showFeedbackMsg('error', 'Current password is required to update credentials.');
      return;
    }
    if (currentPassword !== savedPassword) {
      showFeedbackMsg('error', 'Current password does not match.');
      return;
    }
    if (newPassword) {
      if (newPassword.length < 6) {
        showFeedbackMsg('error', 'New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        showFeedbackMsg('error', 'New passwords do not match.');
        return;
      }
    }

    // Open yes/no modal for credential change verification
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Credentials Update',
      message: 'Are you sure you want to update the administrator credentials? You will need to use these credentials for future logins.',
      onConfirm: () => {
        if (newPassword) {
          localStorage.setItem('admin_auth_password', newPassword);
        }
        localStorage.setItem('admin_username', adminUsername);
        
        // Reset password input states
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        
        showFeedbackMsg('success', 'Security credentials updated successfully!');
      }
    });
  };

  const triggerFileSelect = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const themeTextClass = getThemeTextColor();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-all duration-300">
      {/* Feedback Alert toast */}
      {feedback && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/90 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900' 
            : 'bg-rose-50 dark:bg-rose-900/90 text-rose-600 dark:text-rose-400 border-rose-250 dark:border-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className={`relative rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden border border-white/5 ${
        activeTheme && activeTheme.sidebarActive 
          ? `${activeTheme.sidebarActive.replace('shadow-md', '').replace('font-extrabold', '')} bg-none`
          : 'bg-gradient-to-r from-purple-800 via-indigo-700 to-violet-750'
      }`}>
        {/* Curved concentric background graphics */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-44 h-44 bg-white/5 rounded-full -mb-12 pointer-events-none" />
        <div className="absolute left-1/3 top-1/2 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <div 
                onClick={triggerFileSelect}
                className={`relative group ${isEditing ? 'cursor-pointer' : ''} overflow-hidden rounded-full border-4 border-white/30 shadow-xl w-24 h-24 bg-white/10 flex items-center justify-center`}
                title={isEditing ? 'Click to change photo' : ''}
              >
                <img 
                  src={avatar || DEFAULT_AVATAR} 
                  alt={fullName} 
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase text-white">Change</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950" />
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none">
                {fullName}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {email}
              </p>
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-white/5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center shrink-0 gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    // Revert form states to profile props
                    setFullName(profile.fullName);
                    setEmail(profile.email);
                    setStatus(profile.status);
                    setJoinedDate(profile.joinedDate);
                    setAbout(profile.about);
                    setSpecializationsText(profile.specializations.join(', '));
                    setPhone(profile.phone);
                    setWebsite(profile.website || '');
                    setAvatar(profile.avatar);
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
                    activeTheme && activeTheme.sidebarActive ? activeTheme.sidebarActive : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/35 backdrop-blur-md text-white border border-white/20 font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: About, Contact */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ABOUT Card */}
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all duration-300 ${
            activeTheme ? activeTheme.card : 'glass-panel bg-white/60 dark:bg-[#0c0c0f]/60'
          }`}>

            <h3 className={`text-[10px] font-bold uppercase tracking-widest block mb-3 ${themeTextClass}`}>
              About
            </h3>
            {isEditing ? (
              <textarea
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-all focus:outline-none focus:ring-1 ${
                  activeTheme 
                    ? `${activeTheme.sidebarBorder} focus:border-current` 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-purple-600'
                }`}
                placeholder="Write biography details..."
              />
            ) : (
              <p className="text-xs font-semibold leading-relaxed">
                {profile.about || "No bio description provided."}
              </p>
            )}
          </div>

          {/* CONTACT Card */}
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all duration-300 ${
            activeTheme ? activeTheme.card : 'glass-panel bg-white/60 dark:bg-[#0c0c0f]/60'
          }`}>

            <h3 className={`text-[10px] font-bold uppercase tracking-widest block mb-4 ${themeTextClass}`}>
              Contact
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} focus:border-current` 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-purple-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} focus:border-current` 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-purple-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Web Site</label>
                  <input 
                    type="text" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. www.dvein.com"
                    className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} focus:border-current` 
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-purple-600'
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.phone && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold ${
                    activeTheme ? `${activeTheme.sidebarBorder}` : 'border-zinc-200'
                  }`}>
                    <Phone className={`w-3.5 h-3.5 ${themeTextClass}`} />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile.email && (
                  <a 
                    href={`mailto:${profile.email}`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold transition-all ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} hover:text-current` 
                        : 'border-zinc-200 hover:text-purple-600'
                    }`}
                  >
                    <Mail className={`w-3.5 h-3.5 ${themeTextClass}`} />
                    <span>{profile.email}</span>
                  </a>
                )}

                {profile.website && (
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold transition-all ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} hover:text-current` 
                        : 'border-zinc-200 hover:text-purple-600'
                    }`}
                  >
                    <Globe className={`w-3.5 h-3.5 ${themeTextClass}`} />
                    <span>{profile.website}</span>
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Admin Details & Security Credentials */}
        <div className="space-y-6">
          
          {/* ADMIN DETAILS Card */}
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all duration-300 ${
            activeTheme ? activeTheme.card : 'glass-panel bg-white/60 dark:bg-[#0c0c0f]/60'
          }`}>

            <h3 className={`text-[10px] font-bold uppercase tracking-widest block mb-4 border-b pb-2 ${themeTextClass} ${
              activeTheme ? activeTheme.sidebarBorder : 'border-zinc-150'
            }`}>
              Admin Details
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-0.5 min-h-[28px]">
                <span className="font-semibold text-zinc-400 dark:text-zinc-500">Full Name</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`p-1 rounded border text-xs font-semibold text-right bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white max-w-[150px] focus:outline-none focus:ring-1 ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} focus:border-current` 
                        : 'border-zinc-200 focus:border-purple-600'
                    }`}
                  />
                ) : (
                  <span className="font-bold">{profile.fullName}</span>
                )}
              </div>
              <div className={`flex justify-between items-center py-0.5 border-t pt-2 min-h-[28px] ${
                activeTheme ? activeTheme.sidebarBorder : 'border-zinc-100'
              }`}>
                <span className="font-semibold text-zinc-400 dark:text-zinc-500">Account</span>
                {isEditing ? (
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className={`p-1 rounded border text-xs font-semibold text-right bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 ${
                      activeTheme ? activeTheme.sidebarBorder : 'border-zinc-200'
                    }`}
                  >
                    <option value="Active">ACTIVE</option>
                    <option value="Inactive">INACTIVE</option>
                    <option value="Pending">PENDING</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 text-[10px] font-extrabold uppercase rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {profile.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Security Credentials Card - Editable only in Edit Mode */}
          {isEditing && (
            <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all duration-300 ${
              activeTheme ? activeTheme.card : 'glass-panel bg-white/60 dark:bg-[#0c0c0f]/60'
            }`}>

              <h3 className="text-[10px] font-bold text-rose-600 dark:text-rose-450 uppercase tracking-widest block mb-1">
                Security Credentials
              </h3>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold mb-3 leading-tight">
                Fill these fields to update your administrator username or login password.
              </p>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Admin Username</label>
                  <input 
                    type="text" 
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                      activeTheme 
                        ? `${activeTheme.sidebarBorder} focus:border-rose-500` 
                        : 'border-zinc-200 focus:border-rose-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full pl-3 pr-10 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                        activeTheme 
                          ? `${activeTheme.sidebarBorder} focus:border-rose-500` 
                          : 'border-zinc-200 focus:border-rose-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder="Min 6 chars"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full pl-3 pr-10 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                        activeTheme 
                          ? `${activeTheme.sidebarBorder} focus:border-rose-500` 
                          : 'border-zinc-200 focus:border-rose-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-3 pr-10 py-2 rounded-xl border text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold transition-all focus:outline-none focus:ring-1 ${
                        activeTheme 
                          ? `${activeTheme.sidebarBorder} focus:border-rose-500` 
                          : 'border-zinc-200 focus:border-rose-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm and Cancel Buttons inside Security Box */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername(localStorage.getItem('admin_username') || 'admin');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      showFeedbackMsg('success', 'Security changes cancelled.');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSecurityUpdate}
                    className="flex-1 flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Local Double-Confirmation Modal for Security Credentials Update */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm select-none">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30 text-rose-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${themeTextClass}`}>
                  {confirmModal.title}
                </h3>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-555 font-bold uppercase tracking-wider mt-0.5">
                  Verification Required
                </p>
              </div>
            </div>
            
            <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 leading-relaxed">
              {confirmModal.message}
            </p>
            
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-transparent text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer shadow-sm"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/10"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
