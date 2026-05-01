import React, { useState, useEffect, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Users, QrCode, Plus, CheckCircle2, Circle, Search, X, Edit2, Trash2, Save, FileSpreadsheet } from 'lucide-react';
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

    // Prevent duplicate scans of the same QR
    if (scanLock.current || tokenValue === lastScanned.current) return;
    scanLock.current = true;
    lastScanned.current = tokenValue;

    // Show instant loading feedback
    const toastId = toast.loading('Scanning...');

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
      // Allow next scan after a short delay
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
    if (!window.confirm('Are you sure you want to delete this session and all its attendance records?')) return;
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
      
      const csvRows = [];
      csvRows.push(headers.join(','));

      attendanceData.forEach(student => {
        const row = [
          student.id,
          `"${student.name}"`,
          `"${student.section || ''}"`,
          ...sessionList.map(s => student.attendance[s.id]),
          student.total_present,
          `${student.percentage}%`
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const courseName = courses.find(c => c.id === parseInt(selectedCourseId))?.name || 'Course';
      link.setAttribute("href", url);
      link.setAttribute("download", `${courseName}_Attendance_Sheet.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Attendance sheet exported');
    } catch (err) {
      toast.error('Failed to export attendance');
    }
  };

  const presentStudentIds = records.map(r => r.student_id);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-500" /> Attendance Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
            Scan student QR codes or mark them manually
          </p>
        </div>
      </div>

      {/* Course Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="flex-1 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 text-gray-900 dark:text-white font-medium focus:border-teal-500/50 focus:outline-none transition-colors"
        >
          <option value="">-- Select a Course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {selectedCourseId && (
          <button
            onClick={handleCreateSession}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/20 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        )}
        {selectedCourseId && sessions.length > 0 && (
          <button
            onClick={handleExportAttendance}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Sheet
          </button>
        )}
      </div>

      {!selectedCourseId ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
          <QrCode className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">Select a course to manage attendance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Past Sessions</h3>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-white/5 rounded-xl"></div>)}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-gray-500">No sessions yet. Create one to start.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      activeSession?.id === session.id
                        ? 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30'
                        : 'bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-teal-500/30'
                    }`}
                  >
                    <div className="font-bold text-gray-900 dark:text-white">
                      {session.title || new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(session.created_at).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Session Area */}
          <div className="lg:col-span-2">
            {!activeSession ? (
              <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 font-medium">Select a session from the list to view or scan attendance</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex-1">
                    {isEditingSession ? (
                      <div className="flex items-center gap-2 max-w-sm">
                        <input
                          type="text"
                          value={editSessionTitle}
                          onChange={(e) => setEditSessionTitle(e.target.value)}
                          placeholder="Session Name (e.g. Week 1)"
                          className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleUpdateSession} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditingSession(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-xl text-gray-900 dark:text-white">
                          {activeSession.title || `Session: ${new Date(activeSession.date).toLocaleDateString()}`}
                        </h3>
                        <button onClick={() => setIsEditingSession(true)} className="text-gray-400 hover:text-teal-500 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={handleDeleteSession} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-bold mt-1">
                      {records.length} / {students.length} Present
                    </p>
                  </div>
                  <button
                    onClick={() => setScanning(!scanning)}
                    className={`px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all whitespace-nowrap ${
                      scanning 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400' 
                        : 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20'
                    }`}
                  >
                    {scanning ? (
                      <><X className="w-4 h-4" /> Stop Scanning</>
                    ) : (
                      <><QrCode className="w-4 h-4" /> Start Scanner</>
                    )}
                  </button>
                </div>

                {scanning && (
                  <div className="mb-6 rounded-2xl overflow-hidden border-4 border-doctor-sidebar dark:border-doctor-card shadow-2xl relative">
                    <div className="absolute inset-0 border-[40px] border-black/40 z-10 pointer-events-none">
                      <div className="w-full h-full border-2 border-teal-500 rounded-2xl relative">
                        {/* Scanning animation line */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                    <Scanner 
                      onScan={(detectedCodes) => handleScan(detectedCodes)} 
                      onError={(err) => console.log(err)} 
                      scanDelay={300}
                      components={{ audio: false, finder: false }}
                    />
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students to mark manually..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-teal-500 focus:outline-none transition-colors dark:text-white"
                  />
                </div>

                {/* Students List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredStudents.map(student => {
                    const isPresent = presentStudentIds.includes(student.id);
                    return (
                      <div 
                        key={student.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isPresent 
                            ? 'bg-teal-50/50 dark:bg-teal-500/5 border-teal-200/50 dark:border-teal-500/20' 
                            : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm ${
                            isPresent ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                          }`}>
                            {student.avatar_url ? (
                              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isPresent ? 'text-teal-900 dark:text-teal-100' : 'text-gray-900 dark:text-white'}`}>
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">{student.id}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleManualToggle(student.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isPresent
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20'
                          }`}
                        >
                          {isPresent ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default DoctorAttendance;
