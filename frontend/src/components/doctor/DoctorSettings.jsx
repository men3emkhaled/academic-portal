import React, { useState, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, Book, Shield, Moon, Sun, 
  Camera, Save, Lock, Bell, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

const DoctorSettings = () => {
  const { doctor, doctorApi, login, token } = useDoctorAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    bio: doctor?.bio || '',
    phone: doctor?.phone || '',
    avatar_url: doctor?.avatar_url || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await doctorApi('put', '/doctor/profile', profileData);
      login(token, res.data); // Update context with new doctor data
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        return toast.error('Please select an image file');
    }

    if (file.size > 2 * 1024 * 1024) {
        return toast.error('Image size must be less than 2MB');
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await doctorApi('post', '/doctor/upload-avatar', formData, {
            'Content-Type': 'multipart/form-data'
        });
        const newAvatarUrl = res.data.avatar_url;
        setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
        
        // Update context
        const updatedDoctor = { ...doctor, avatar_url: newAvatarUrl };
        login(token, updatedDoctor);
        
        toast.success('Profile picture updated!');
    } catch (err) {
        console.error('Upload error:', err);
        toast.error('Failed to upload image');
    } finally {
        setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await doctorApi('put', '/doctor/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const SECTIONS = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: isDarkMode ? Moon : Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-doctor-text tracking-tight mb-2">Settings</h2>
          <p className="text-doctor-text-muted font-medium">Manage your account preferences and security settings.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hidden-scrollbar">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-doctor-primary text-white shadow-lg shadow-doctor-primary/20' 
                    : 'text-doctor-text-muted hover:text-doctor-text hover:bg-doctor-text/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-doctor-card border border-white/[0.03] rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-doctor-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

           {activeSection === 'profile' && (
             <div className="space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-10">
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-doctor-primary to-doctor-secondary p-[3px] shadow-2xl relative overflow-hidden">
                         <div className="w-full h-full rounded-[2.2rem] bg-doctor-sidebar flex items-center justify-center overflow-hidden">
                            <img 
                              src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff&size=256`} 
                              alt="Avatar" 
                              className={`w-full h-full object-cover transition-opacity ${uploadingAvatar ? 'opacity-30' : 'opacity-100'}`}
                            />
                         </div>
                         {uploadingAvatar && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <Loader2 className="w-8 h-8 text-white animate-spin" />
                             </div>
                         )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                      <button 
                        type="button"
                        disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-doctor-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-doctor-card disabled:opacity-50"
                        onClick={() => fileInputRef.current.click()}
                      >
                         <Camera className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="text-center md:text-left">
                      <h4 className="text-2xl font-black text-doctor-text mb-1">{doctor?.name}</h4>
                      <p className="text-doctor-text-muted font-bold uppercase tracking-widest text-xs">{doctor?.department || 'Senior Instructor'}</p>
                   </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                            <User className="w-3 h-3" /> Full Name
                        </label>
                        <input 
                            type="text" 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Phone Number
                        </label>
                        <input 
                            type="text" 
                            value={profileData.phone}
                            placeholder="+20 123 456 7890"
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Book className="w-3 h-3" /> Department
                        </label>
                        <input 
                            type="text" 
                            value={doctor?.department || ''}
                            disabled
                            className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 px-6 text-doctor-text-muted transition-all font-medium cursor-not-allowed"
                        />
                    </div>
                    </div>

                    <div className="space-y-2">
                    <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Professional Bio</label>
                    <textarea 
                        rows="4"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about your academic background..."
                        className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium resize-none"
                    />
                    </div>

                    <button 
                    type="submit"
                    disabled={loading}
                    className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl shadow-doctor-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                    {loading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <>
                        <Save className="w-5 h-5" />
                        <span>Save Profile Changes</span>
                        </>
                    )}
                    </button>
                </form>
             </div>
           )}

           {activeSection === 'security' && (
             <form onSubmit={handlePasswordChange} className="space-y-8 relative z-10 max-w-xl">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-amber-500" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-doctor-text">Password & Security</h4>
                      <p className="text-doctor-text-muted text-sm font-medium">Update your password to keep your account safe.</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-amber-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
             </form>
           )}

           {activeSection === 'appearance' && (
             <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                      <Sun className="w-7 h-7 text-indigo-500" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-doctor-text">Appearance Settings</h4>
                      <p className="text-doctor-text-muted text-sm font-medium">Customize how the portal looks on your device.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                     onClick={() => !isDarkMode && toggleTheme()}
                     className={`p-6 rounded-3xl border transition-all text-left group relative ${
                       isDarkMode ? 'bg-doctor-primary/10 border-doctor-primary/30' : 'bg-doctor-text/5 border-white/[0.03] hover:border-doctor-text/10 shadow-sm'
                     }`}
                   >
                      <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all ${
                        isDarkMode ? 'bg-doctor-primary text-white' : 'bg-doctor-text/10 text-doctor-text-muted'
                      }`}>
                         <Moon className="w-6 h-6" />
                      </div>
                      <h5 className="font-bold text-doctor-text mb-1">Dark Mode</h5>
                      <p className="text-xs text-doctor-text-muted">Easier on the eyes in low-light environments.</p>
                      {isDarkMode && <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-doctor-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" />}
                   </button>

                   <button 
                     onClick={() => isDarkMode && toggleTheme()}
                     className={`p-6 rounded-3xl border transition-all text-left group relative ${
                       !isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 shadow-sm shadow-indigo-500/10' : 'bg-doctor-text/5 border-white/[0.03] hover:border-doctor-text/10'
                     }`}
                   >
                      <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all ${
                        !isDarkMode ? 'bg-indigo-500 text-white' : 'bg-doctor-text/10 text-doctor-text-muted'
                      }`}>
                         <Sun className="w-6 h-6" />
                      </div>
                      <h5 className="font-bold text-doctor-text mb-1">Light Mode</h5>
                      <p className="text-xs text-doctor-text-muted">Traditional clean look with high contrast.</p>
                      {!isDarkMode && <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                   </button>
                </div>
             </div>
           )}

           {activeSection === 'notifications' && (
             <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                      <Bell className="w-7 h-7 text-rose-500" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-doctor-text">Notification Settings</h4>
                      <p className="text-doctor-text-muted text-sm font-medium">Choose what updates you want to receive.</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {[
                     { id: 'email_tasks', label: 'Email for new tasks', desc: 'Get an email whenever an admin assigns a task.' },
                     { id: 'push_submissions', label: 'Student Submissions', desc: 'Push notification when a student submits an assignment.' },
                     { id: 'email_announcements', label: 'Portal Announcements', desc: 'Receive major portal updates and news.' },
                   ].map((item) => (
                     <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-doctor-text/5 border border-white/[0.03]">
                        <div className="flex-1 pr-4">
                           <h5 className="font-bold text-doctor-text mb-1">{item.label}</h5>
                           <p className="text-xs text-doctor-text-muted">{item.desc}</p>
                        </div>
                        <div className="w-14 h-8 bg-doctor-text/10 rounded-full relative p-1 cursor-pointer hover:bg-doctor-text/20 transition-all">
                           <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-start gap-4 mt-8">
                   <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                   <p className="text-sm text-rose-200 font-medium leading-relaxed">
                      Push notifications are currently disabled in your browser settings. Please enable them to receive real-time updates.
                   </p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
