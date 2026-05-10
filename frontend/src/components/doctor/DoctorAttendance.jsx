import React, { useState, useEffect, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Users, QrCode, Plus, CheckCircle2, Circle, Search, X, Edit2, Trash2, Save, FileSpreadsheet, Calendar, Clock, ChevronRight, UserPlus, History, BarChart2 } from 'lucide-react';
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
      toast.error('Failed to load sessions');
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
      toast.error('Failed to load attendance records');
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await doctorApi('post', '/doctor/attendance/sessions', {
        courseId: selectedCourseId
      });
      setSessions([res.data, ...sessions]);
      setActiveSession(res.data);
      toast.success('New attendance session started');
    } catch (err) {
      toast.error('Failed to create session');
    }
  };

  const handleScan = async (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0 || !activeSession) return;
    
    const tokenValue = detectedCodes[0]?.rawValue || '';
    if (!tokenValue) return;

    if (scanLock.current || tokenValue === lastScanned.current) return;
    scanLock.current = true;
    lastScanned.current = tokenValue;

    const toastId = toast.loading('Processing Scan...');

    try {
      const res = await doctorApi('post', '/doctor/attendance/scan', {
        sessionId: activeSession.id,
        token: tokenValue
      });
      toast.success(`✅ ${res.data.student.name} marked present!`, { id: toastId });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid QR Code', { id: toastId });
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
      if (res.data.status === 'present') {
        toast.success('Marked present');
      } else {
        toast.success('Removed from attendance');
      }
      fetchRecords();
    } catch (err) {
      toast.error('Failed to update attendance');
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
      toast.success('Session renamed successfully');
    } catch (err) {
      toast.error('Failed to rename session');
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await doctorApi('delete', `/doctor/attendance/sessions/${activeSession.id}`);
      setSessions(sessions.filter(s => s.id !== activeSession.id));
      setActiveSession(null);
      toast.success('Session deleted successfully');
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const handleExportAttendance = async () => {
    try {
      const res = await doctorApi('get', `/doctor/attendance/${selectedCourseId}/export`);
      const { sessions: sessionList, data: attendanceData } = res.data;
      if (!attendanceData.length) return toast.error('No data to export');

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
      link.setAttribute("download", `${courseName}_Attendance.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Sheet exported successfully');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const presentStudentIds = records.map(r => r.student_id);
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery)
  );

  return (
    <div className="max-w-[1600px] mx-auto animate-fadeIn duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 md:p-12 mb-8 shadow-2xl shadow-emerald-500/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">Attendance</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-black uppercase tracking-widest">Real-time Sync</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedCourseId && (
              <>
                <button
                  onClick={handleCreateSession}
                  className="group flex items-center gap-3 bg-white text-emerald-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  New Session
                </button>
                <button
                  onClick={handleExportAttendance}
                  className="flex items-center gap-3 bg-emerald-400/20 backdrop-blur-md border border-emerald-400/30 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-emerald-400/30 shadow-xl"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Export Sheet
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Course & Sessions Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Source Control</h3>
            <div className="relative group">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl p-4 pr-12 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Target Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Session History</h3>
              <History className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {!selectedCourseId ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Awaiting Course</p>
                </div>
              ) : loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse"></div>
                ))
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No Active Logs</div>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`w-full group text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      activeSession?.id === session.id
                        ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                        : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-emerald-500/20'
                    }`}
                  >
                    {activeSession?.id === session.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                        {session.title || `Session #${session.id}`}
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">LIVE</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="lg:col-span-8">
          {!activeSession ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-16 text-center shadow-sm h-full flex flex-col items-center justify-center min-h-[600px]">
              <div className="w-32 h-32 rounded-full bg-emerald-50 dark:bg-emerald-500/5 flex items-center justify-center mb-8 animate-bounce-slow">
                <BarChart2 className="w-16 h-16 text-emerald-500/30" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Workspace Inactive</h3>
              <p className="text-sm text-gray-500 dark:text-slate-500 max-w-sm mx-auto font-medium">
                Initialize or select a session to begin real-time attendance tracking and student management.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Session Control Panel */}
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                  <div className="flex-1">
                    {isEditingSession ? (
                      <div className="flex items-center gap-4 max-w-lg">
                        <input
                          type="text"
                          value={editSessionTitle}
                          onChange={(e) => setEditSessionTitle(e.target.value)}
                          className="flex-1 bg-gray-50 dark:bg-black/40 border-2 border-emerald-500/30 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-900 dark:text-white"
                          autoFocus
                        />
                        <button onClick={handleUpdateSession} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-105 transition-all"><Save className="w-5 h-5" /></button>
                        <button onClick={() => setIsEditingSession(false)} className="p-3 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-xl"><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 group">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                          {activeSession.title || 'Live Session Log'}
                        </h2>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setIsEditingSession(true)} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={handleDeleteSession} className="p-2 text-gray-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 mt-6">
                      <div className="px-6 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Present Students</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                          {records.length} <span className="text-sm text-gray-400 font-medium">/ {students.length}</span>
                        </p>
                      </div>
                      <div className="px-6 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Attendance Rate</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                          {students.length ? Math.round((records.length / students.length) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setScanning(!scanning)}
                    className={`h-24 px-10 rounded-[2rem] font-black flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl ${
                      scanning 
                        ? 'bg-rose-500 text-white shadow-rose-500/20' 
                        : 'bg-emerald-500 text-white shadow-emerald-500/20'
                    }`}
                  >
                    {scanning ? <X className="w-8 h-8" /> : <QrCode className="w-8 h-8" />}
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{scanning ? 'Emergency' : 'Automatic'}</p>
                      <p className="text-lg leading-tight uppercase tracking-widest">{scanning ? 'Stop' : 'Scan'}</p>
                    </div>
                  </button>
                </div>
              </div>

              {scanning && (
                <div className="animate-fadeIn duration-500 rounded-[3rem] overflow-hidden border-8 border-white dark:border-[#0a0a0a] shadow-2xl relative">
                  <div className="absolute inset-0 border-[60px] border-black/40 z-10 pointer-events-none">
                    <div className="w-full h-full border-2 border-emerald-400/50 rounded-[2rem] relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,1)] animate-scan-y"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border border-emerald-400/30 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                  <Scanner 
                    onScan={handleScan} 
                    onError={(err) => console.log(err)} 
                    scanDelay={300}
                    components={{ audio: false, finder: false }}
                  />
                </div>
              )}

              {/* Student Management Area */}
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest">Student Manifest</h3>
                  </div>
                  <div className="relative group w-full sm:w-96">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search identifier or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                      <Search className="w-12 h-12 text-gray-100 dark:text-white/5 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Records Found</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const isPresent = presentStudentIds.includes(student.id);
                      return (
                        <div 
                          key={student.id}
                          onClick={() => handleManualToggle(student.id)}
                          className={`flex items-center justify-between p-4 rounded-3xl border cursor-pointer transition-all duration-300 active:scale-95 group ${
                            isPresent 
                              ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' 
                              : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-emerald-500/20'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center font-black transition-all ${
                              isPresent ? 'bg-emerald-500 text-white rotate-6' : 'bg-gray-100 text-gray-400 dark:bg-white/5 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6'
                            }`}>
                              {student.avatar_url ? (
                                <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                student.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className={`font-black text-sm uppercase tracking-tight ${isPresent ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                {student.name}
                              </p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{student.id}</p>
                            </div>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isPresent ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-300'
                          }`}>
                            {isPresent ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan-y {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(350px); }
        }
        .animate-scan-y { animation: scan-y 2.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(16, 185, 129, 0.2); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(16, 185, 129, 0.4); 
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default DoctorAttendance;

