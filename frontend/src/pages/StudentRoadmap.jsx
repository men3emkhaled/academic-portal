import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Map, ListChecks, Target, Circle, TrendingUp
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
} from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StudentRoadmap = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { roadmapTracks, loadingRoadmap } = useStudentData();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const tracks = roadmapTracks || [];

  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    if (!loadingRoadmap && tracks.length > 0 && !selectedTrack) {
      setSelectedTrack(tracks[0]);
      fetchTrackProgress(tracks[0].id);
    }
  }, [loadingRoadmap, tracks, selectedTrack]);

  const fetchTrackProgress = async (trackId) => {
    setLoading(true);
    try {
      const response = await studentApi.get(`/roadmap/progress/${trackId}`);
      const data = response.data;
      setTasks(data.tasks || []);
      setProgress({
        percentage: data.percentage,
        total_tasks: data.total_tasks,
        completed_tasks: data.completed_tasks,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error(t('roadmap.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    if (updating) return;
    setUpdating(true);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.task_id === taskId ? { ...task, is_completed: newStatus } : task
      )
    );
    setProgress(prev => {
      const newCompleted = prev.completed_tasks + (newStatus ? 1 : -1);
      const newPercentage = Math.round((newCompleted / prev.total_tasks) * 100);
      return { ...prev, completed_tasks: newCompleted, percentage: newPercentage };
    });

    try {
      await studentApi.post('/roadmap/toggle-task', { taskId, isCompleted: newStatus });
      toast.success(newStatus ? t('roadmap.task_done') : t('roadmap.task_undone'));
    } catch (error) {
      console.error('Error toggling task:', error);
      fetchTrackProgress(selectedTrack.id);
      toast.error(t('roadmap.update_error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackChange = (trackId) => {
    const track = tracks.find(tk => String(tk.id) === String(trackId));
    if (!track) return;
    setSelectedTrack(track);
    fetchTrackProgress(track.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  if ((loading || loadingRoadmap) && tracks.length === 0) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <LoadingState label={t('common.loading', 'Loading')} />
      </div>
    );
  }

  const remaining = Math.max(0, (progress?.total_tasks || 0) - (progress?.completed_tasks || 0));
  const percentage = progress?.percentage || 0;

  const trackSelect = tracks.length > 0 ? (
    <Select
      value={selectedTrack ? String(selectedTrack.id) : undefined}
      onValueChange={handleTrackChange}
    >
      <SelectTrigger className="w-full sm:w-64" dir={isAr ? 'rtl' : 'ltr'}>
        <SelectValue placeholder={t('roadmap.select_track')} />
      </SelectTrigger>
      <SelectContent dir={isAr ? 'rtl' : 'ltr'}>
        {tracks.map(track => (
          <SelectItem key={track.id} value={String(track.id)} className={isAr ? 'font-arabic' : ''}>
            {track.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : null;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? 'rtl' : 'ltr'}>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>

          <PageHeader
            icon={Map}
            title={selectedTrack ? selectedTrack.name : t('roadmap.title')}
            description={t('mavi.milestone_desc')}
            actions={trackSelect}
          />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t('roadmap.done')}
              value={progress?.completed_tasks || 0}
              icon={CheckCircle2}
              accent
            />
            <StatCard
              label={t('roadmap.tasks')}
              value={progress?.total_tasks || 0}
              icon={ListChecks}
            />
            <StatCard
              label={t('mavi.remaining')}
              value={remaining}
              icon={Target}
            />
            <StatCard
              label={t('mavi.hierarchy')}
              value={`#${student?.level ?? '-'}`}
              icon={TrendingUp}
            />
          </div>

          {/* Overall progress */}
          <SectionCard
            title={t('mavi.milestone_logic')}
            actions={
              <span className="text-2xl font-semibold tracking-tight text-primary tabular-nums">
                {percentage}%
              </span>
            }
          >
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {progress?.completed_tasks || 0} / {progress?.total_tasks || 0} {t('roadmap.tasks')}
            </p>
          </SectionCard>

          {/* Tasks timeline */}
          <SectionCard
            title={isAr ? 'المهمات' : t('roadmap.tasks')}
            actions={
              <StatusBadge variant="neutral">
                {tasks.length} {t('roadmap.tasks')}
              </StatusBadge>
            }
            bodyClassName="p-4 sm:p-5"
          >
            {tasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title={t('common.no_data')}
              />
            ) : (
              <div className="relative ps-9">
                {/* Vertical spine */}
                <div className="absolute top-0 bottom-0 start-3 w-0.5 rounded-full bg-border">
                  <div
                    className="absolute top-0 start-0 w-full rounded-full bg-primary transition-all duration-500"
                    style={{ height: `${percentage}%` }}
                  />
                </div>

                <div className="space-y-2.5">
                  {tasks.map((task, idx) => {
                    const isCompleted = task.is_completed;

                    return (
                      <div key={task.task_id} className="relative">
                        {/* Node */}
                        <span
                          className={cn(
                            'absolute top-3 z-10 flex size-6 -translate-y-0.5 items-center justify-center rounded-full border transition-colors',
                            'start-[-26px]',
                            isCompleted
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-muted-foreground'
                          )}
                        >
                          {isCompleted
                            ? <CheckCircle2 className="size-3.5" />
                            : <Circle className="size-2" fill="currentColor" />}
                        </span>

                        {/* Row */}
                        <button
                          type="button"
                          onClick={() => !updating && toggleTask(task.task_id, isCompleted)}
                          disabled={updating}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-start transition-colors',
                            'hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-70',
                            isCompleted && 'border-primary/30'
                          )}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {isAr ? 'مهمة' : t('roadmap.tasks')} {idx + 1}
                              </span>
                              {isCompleted && (
                                <StatusBadge variant="success" icon={CheckCircle2}>
                                  {t('quizzes.completed')}
                                </StatusBadge>
                              )}
                            </div>
                            <h4 className={cn(
                              'text-sm font-medium text-foreground',
                              isCompleted && 'text-muted-foreground line-through',
                              isAr ? 'font-arabic' : ''
                            )}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>

        </PageContainer>
      </main>

    </div>
  );
};

export default StudentRoadmap;
