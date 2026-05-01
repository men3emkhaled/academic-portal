import React from 'react';
import { Users, BookOpen, ClipboardList, Zap, Upload, Plus, CheckSquare, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';

const DoctorOverview = ({ stats, doctor, timetable }) => {
  // Mock data for recent activity
  const RECENT_ACTIVITY = [
    { id: 1, user: 'Sarah Jenkins', action: 'submitted assignment', target: 'Anatomy Lab Report 3', time: '10 minutes ago', category: 'Bio-Sci 101', status: 'Submitted', type: 'assignment' },
    { id: 2, user: 'Michael Chang', action: 'asked a question', target: 'in the course forum', time: '45 minutes ago', category: 'Pathology Advanced', type: 'forum' },
    { id: 3, user: 'David Miller', action: 'completed', target: 'Midterm Practice Quiz', time: '2 hours ago', category: 'Pharmacology', status: 'Score: 92%', type: 'quiz' },
  ];

  const SUMMARY_CARDS = [
    { label: 'Active Students', value: stats.students, icon: Users, color: 'violet' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'blue' },
    { label: 'Pending Quizzes', value: stats.quizzes, icon: ClipboardList, color: 'amber' }, // Fixed typo in img
    { label: 'New Submissions', value: stats.resources, icon: Zap, color: 'emerald' }, // Using resources as a placeholder for submissions
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
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome back, Dr. {doctor?.name}</h1>
        <p className="text-doctor-text-muted font-medium text-lg">Here is the overview of your classes and student activities today.</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {SUMMARY_CARDS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i}
              className="bg-doctor-card border border-white/5 p-8 rounded-[2rem] hover:border-doctor-primary/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
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
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={i}
                    className="bg-doctor-card border border-white/5 p-6 rounded-3xl flex items-center gap-5 hover:border-doctor-primary/30 hover:bg-white/[0.02] transition-all group text-left"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-doctor-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-doctor-text-muted group-hover:text-doctor-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none mb-1">{action.label}</p>
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
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <button className="text-doctor-primary font-bold text-sm hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] overflow-hidden">
              {RECENT_ACTIVITY.map((activity, i) => (
                <div 
                  key={activity.id}
                  className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors ${
                    i !== RECENT_ACTIVITY.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden">
                       <img 
                          src={`https://ui-avatars.com/api/?name=${activity.user}&background=random&color=fff`} 
                          alt={activity.user}
                          className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                    <div>
                      <p className="text-white font-bold text-[15px]">
                        {activity.user} <span className="text-doctor-text-muted font-medium">{activity.action}</span> "{activity.target}"
                      </p>
                      <p className="text-xs text-doctor-text-muted font-bold mt-1 uppercase tracking-widest">
                        {activity.time} • {activity.category}
                      </p>
                    </div>
                  </div>
                  {activity.status && (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      activity.type === 'assignment' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-doctor-primary/10 text-doctor-primary'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))}
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
                      <h4 className="text-white font-bold text-[15px] leading-tight mb-2 group-hover:text-doctor-primary transition-colors">
                        {entry.course_name}
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-doctor-text-muted">
                           <MapPin className="w-3.5 h-3.5" />
                           <span className="text-xs font-medium">{entry.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-doctor-text-muted">
                           <Clock className="w-3.5 h-3.5" />
                           <span className="text-xs font-medium">{entry.type}</span>
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

              <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
                <Calendar className="w-5 h-5 text-doctor-text-muted" />
                <span>Open Calendar</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
