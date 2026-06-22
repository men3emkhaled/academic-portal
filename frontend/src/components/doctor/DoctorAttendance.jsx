import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  Users, QrCode, Plus, CheckCircle2, Circle, Search, X, Edit2, 
  Trash2, Save, FileSpreadsheet, Calendar, Clock, ChevronRight, 
  History, BarChart2, UserCheck, Activity
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const DoctorAttendance = ({ courses }) => {
  const { t } = useTranslation();
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
      toast.error(t('doctor.attendance.failed_sessions'));
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
      toast.error(t('doctor.attendance.failed_records'));
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await doctorApi('post', '/doctor/attendance/sessions', { courseId: selectedCourseId });
      setSessions([res.data, ...sessions]);
      setActiveSession(res.data);
      toast.success(t('doctor.attendance.session_initialized'));
    } catch (err) {
      toast.error(t('doctor.attendance.failed_init'));
    }
  };

  const handleScan = async (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0 || !activeSession) return;
    const tokenValue = detectedCodes[0]?.rawValue || '';
    if (!tokenValue) return;

    if (scanLock.current || tokenValue === lastScanned.current) return;
    scanLock.current = true;
    lastScanned.current = tokenValue;

    const toastId = toast.loading(t('doctor.attendance.scanning_identity'));

    try {
      const res = await doctorApi('post', '/doctor/attendance/scan', {
        sessionId: activeSession.id,
        token: tokenValue
      });
      toast.success(t('doctor.attendance.synced_student', { name: res.data.student.name }), { id: toastId });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || t('doctor.attendance.failed_scan'), { id: toastId });
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
      toast.success(res.data.status === 'present' ? t('doctor.attendance.identity_verified') : t('doctor.attendance.sync_removed'));
      fetchRecords();
    } catch (err) {
      toast.error(t('doctor.attendance.failed_manual'));
    }
  };

  const handleUpdateSession = async () => {
    if (!editSessionTitle.trim()) return;
    try {
      const res = await doctorApi('put', `/doctor/attendance/sessions/${activeSession.id}`, { title: editSessionTitle });
      setSessions(sessions.map(s => s.id === activeSession.id ? res.data : s));
      setActiveSession(res.data);
      setIsEditingSession(false);
      toast.success(t('doctor.attendance.session_updated'));
    } catch (err) {
      toast.error(t('doctor.attendance.failed_update_session'));
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm(t('doctor.attendance.terminate_confirm'))) return;
    try {
      await doctorApi('delete', `/doctor/attendance/sessions/${activeSession.id}`);
      setSessions(sessions.filter(s => s.id !== activeSession.id));
      setActiveSession(null);
      toast.success(t('doctor.attendance.session_terminated'));
    } catch (err) {
      toast.error(t('doctor.attendance.failed_terminate'));
    }
  };

  const handleExportAttendance = async () => {
    try {
      const res = await doctorApi('get', `/doctor/attendance/${selectedCourseId}/export`);
      const { sessions: sessionList, data: attendanceData } = res.data;
      if (!attendanceData.length) return toast.error(t('doctor.attendance.no_sync_data'));

      const headers = [t('doctor.attendance.id_prefix'), t('doctor.attendance.student_manifest'), t('doctor.attendance.source_selection'), ...sessionList.map(s => s.title || new Date(s.date).toLocaleDateString()), t('doctor.attendance.presence_density'), t('doctor.attendance.neural_sync_stats')];
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
      toast.success(t('doctor.attendance.export_success'));
    } catch (err) {
      toast.error(t('doctor.attendance.failed_export'));
    }
  };

  const presentStudentIds = records.map(r => String(r.student_id));
  const filteredStudents = students.filter(s => {
    const sName = (s.name || s.student_name || '').toLowerCase();
    const sId = String(s.id || s.student_id || '');
    const query = searchQuery.toLowerCase();
    return sName.includes(query) || sId.includes(query);
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-[#059669]" />
            <span className="text-xs text-gray-400 font-medium">{t('doctor.attendance.attendance_hub')}</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('doctor.attendance.attendance_hub')}</h2>
          <p className="text-sm text-gray-500">{t('doctor.attendance.subtitle')}</p>
        </div>
        {selectedCourseId && (
          <div className="flex gap-3">
            <button onClick={handleCreateSession} className="bg-[#059669] hover:bg-[#047857] text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all">
              <Plus className="w-4 h-4" /> {t('doctor.attendance.initialize_sync')}
            </button>
            <button onClick={handleExportAttendance} className="bg-gray-900 dark:bg-white text-white dark:text-black font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all">
              <FileSpreadsheet className="w-4 h-4" /> {t('doctor.attendance.export_manifest')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Course & Sessions Sidebar */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-5">
            <h3 className="text-xs text-gray-400 font-medium mb-4">{t('doctor.attendance.source_selection')}</h3>
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="">{t('doctor.attendance.select_course')}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-gray-400 font-medium">{t('doctor.attendance.mission_logs')}</h3>
              <History className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {!selectedCourseId ? (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">{t('doctor.attendance.awaiting_module')}</p>
                </div>
              ) : loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse"></div>
                ))
              ) : sessions.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">{t('doctor.attendance.no_sessions')}</div>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      activeSession?.id === session.id
                        ? 'bg-[#059669]/5 border-[#059669]/30'
                        : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-[#059669]/30'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                      {session.title || t('doctor.attendance.session_sync', { id: session.id })}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(session.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="xl:col-span-8">
          {!activeSession ? (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-16 text-center min-h-[500px] flex flex-col items-center justify-center">
              <Activity className="w-12 h-12 text-gray-300 dark:text-white/10 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('doctor.attendance.workspace_offline')}</h3>
              <p className="text-sm text-gray-400">{t('doctor.attendance.workspace_offline_desc')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Control Panel */}
              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      {isEditingSession ? (
                        <div className="flex items-center gap-3 flex-1 max-w-md">
                          <input type="text" value={editSessionTitle} onChange={(e) => setEditSessionTitle(e.target.value)} className="flex-1 bg-gray-50 dark:bg-black border border-[#059669]/30 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-900 dark:text-white" autoFocus />
                          <button onClick={handleUpdateSession} className="p-2.5 bg-[#059669] text-white rounded-lg"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setIsEditingSession(false)} className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {activeSession.title || t('doctor.attendance.live_session_log')}
                          </h2>
                          <button onClick={() => setIsEditingSession(true)} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-[#059669]"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={handleDeleteSession} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-400">{t('doctor.attendance.presence_density')}</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{records.length} / {students.length}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100 dark:bg-white/5"></div>
                      <div>
                        <p className="text-xs text-gray-400">{t('doctor.attendance.neural_sync_stats')}</p>
                        <p className="text-xl font-semibold text-[#059669]">{students.length ? Math.round((records.length / students.length) * 100) : 0}%</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setScanning(!scanning)} className={`px-8 py-4 rounded-xl font-medium flex items-center gap-3 transition-all text-sm ${
                    scanning ? 'bg-rose-500 text-white' : 'bg-[#059669] text-white'
                  }`}>
                    {scanning ? <X className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
                    {scanning ? t('doctor.attendance.stop') : t('doctor.attendance.scan')}
                  </button>
                </div>
              </div>

              {scanning && (
                <div className="rounded-xl overflow-hidden border-2 border-white dark:border-[#0f0f0f] relative bg-black h-[300px]">
                  <Scanner 
                    onScan={handleScan} 
                    onError={(err) => console.log(err)} 
                    scanDelay={300}
                    components={{ audio: false, finder: false }}
                  />
                </div>
              )}

              {/* Student List */}
              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-[#059669]" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('doctor.attendance.student_manifest')}</h3>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder={t('doctor.attendance.filter_manifest')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                      <p className="text-sm text-gray-400">{t('doctor.attendance.no_records')}</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const sId = String(student.id || student.student_id || student.student?.id || '');
                      const sName = student.name || student.student_name || student.student?.name || t('doctor.attendance.unknown_student');
                      const isPresent = presentStudentIds.includes(sId);
                      return (
                        <div 
                          key={sId}
                          onClick={() => handleManualToggle(sId)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isPresent 
                              ? 'bg-[#059669]/5 border-[#059669]/30' 
                              : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 hover:border-[#059669]/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center font-medium text-sm ${
                              isPresent ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                            }`}>
                              {student.avatar_url ? (
                                <img src={student.avatar_url} alt={sName} className="w-full h-full object-cover" />
                              ) : (
                                sName.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate max-w-[120px] ${isPresent ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{sName}</p>
                              <p className="text-xs text-gray-400">{t('doctor.attendance.id_prefix')} {sId}</p>
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isPresent ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-300'
                          }`}>
                            {isPresent ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
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
    </div>
  );
};

export default DoctorAttendance;
