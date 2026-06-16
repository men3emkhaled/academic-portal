import React, { useState, useEffect, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Plus, Circle, X, Edit2,
  Trash2, Save, FileSpreadsheet, Calendar, Clock,
  History, CheckCircle2, UserCheck, Activity
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  SearchInput,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const presenceDensity = students.length ? Math.round((records.length / students.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCheck}
        title="Attendance"
        description="Track student presence via QR scanning and manual roll-call."
        actions={selectedCourseId ? (
          <>
            <Button onClick={handleCreateSession}>
              <Plus className="size-4" />
              <span>New Session</span>
            </Button>
            <Button variant="outline" onClick={handleExportAttendance}>
              <FileSpreadsheet className="size-4" />
              <span>Export CSV</span>
            </Button>
          </>
        ) : null}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Course & Sessions Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <SectionCard title="Course">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SectionCard>

          <SectionCard
            title="Session log"
            actions={<History className="size-4 text-muted-foreground" />}
            bodyClassName="p-3"
          >
            <div className="space-y-2 max-h-[500px] overflow-y-auto pe-1 custom-scrollbar">
              {!selectedCourseId ? (
                <EmptyState
                  icon={History}
                  title="No course selected"
                  description="Choose a course to view its sessions."
                />
              ) : loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg border bg-muted/40 animate-pulse" />
                ))
              ) : sessions.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No sessions yet"
                  description="Create a session to start taking attendance."
                />
              ) : (
                sessions.map(session => {
                  const isActive = activeSession?.id === session.id;
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      key={session.id}
                      onClick={() => setActiveSession(session)}
                      className={`w-full relative text-start p-3 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-inline-start-0 top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-full bg-primary" />
                      )}
                      <div className="ps-1.5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-sm font-medium truncate ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                            {session.title || `Session #${session.id}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        {/* Workspace Area */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {!activeSession ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <EmptyState
                  icon={Activity}
                  title="No session open"
                  description="Create a new session or select one from the log to start taking attendance."
                  className="min-h-[480px]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Control Panel */}
                <SectionCard>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-4">
                      {isEditingSession ? (
                        <div className="flex items-center gap-2 max-w-md">
                          <Input
                            type="text"
                            value={editSessionTitle}
                            onChange={(e) => setEditSessionTitle(e.target.value)}
                            autoFocus
                          />
                          <Button size="icon" onClick={handleUpdateSession} aria-label="Save">
                            <Save className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setIsEditingSession(false)} aria-label="Cancel">
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <h2 className="text-lg font-semibold text-foreground truncate">
                            {activeSession.title || 'Live Session'}
                          </h2>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon-sm" onClick={() => setIsEditingSession(true)} aria-label="Rename session">
                              <Edit2 className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={handleDeleteSession} className="hover:text-destructive" aria-label="Delete session">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 max-w-sm">
                        <StatCard
                          label="Checked in"
                          value={<>{records.length}<span className="text-base font-normal text-muted-foreground"> / {students.length}</span></>}
                          icon={CheckCircle2}
                        />
                        <StatCard
                          label="Presence"
                          value={`${presenceDensity}%`}
                          accent
                          icon={Activity}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setScanning(!scanning)}
                      variant={scanning ? 'destructive' : 'default'}
                      size="lg"
                      className="h-14 px-6"
                    >
                      {scanning ? <X className="size-5" /> : <QrCode className="size-5" />}
                      <span className="text-base">{scanning ? 'Stop scanning' : 'Scan QR'}</span>
                    </Button>
                  </div>
                </SectionCard>

                {/* QR Scanner */}
                <AnimatePresence>
                  {scanning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl overflow-hidden border border-primary/40 relative bg-black aspect-video lg:aspect-auto lg:h-[400px]">
                        {/* Clean neutral scan frame */}
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                          <div className="relative size-[260px] max-w-[80%] max-h-[80%]">
                            {/* Corner markers */}
                            <span className="absolute top-0 start-0 size-7 border-t-2 border-s-2 border-primary rounded-tl-md" />
                            <span className="absolute top-0 end-0 size-7 border-t-2 border-e-2 border-primary rounded-tr-md" />
                            <span className="absolute bottom-0 start-0 size-7 border-b-2 border-s-2 border-primary rounded-bl-md" />
                            <span className="absolute bottom-0 end-0 size-7 border-b-2 border-e-2 border-primary rounded-br-md" />
                            {/* Subtle scan line */}
                            <div className="absolute inset-x-2 top-0 h-px bg-primary/70 animate-scan-y" />
                          </div>
                        </div>
                        <Scanner
                          onScan={handleScan}
                          onError={(err) => console.log(err)}
                          scanDelay={300}
                          components={{ audio: false, finder: false }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Student roster */}
                <SectionCard
                  title="Students"
                  actions={
                    <SearchInput
                      placeholder="Filter students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-56"
                    />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pe-1 custom-scrollbar">
                    {filteredStudents.length === 0 ? (
                      <div className="col-span-full">
                        <EmptyState
                          icon={UserCheck}
                          title="No students found"
                          description="No students match the current filter."
                        />
                      </div>
                    ) : (
                      filteredStudents.map(student => {
                        const sId = String(student.id || student.student_id || student.student?.id || '');
                        const sName = student.name || student.student_name || student.student?.name || 'Unknown Student';
                        const isPresent = presentStudentIds.includes(sId);
                        return (
                          <button
                            key={sId}
                            onClick={() => handleManualToggle(sId)}
                            className={`flex items-center justify-between gap-3 p-3 rounded-lg border text-start transition-colors ${
                              isPresent
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border bg-card hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`size-9 rounded-md overflow-hidden flex items-center justify-center text-sm font-medium border shrink-0 ${
                                isPresent
                                  ? 'border-primary/20 bg-primary/10 text-primary'
                                  : 'border-transparent bg-muted text-muted-foreground'
                              }`}>
                                {student.avatar_url ? (
                                  <img src={student.avatar_url} alt={sName} className="size-full object-cover" />
                                ) : (
                                  sName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${isPresent ? 'text-foreground' : 'text-foreground'}`}>
                                  {sName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">ID: {sId}</p>
                              </div>
                            </div>
                            <span className={`flex size-7 items-center justify-center rounded-md shrink-0 ${
                              isPresent
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {isPresent ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes scan-y {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(256px); }
        }
        .animate-scan-y { animation: scan-y 2.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default DoctorAttendance;
