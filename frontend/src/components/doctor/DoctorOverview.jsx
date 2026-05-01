import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, Zap, Upload, Plus, CheckSquare, Calendar, ChevronRight, Clock, MapPin, MessageSquare } from 'lucide-react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';

const DoctorOverview = ({ stats, doctor, timetable, setActiveTab }) => {
  const { doctorApi } = useDoctorAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await doctorApi('get', '/doctor/recent-activity');
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to fetch recent activity', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [doctorApi]);

  const SUMMARY_CARDS = [
    { label: 'Active Students', value: stats.students, icon: Users, color: 'violet' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'blue' },
    { label: 'Portal Quizzes', value: stats.quizzes, icon: ClipboardList, color: 'amber' },
    { label: 'New Resources', value: stats.resources, icon: Zap, color: 'emerald' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Upload Material', desc: 'Add slides or reading docs', icon: Upload, color: 'violet' },
    { label: 'Create Quiz', desc: 'Draft a new assessment', icon: Plus, color: 'blue' },
    { label: 'Grade Tasks', desc: 'Review pending submissions', icon: CheckSquare, color: 'amber' },
    { label: 'Schedule Lecture', desc: 'Set up a live online class', icon: Calendar, color: 'emerald' },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Welcome Title */}
      <div>
        <h1 className="text-4xl font-black text-doctor-text tracking-tight mb-2">Welcome back, Dr. {doctor?.name}</h1>
        <p className="text-doctor-text-muted font-medium text-lg">Here is the overview of your classes and student activities today.</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {SUMMARY_CARDS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i}
              className="bg-doctor-card border border-white/[0.03] p-8 rounded-[2rem] hover:border-doctor-primary/30 transition-all group shadow-sm dark:shadow-none"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-doctor-text-muted group-hover:text-doctor-primary transition-colors`} />
              </div>
              <p className="text-4xl font-black text-doctor-text mb-2">{stat.value}</p>
              <p className="text-doctor-text-muted text-xs font-black uppercase tracking-widest">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="text-xl font-bold text-doctor-text mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={i}
                    onClick={() => {
                        if (action.label === 'Upload Material') setActiveTab('materials');
                        if (action.label === 'Create Quiz') setActiveTab('quizzes');
                        if (action.label === 'Grade Tasks') setActiveTab('tasks');
                        if (action.label === 'Schedule Lecture') setActiveTab('schedule');
                    }}
                    className="bg-doctor-card border border-white/[0.03] p-6 rounded-3xl flex items-center gap-5 hover:border-doctor-primary/30 hover:bg-white/[0.03] transition-all group text-left shadow-sm dark:shadow-none"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:bg-doctor-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-doctor-text-muted group-hover:text-doctor-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-doctor-text font-bold text-lg leading-none mb-1">{action.label}</p>
                      <p className="text-doctor-text-muted text-sm">{action.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-doctor-text">Recent Activity</h3>
              <button 
                onClick={() => setActiveTab('inquiries')}
                className="text-doctor-primary font-bold text-sm hover:underline flex items-center gap-1"
              >
                View Support Center <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-doctor-primary/30 border-t-doctor-primary rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-doctor-text-muted uppercase tracking-widest">Loading Activity...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                   <Clock className="w-12 h-12 text-white/5 mb-4" />
                   <p className="text-doctor-text-muted font-bold">No recent activities found.</p>
                   <p className="text-doctor-text-muted text-xs mt-1">Student submissions and questions will appear here.</p>
                </div>
              ) : (
                activities.map((activity, i) => (
                  <div 
                    key={activity.id}
                    className={`p-6 flex items-center justify-between hover:bg-doctor-text/5 transition-colors ${
                      i !== activities.length - 1 ? 'border-b border-doctor-text/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-doctor-text/5 flex items-center justify-center overflow-hidden border border-white/5 shadow-sm">
                        {activity.avatar_url ? (
                          <img 
                            src={activity.avatar_url} 
                            alt={activity.user}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={`https://ui-avatars.com/api/?name=${activity.user}&background=random&color=fff`} 
                            alt={activity.user}
                            className="w-full h-full object-cover opacity-80"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-doctor-text font-bold text-[15px]">
                          {activity.user} <span className="text-doctor-text-muted font-medium">{activity.action}</span> "{activity.target}"
                        </p>
                        <p className="text-xs text-doctor-text-muted font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.time).toLocaleDateString()} • {activity.category}
                        </p>
                      </div>
                    </div>
                    {activity.status && (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        activity.type === 'assignment' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-doctor-primary/10 text-doctor-primary border-doctor-primary/20'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Upcoming Schedule */}
        <div className="space-y-8">
          <section>
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Upcoming Schedule</h3>
              <p className="text-doctor-text-muted text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
              {/* Timeline line */}
              <div className="absolute left-[39px] top-12 bottom-12 w-[1px] bg-white/5"></div>
              
              {timetable && timetable.length > 0 ? (
                timetable.slice(0, 4).map((entry, i) => (
                  <div key={i} className="relative flex gap-6 group">
                    {/* Dot */}
                    <div className="relative z-10 w-2 h-2 rounded-full bg-doctor-primary mt-2 ring-4 ring-doctor-primary/20"></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-doctor-primary text-xs font-black tracking-widest uppercase">
                          {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <h4 className="text-doctor-text font-bold text-[15px] leading-tight mb-2 group-hover:text-doctor-primary transition-colors">
                        {entry.course_name}
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-doctor-text-muted">
                           <MapPin className="w-3.5 h-3.5" />
                           <span className="text-xs font-medium">{entry.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-doctor-text-muted">
                           <Clock className="w-3.5 h-3.5" />
                           <span className="text-xs font-medium">{entry.type} {entry.department_name && `• ${entry.department_name}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                   <Calendar className="w-10 h-10 text-white/10 mx-auto mb-3" />
                   <p className="text-doctor-text-muted text-sm font-medium">No classes scheduled today.</p>
                </div>
              )}

              <button 
                onClick={() => setActiveTab('schedule')}
                className="w-full bg-doctor-text/5 hover:bg-doctor-text/10 text-doctor-text font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <Calendar className="w-5 h-5 text-doctor-text-muted" />
                <span>Open Full Schedule</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
