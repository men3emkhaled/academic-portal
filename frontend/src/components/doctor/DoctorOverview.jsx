import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, Zap, Upload, Plus, CheckSquare, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
} from '@/components/common';

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
    { label: 'Active Students', value: stats.students, icon: Users, accent: true },
    { label: 'Courses', value: stats.courses, icon: BookOpen },
    { label: 'Portal Quizzes', value: stats.quizzes, icon: ClipboardList },
    { label: 'New Resources', value: stats.resources, icon: Zap },
  ];

  const QUICK_ACTIONS = [
    { label: 'Upload Material', desc: 'Add slides or reading docs', icon: Upload, tab: 'materials' },
    { label: 'Create Quiz', desc: 'Draft a new assessment', icon: Plus, tab: 'quizzes' },
    { label: 'Grade Tasks', desc: 'Review submissions', icon: CheckSquare, tab: 'tasks' },
    { label: 'Schedule Class', desc: 'Set up a live session', icon: Calendar, tab: 'schedule' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <PageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Welcome Title */}
        <motion.div variants={itemVariants}>
          <PageHeader
            title={`Hello, Inst. ${doctor?.name.split(' ')[0]}`}
            description="Welcome back to your academic hub. Here is what's happening with your classes today."
            actions={
              <StatusBadge variant="success">
                <span className="size-1.5 rounded-full bg-primary" />
                Portal Active
              </StatusBadge>
            }
          />
        </motion.div>

        {/* Summary Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SUMMARY_CARDS.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left Column: Quick Actions & Recent Activity */}
          <div className="space-y-6 xl:col-span-2">
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <SectionCard title="Quick Hub" bodyClassName="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_ACTIONS.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveTab(action.tab)}
                      className="flex items-center gap-3 rounded-lg border bg-background p-3 text-start transition-colors hover:bg-muted/50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </SectionCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <SectionCard
                title="Recent Activity"
                actions={
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('inquiries')}>
                    <span>Inquiries Center</span>
                    <ChevronRight className="size-4" />
                  </Button>
                }
                bodyClassName="p-0"
              >
                {loading ? (
                  <LoadingState label="Syncing data..." className="min-h-[16rem]" />
                ) : activities.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={Clock}
                      title="Queue is Empty"
                      description="New student submissions and course activities will appear here."
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence initial={false}>
                      {activities.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar size="default" className="shrink-0">
                              <AvatarImage src={activity.avatar_url} alt={activity.user} />
                              <AvatarFallback>
                                {(activity.user || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm text-foreground">
                                <span className="font-medium">{activity.user}</span>{' '}
                                <span className="text-muted-foreground">{activity.action}</span>
                              </p>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-primary">{activity.category}</span>
                                <span className="size-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {new Date(activity.time).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {activity.status && (
                            <StatusBadge
                              variant={activity.type === 'assignment' ? 'success' : 'neutral'}
                              className="shrink-0"
                            >
                              {activity.status}
                            </StatusBadge>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          </div>

          {/* Right Column: Upcoming Schedule */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <SectionCard
                title="Agenda"
                actions={
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                }
              >
                {timetable && timetable.length > 0 ? (
                  <div className="relative space-y-5">
                    {/* Vertical timeline track */}
                    <div className="absolute inset-inline-start-[5px] top-2 bottom-2 w-px bg-border" />

                    {timetable.slice(0, 4).map((entry, i) => (
                      <div key={i} className="relative flex gap-4">
                        {/* Node */}
                        <div className="relative z-10 mt-1 size-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" />

                        <div className="min-w-0 flex-1">
                          <StatusBadge variant="success" className="mb-1.5">
                            {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                          </StatusBadge>
                          <h4 className="text-sm font-medium text-foreground">
                            {entry.course_name}
                          </h4>
                          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="size-3.5" />
                              {entry.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-3.5" />
                              {entry.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="Free Agenda Today"
                    description="No sessions are scheduled for today."
                  />
                )}

                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setActiveTab('schedule')}
                >
                  Full Schedule
                </Button>
              </SectionCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default DoctorOverview;
