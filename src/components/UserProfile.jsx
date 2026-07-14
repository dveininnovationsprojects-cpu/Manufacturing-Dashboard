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
  X 
} from 'lucide-react';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><path d="M50 22c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 35c-16.6 0-30 10-30 22.5h60c0-12.5-13.4-22.5-30-22.5z" fill="white" opacity="0.95"/></svg>`;

export default function UserProfile({ profile, onUpdateProfile, onLogout }) {
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
  const [linkedin, setLinkedin] = useState(profile.linkedin);
  const [github, setGithub] = useState(profile.github);
  const [avatar, setAvatar] = useState(profile.avatar);

  // Security Credentials Local States
  const [adminUsername, setAdminUsername] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef(null);

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

  const handleSave = (e) => {
    e.preventDefault();
    setFeedback(null);

    // If changing security details (username or password)
    const savedPassword = localStorage.getItem('admin_auth_password') || 'admin@123';
    const isSecurityUpdating = newPassword || adminUsername !== (localStorage.getItem('admin_username') || 'admin');

    if (isSecurityUpdating) {
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
        localStorage.setItem('admin_auth_password', newPassword);
      }
      localStorage.setItem('admin_username', adminUsername);
      
      // Reset security password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    // Save profile details
    const updatedProfile = {
      ...profile,
      fullName,
      email,
      status,
      joinedDate,
      about,
      specializations: specializationsText.split(',').map(s => s.trim()).filter(Boolean),
      phone,
      linkedin,
      github,
      avatar
    };

    onUpdateProfile(updatedProfile);
    setIsEditing(false);
    showFeedbackMsg('success', 'Profile updated successfully!');
  };

  const triggerFileSelect = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-all duration-300">
      {/* Feedback Alert toast */}
      {feedback && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900' 
            : 'bg-rose-50 dark:bg-rose-955/90 text-rose-600 dark:text-rose-400 border-rose-250 dark:border-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="relative bg-gradient-to-r from-purple-800 via-indigo-700 to-violet-750 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden border border-purple-500/10">
        {/* Curved concentric background graphics */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-44 h-44 bg-white/5 rounded-full -mb-12 pointer-events-none" />
        <div className="absolute left-1/3 top-1/2 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 blur-2xl pointer-events-none" />

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
              <p className="text-xs text-purple-200/70 font-medium">
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
                    setLinkedin(profile.linkedin);
                    setGithub(profile.github);
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
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
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
        
        {/* Left Side: About, Specializations, Contact */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ABOUT Card */}
          <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-600" />
            <h3 className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block mb-3">
              About
            </h3>
            {isEditing ? (
              <textarea
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-600 transition-all"
                placeholder="Write biography details..."
              />
            ) : (
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-semibold leading-relaxed">
                {profile.about || "No bio description provided."}
              </p>
            )}
          </div>

          {/* SPECIALIZATIONS Card */}
          <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-600" />
            <h3 className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block mb-4">
              Specializations
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={specializationsText}
                onChange={(e) => setSpecializationsText(e.target.value)}
                placeholder="Skills separated by commas (e.g. HR, Management, Finance, operation)"
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-600 transition-all font-semibold"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.specializations && profile.specializations.length > 0 ? (
                  profile.specializations.map((spec, i) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-950/20 text-xs font-bold text-purple-700 dark:text-purple-300"
                    >
                      {spec}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-zinc-450 dark:text-zinc-550 italic font-semibold">No specializations specified.</p>
                )}
              </div>
            )}
          </div>

          {/* CONTACT Card */}
          <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-600" />
            <h3 className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block mb-4">
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
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">LinkedIn Username</label>
                  <input 
                    type="text" 
                    value={linkedin} 
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="e.g. sara-chen"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">GitHub Username</label>
                  <input 
                    type="text" 
                    value={github} 
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="e.g. sarachen"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.phone && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold text-zinc-700 dark:text-zinc-350">
                    <Phone className="w-3.5 h-3.5 text-purple-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.linkedin && (
                  <a 
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold text-zinc-700 dark:text-zinc-350 hover:border-purple-300 dark:hover:border-purple-800 hover:text-purple-600 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.github && (
                  <a 
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold text-zinc-700 dark:text-zinc-350 hover:border-purple-300 dark:hover:border-purple-800 hover:text-purple-600 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-850 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    <span>GitHub</span>
                  </a>
                )}
                {profile.email && (
                  <a 
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold text-zinc-700 dark:text-zinc-350 hover:border-purple-300 dark:hover:border-purple-800 hover:text-purple-600 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-500" />
                    <span>{profile.email}</span>
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Mentor Details & Security Credentials */}
        <div className="space-y-6">
          
          {/* MENTOR DETAILS Card */}
          <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-600" />
            <h3 className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block mb-4 border-b border-zinc-150 dark:border-zinc-850 pb-2">
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
                    className="p-1 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-right bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white max-w-[150px] focus:outline-none focus:border-purple-600"
                  />
                ) : (
                  <span className="font-bold text-zinc-850 dark:text-zinc-200">{profile.fullName}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-zinc-100 dark:border-zinc-900/40 pt-2 min-h-[28px]">
                <span className="font-semibold text-zinc-400 dark:text-zinc-500">Email</span>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-1 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-right bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white max-w-[150px] focus:outline-none focus:border-purple-600"
                  />
                ) : (
                  <span className="font-bold text-zinc-850 dark:text-zinc-200 truncate max-w-[160px]" title={profile.email}>{profile.email}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-zinc-100 dark:border-zinc-900/40 pt-2 min-h-[28px]">
                <span className="font-semibold text-zinc-400 dark:text-zinc-500">Account</span>
                {isEditing ? (
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="p-1 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-right bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white cursor-pointer focus:outline-none"
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
              <div className="flex justify-between items-center py-0.5 border-t border-zinc-100 dark:border-zinc-900/40 pt-2 min-h-[28px]">
                <span className="font-semibold text-zinc-400 dark:text-zinc-500">Joined</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    className="p-1 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-right bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white max-w-[150px] focus:outline-none focus:border-purple-600"
                  />
                ) : (
                  <span className="font-bold text-zinc-850 dark:text-zinc-200">{profile.joinedDate}</span>
                )}
              </div>
            </div>
          </div>

          {/* Security Credentials Card - Editable only in Edit Mode */}
          {isEditing && (
            <div className="glass-panel p-6 bg-white/60 dark:bg-[#0c0c0f]/60 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
              <h3 className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block mb-1">
                Security Credentials
              </h3>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold mb-3 leading-tight">
                Only fill these to update your administrator username or login password.
              </p>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Admin Username</label>
                  <input 
                    type="text" 
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Current Password (Required)</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Min 6 chars"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
