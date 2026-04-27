import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, TrendingUp, ShieldCheck, Info, ExternalLink, GraduationCap, Layers, Users, Lock, ChevronRight } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

// دالة تحديد النمط بناءً على محتوى الإشعار
const getNotificationStyle = (title, content) => {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  if (lowerTitle.includes('contest') || lowerContent.includes('contest')) {
    return { emoji: <Trophy className="w-6 h-6 text-primary" />, category: 'Event', borderColor: 'border-primary/50 dark:border-primary', iconBg: 'bg-primary/10 dark:bg-primary/20', textColor: 'text-primary' };
  }
  if (lowerTitle.includes('grade') || lowerContent.includes('grade')) {
    return { emoji: <TrendingUp className="w-6 h-6 text-secondary" />, category: 'Grades', borderColor: 'border-secondary/50 dark:border-secondary', iconBg: 'bg-secondary/10 dark:bg-secondary/20', textColor: 'text-secondary' };
  }
  if (lowerTitle.includes('security') || lowerContent.includes('login')) {
    return { emoji: <ShieldCheck className="w-6 h-6 text-orange-500 dark:text-orange-400" />, category: 'Security', borderColor: 'border-orange-500/50 dark:border-orange-500', iconBg: 'bg-orange-500/10 dark:bg-orange-500/20', textColor: 'text-orange-500 dark:text-orange-400' };
  }
  return { emoji: <Info className="w-6 h-6 text-primary" />, category: 'Info', borderColor: 'border-primary/50 dark:border-primary', iconBg: 'bg-primary/10 dark:bg-primary/20', textColor: 'text-primary' };
};

const StudentDashboard = () => {
  const { student, logout } = useStudentAuth();
  const { 
    gradesData, loadingGrades, 
    notifications: allNotifications, loadingNotifications, markNotificationAsRead 
  } = useStudentData();
  const navigate = useNavigate();

  // Get recent 3 notifications from context
  const notifications = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recent = allNotifications.filter(notif => new Date(notif.created_at) >= threeDaysAgo);
    return recent.slice(0, 3);
  }, [allNotifications]);

  const grades = gradesData.grades;
  const summary = gradesData.summary;
  const loading = loadingGrades;
  const notifLoading = loadingNotifications;

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
  }, [student, navigate]);

  const markAsRead = async (id) => {
    await markNotificationAsRead(id);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return 'text-green-600 dark:text-green-400';
    return 'text-red-500 dark:text-red-400';
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '-';
    const num = Number(score);
    return Number.isInteger(num) ? num : num.toFixed(1).replace(/\.0$/, '');
  };

  const getCourseStatus = (grade) => {
    const midtermExists = grade.midterm_score !== null && grade.midterm_score !== undefined;
    const practicalExists = grade.practical_score !== null && grade.practical_score !== undefined;
    const oralExists = grade.oral_score !== null && grade.oral_score !== undefined;
    const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
    if (midtermExists && practicalExists && oralExists) {
      const percentage = (total / grade.max_score) * 100;
      return percentage >= 50 ? 'Passing' : 'Failing';
    }
    return 'Pending';
  };

  const getStatusColor = (status) => {
    if (status === 'Passing') return 'bg-green-100 dark:bg-green-400/20 text-green-700 dark:text-green-400';
    if (status === 'Failing') return 'bg-red-100 dark:bg-red-400/20 text-red-700 dark:text-red-400';
    return 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-inner';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const renderContent = (text) => {
    if (!text) return '';

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index).trim();
        if (textBefore) {
          parts.push(
            <span key={`text-${lastIndex}`} className="inline">
              {textBefore}{' '}
            </span>
          );
        }
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-green-500/30 dark:to-green-500/15 text-emerald-700 dark:text-green-300 font-semibold px-4 py-2 rounded-xl border border-emerald-200 dark:border-green-500/50 backdrop-blur-lg hover:border-emerald-300 dark:hover:border-green-400/70 hover:from-emerald-200 hover:to-emerald-100 dark:hover:from-green-500/40 dark:hover:to-green-500/25 transition-all shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg mx-1"
        >
          <ExternalLink className="w-4 h-4" /> {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex).trim();
      if (textAfter) {
        parts.push(
          <span key={`text-${lastIndex}`} className="inline">
            {' '}{textAfter}
          </span>
        );
      }
    }

    return parts.length > 0 ? parts : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
        <Sidebar onLogout={handleLogout} />
        <div className="md:ml-64 flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden shadow-sm dark:shadow-2xl p-8 rounded-[2rem] bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 mb-10 group hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <p className="font-headline font-bold text-primary text-xs uppercase tracking-[0.2em] mb-2">Student Profile</p>
              <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight mb-4">
                {student?.name}
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-glass border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  <GraduationCap className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span>ID: {student?.id}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-glass border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  <Layers className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span>Level: {student?.level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-dark-glass border border-primary/20 dark:border-white/5 text-primary dark:text-white text-sm font-semibold">
                  <Users className="w-5 h-5 text-primary dark:text-white" />
                  <span>Section: {student?.section || 'Not assigned'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          {!notifLoading && notifications.length > 0 && (
            <div className="mb-10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-extrabold text-2xl tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Recent Notifications
                </h2>
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const { emoji, category, borderColor, iconBg, textColor } = getNotificationStyle(notification.title, notification.content);
                  const isUnread = !notification.is_read;
                  return (
                    <div
                      key={notification.id}
                      className={`relative overflow-hidden group rounded-[1.5rem] p-6 transition-all duration-300 ${isUnread ? "bg-white dark:bg-dark-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(142,255,113,0.15)] border border-primary/20 dark:border-primary/30 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl" : "bg-gray-50/80 dark:bg-dark-glass/50 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 opacity-90 dark:opacity-80 hover:opacity-100"}`}
                    >
                      {isUnread && (
                        <div className={`absolute top-0 left-0 w-1 h-full ${borderColor} rounded-l-xl shadow-[0_0_12px_rgba(46,204,113,0.2)] dark:shadow-[0_0_12px_rgba(142,255,113,0.3)]`} />
                      )}
                      
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
                            {emoji}
                          </div>
                          <div>
                            <h3 className={`font-headline font-bold text-lg ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {notification.title}
                            </h3>
                            <p className={`text-[11px] font-label uppercase tracking-widest mt-0.5 ${textColor}`}>
                              {category}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-label text-gray-500 uppercase tracking-tighter">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-3 whitespace-pre-wrap" dir="auto">
                        {renderContent(notification.content)}
                      </div>
                      
                      {isUnread && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                            className="text-xs font-bold text-primary/80 dark:text-primary/70 hover:text-primary transition-colors uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20"
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grades Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Your Grades
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grades.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No enrolled courses found.</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Contact your administrator to enroll in courses.</p>
                </div>
              ) : (
                grades.map((grade, idx) => {
                  const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                  const status = getCourseStatus(grade);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <div key={idx} className="relative overflow-hidden group bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-[1.5rem] p-6 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(46,204,113,0.1)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] transition-all duration-500 shadow-sm dark:shadow-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-5 relative">
                        <div>
                          <h4 className="font-headline font-bold text-lg leading-tight mb-1 text-gray-900 dark:text-white">{grade.course_name}</h4>
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Course</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${statusColor} border-current/20`}>
                          {status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner px-3 py-3 rounded-xl text-center group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                          <span className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Midterm</span>
                          <span className={`text-xl font-headline font-bold ${getGradeColor(grade.midterm_score, grade.midterm_max)}`}>
                            {formatScore(grade.midterm_score)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner px-3 py-3 rounded-xl text-center group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                          <span className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Practical</span>
                          <span className={`text-xl font-headline font-bold ${getGradeColor(grade.practical_score, grade.practical_max)}`}>
                            {formatScore(grade.practical_score)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner px-3 py-3 rounded-xl text-center group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                          <span className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Oral</span>
                          <span className={`text-xl font-headline font-bold ${getGradeColor(grade.oral_score, grade.oral_max)}`}>
                            {formatScore(grade.oral_score)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
                        <span className="text-lg font-headline font-bold text-primary">{formatScore(total)} / {grade.max_score}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default StudentDashboard;