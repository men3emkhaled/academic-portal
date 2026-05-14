import React, { useState, useEffect, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, QrCode, Plus, CheckCircle2, Circle, Search, X, Edit2, 
  Trash2, Save, FileSpreadsheet, Calendar, Clock, ChevronRight, 
  UserPlus, History, BarChart2, Zap, Sparkles, ShieldCheck,
  Target, Activity, ArrowRight, UserCheck
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const DoctorAttendance = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [editSessionTitle, setEditSessionTitle] = useState('');
  const scanLock = useRef(false);
  const lastScanned = useRef('');

  useEffect(() => {
    if (selectedCourseId) {
      fetchSessions();
      fetchCourseStudents();
      setActiveSession(null);
      setRecords([]);
      setScanning(false);
      setIsEditingSession(false);
    } else {
      setSessions([]);
      setStudents([]);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (activeSession) {
      fetchRecords();
      setEditSessionTitle(activeSession.title || '');
      setIsEditingSession(false);
    }
  }, [activeSession]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/attendance/${selectedCourseId}/sessions`);
      setSessions(res.data);
    } catch (err) {
      toast.error('Failed to synchronize session logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async () => {
    try {
      const res = await doctorApi('get', `/doctor/students/${selectedCourseId}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await doctorApi('get', `/doctor/attendance/sessions/${activeSession.id}/records`);
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to load performance records');
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await doctorApi('post', '/doctor/attendance/sessions', {
        courseId: selectedCourseId
      });
      setSessions([res.data, ...sessions]);
      setActiveSession(res.data);
      toast.success('Neural sync session initialized');
    } catch (err) {
      toast.error('Failed to initialize session');
    }
  };

  const handleScan = async (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0 || !activeSession) return;
    
    const tokenValue = detectedCodes[0]?.rawValue || '';
    if (!tokenValue) return;

    if (scanLock.current || tokenValue === lastScanned.current) return;
    scanLock.current = true;
    lastScanned.current = tokenValue;

    const toastId = toast.loading('Synchronizing identity...');

    try {
      const res = await doctorApi('post', '/doctor/attendance/scan', {
        sessionId: activeSession.id,
        token: tokenValue
      });
      toast.success(`${res.data.student.name} synchronized`, { id: toastId });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identity verification failed', { id: toastId });
    } finally {
      setTimeout(() => {
        scanLock.current = false;
        lastScanned.current = '';
      }, 1500);
    }
  };

  const handleManualToggle = async (studentId) => {
    try {
      const res = await doctorApi('post', '/doctor/attendance/manual', {
        sessionId: activeSession.id,
        studentId
      });
      toast.success(res.data.status === 'present' ? 'Identity verified' : 'Sync removed');
      fetchRecords();
    } catch (err) {
      toast.error('Performance sync failed');
    }
  };

  const handleUpdateSession = async () => {
    if (!editSessionTitle.trim()) return;
    try {
      const res = await doctorApi('put', `/doctor/attendance/sessions/${activeSession.id}`, {
        title: editSessionTitle
      });
      setSessions(sessions.map(s => s.id === activeSession.id ? res.data : s));
      setActiveSession(res.data);
      setIsEditingSession(false);
      toast.success('Session label updated');
    } catch (err) {
      toast.error('Failed to update session label');
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Terminate this session permanently?')) return;
    try {
      await doctorApi('delete', `/doctor/attendance/sessions/${activeSession.id}`);
      setSessions(sessions.filter(s => s.id !== activeSession.id));
      setActiveSession(null);
      toast.success('Session terminated');
    } catch (err) {
      toast.error('Termination failed');
    }
  };

  const handleExportAttendance = async () => {
    try {
      const res = await doctorApi('get', `/doctor/attendance/${selectedCourseId}/export`);
      const { sessions: sessionList, data: attendanceData } = res.data;
      if (!attendanceData.length) return toast.error('No sync data available');

      const headers = ['Student ID', 'Student Name', 'Section', ...sessionList.map(s => s.title || new Date(s.date).toLocaleDateString()), 'Total Present', 'Percentage %'];
      const csvRows = [headers.join(',')];

      attendanceData.forEach(student => {
        const row = [student.id, `"${student.name}"`, `"${student.section || ''}"`, ...sessionList.map(s => student.attendance[s.id]), student.total_present, `${student.percentage}%`];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const courseName = courses.find(c => c.id === parseInt(selectedCourseId))?.name || 'Course';
      link.setAttribute("href", url);
      link.setAttribute("download", `${courseName}_Attendance_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Attendance manifest exported');
    } catch (err) {
      toast.error('Export protocols failed');
    }
  };

  const presentStudentIds = records.map(r => String(r.student_id));
  const filteredStudents = students.filter(s => {
    const sName = (s.name || s.student_name || '').toLowerCase();
    const sId = String(s.id || s.student_id || '');
    const query = searchQuery.toLowerCase();
    return sName.includes(query) || sId.includes(query);
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-12"
    >
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Real-time Monitoring</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Attendance Hub</h2>
          <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-xl">
            Synchronize student presence through neural QR scanning and manual manifest management.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {selectedCourseId && (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateSession}
                className="bg-emerald-500 text-white font-black px-8 py-4.5 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-4 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest">Initialize Sync</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportAttendance}
                className="bg-gray-900 dark:bg-white text-white dark:text-black font-black px-8 py-4.5 rounded-2xl shadow-2xl shadow-black/10 flex items-center gap-4 transition-all"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest">Export Manifest</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Course & Sessions Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Source Selection</h3>
            <div className="relative group">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl p-5 pr-12 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Target Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mission Logs</h3>
              <History className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {!selectedCourseId ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem]">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Awaiting Module</p>
                </div>
              ) : loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse"></div>
                ))
              ) : sessions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-[9px] font-black uppercase tracking-widest">No Sessions Detected</div>
              ) : (
                sessions.map(session => (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`w-full group text-left p-6 rounded-2xl border transition-all relative overflow-hidden ${
                      activeSession?.id === session.id
                        ? 'bg-emerald-500/[0.05] border-emerald-500/30'
                        : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-emerald-500/20'
                    }`}
                  >
                    {activeSession?.id === session.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.5)]"></div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                        {session.title || `Session Sync #${session.id}`}
                      </div>
                      <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">ARCHIVE</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase">{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase">{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {!activeSession ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-20 text-center shadow-sm h-full flex flex-col items-center justify-center min-h-[600px]"
              >
                <div className="w-32 h-32 rounded-full bg-emerald-500/5 flex items-center justify-center mb-10">
                  <Activity className="w-16 h-16 text-emerald-500/20 animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Workspace Offline</h3>
                <p className="text-gray-400 font-semibold max-w-sm mx-auto">
                  Initialize a new session or select a log from the history to begin real-time student synchronization.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Control Panel */}
                <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-6">
                        {isEditingSession ? (
                          <div className="flex items-center gap-4 flex-1 max-w-md">
                            <input
                              type="text"
                              value={editSessionTitle}
                              onChange={(e) => setEditSessionTitle(e.target.value)}
                              className="flex-1 bg-gray-50 dark:bg-black border-2 border-emerald-500/30 rounded-2xl px-6 py-3.5 text-sm font-black focus:ring-4 focus:ring-emerald-500/5 outline-none text-gray-900 dark:text-white"
                              autoFocus
                            />
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleUpdateSession} className="p-4 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20"><Save className="w-5 h-5" /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsEditingSession(false)} className="p-4 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-xl"><X className="w-5 h-5" /></motion.button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-6 group">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                              {activeSession.title || 'Live Session Log'}
                            </h2>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => setIsEditingSession(true)} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={handleDeleteSession} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Neural Sync Stats</p>
                          <p className="text-3xl font-black text-gray-900 dark:text-white">
                            {records.length} <span className="text-sm text-gray-400 opacity-60">/ {students.length}</span>
                          </p>
                        </div>
                        <div className="w-px h-10 bg-gray-100 dark:bg-white/5"></div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Presence Density</p>
                          <p className="text-3xl font-black text-emerald-500">
                            {students.length ? Math.round((records.length / students.length) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setScanning(!scanning)}
                      className={`h-28 px-12 rounded-[2.5rem] font-black flex items-center gap-6 transition-all shadow-2xl ${
                        scanning 
                          ? 'bg-rose-500 text-white shadow-rose-500/20' 
                          : 'bg-emerald-500 text-white shadow-emerald-500/20'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        {scanning ? <X className="w-8 h-8" /> : <QrCode className="w-8 h-8" />}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{scanning ? 'Emergency' : 'Neural'}</p>
                        <p className="text-2xl leading-none uppercase tracking-widest">{scanning ? 'Stop' : 'Scan'}</p>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {scanning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-[#0f0f0f] shadow-2xl relative bg-black aspect-video lg:aspect-auto lg:h-[400px]"
                  >
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="w-full h-full border-[80px] border-black/40 flex items-center justify-center">
                        <div className="w-full h-full max-w-[300px] max-h-[300px] border-2 border-emerald-400/50 rounded-[3rem] relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,1)] animate-scan-y"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Target className="w-12 h-12 text-emerald-400/20 animate-ping" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Scanner 
                      onScan={handleScan} 
                      onError={(err) => console.log(err)} 
                      scanDelay={300}
                      components={{ audio: false, finder: false }}
                    />
                  </motion.div>
                )}

                {/* Manifest Grid */}
                <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Student Manifest</h3>
                    </div>
                    <div className="relative group w-full md:w-96">
                      <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Filter manifest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm font-black focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {filteredStudents.length === 0 ? (
                      <div className="col-span-full py-20 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">No Records Detected</p>
                      </div>
                    ) : (
                      filteredStudents.map(student => {
                        const sId = String(student.id || student.student_id || student.student?.id || '');
                        const sName = student.name || student.student_name || student.student?.name || 'Unknown Student';
                        const isPresent = presentStudentIds.includes(sId);
                        return (
                          <div 
                            key={sId}
                            onClick={() => handleManualToggle(sId)}
                            className={`flex items-center justify-between p-5 rounded-[2.5rem] border cursor-pointer transition-all active:scale-95 group ${
                              isPresent 
                                ? 'bg-emerald-500/[0.05] border-emerald-500/30' 
                                : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-emerald-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center font-black transition-all border ${
                                isPresent ? 'bg-emerald-500 text-white border-emerald-500/20 shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent'
                              }`}>
                                {student.avatar_url ? (
                                  <img src={student.avatar_url} alt={sName} className="w-full h-full object-cover" />
                                ) : (
                                  sName.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`font-black text-sm truncate max-w-[150px] ${isPresent ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                  {sName}
                                </p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {sId}</p>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              isPresent ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-300'
                            }`}>
                              {isPresent ? <ShieldCheck className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes scan-y {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(140px); }
        }
        .animate-scan-y { animation: scan-y 2.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(16, 185, 129, 0.1); 
          border-radius: 10px; 
        }
      `}</style>
    </motion.div>
  );
};

export default DoctorAttendance;

