import React, { useEffect } from 'react';
import {
  Trophy, TrendingUp, ShieldCheck,
  Bell, ArrowRight, Info as InfoIcon, CheckCheck
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
} from '@/components/common';
import { cn } from '@/lib/utils';

const StudentNotifications = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { notifications, setNotifications, loadingNotifications, markNotificationAsRead } = useStudentData();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const loading = loadingNotifications;

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const markAsRead = async (id) => {
    await markNotificationAsRead(id);
  };

  const markAllAsRead = async () => {
    try {
      await studentApi.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success(t('notifications.all_read_success'));
    } catch (error) {
      toast.error(t('notifications.all_read_error'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (i18n.language === 'ar') {
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) return 'الآن';
        return `منذ ${hours} ساعة`;
      }
      if (days === 1) return 'أمس';
      if (days < 7) return `منذ ${days} أيام`;
      return date.toLocaleDateString('ar-EG');
    }

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) return 'Just now';
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Maps a notification to a neutral icon + a translated category label.
  // No decorative color — meaning is carried by the icon and the category text.
  const getNotificationStyle = (title, content) => {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    if (lowerTitle.includes('contest') || lowerContent.includes('contest') || lowerTitle.includes('event')) {
      return { icon: Trophy, category: t('notifications.category_event') };
    }
    if (lowerTitle.includes('grade') || lowerContent.includes('grade') || lowerTitle.includes('score')) {
      return { icon: TrendingUp, category: t('notifications.category_grades') };
    }
    if (lowerTitle.includes('security') || lowerContent.includes('login') || lowerTitle.includes('password')) {
      return { icon: ShieldCheck, category: t('notifications.category_security') };
    }
    return { icon: InfoIcon, category: t('notifications.category_info') };
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
        if (textBefore) parts.push(<span key={`text-${lastIndex}`} className="inline">{textBefore}{' '}</span>);
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
        >
          {match[1]} <ArrowRight className={cn('size-3', isAr && 'rotate-180')} />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex).trim();
      if (textAfter) parts.push(<span key={`text-${lastIndex}`} className="inline">{' '}{textAfter}</span>);
    }
    return parts.length > 0 ? parts : text;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>
          <PageHeader
            icon={Bell}
            title={t('notifications.title')}
            description={t('mavi.notifications_desc')}
            actions={
              unreadCount > 0 ? (
                <Button size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="size-4" />
                  {t('notifications.mark_all')}
                </Button>
              ) : null
            }
          />

          {loading ? (
            <LoadingState />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <StatCard
                  label={t('mavi.active')}
                  value={unreadCount}
                  icon={Bell}
                  accent
                />
                <StatCard
                  label={t('mavi.logged')}
                  value={notifications.length}
                  icon={InfoIcon}
                />
              </div>

              <SectionCard title={t('notifications.title')} bodyClassName="p-0">
                {notifications.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={Bell}
                      title={t('notifications.no_alerts')}
                    />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {notifications.map((notification) => {
                      const { icon: Icon, category } = getNotificationStyle(notification.title, notification.content);
                      const isUnread = !notification.is_read;

                      return (
                        <li
                          key={notification.id}
                          onClick={() => isUnread && markAsRead(notification.id)}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3 transition-colors',
                            isUnread ? 'cursor-pointer hover:bg-muted/50' : 'opacity-70'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
                              isUnread
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <Icon className="size-4" />
                          </span>

                          <div className="min-w-0 flex-1 space-y-1 text-start">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={cn('text-sm font-medium text-foreground', isAr && 'font-arabic')}>
                                {notification.title}
                              </h3>
                              <span className="text-xs text-muted-foreground">{category}</span>
                              {isUnread && (
                                <StatusBadge variant="accent">
                                  {t('notifications.click_to_read')}
                                </StatusBadge>
                              )}
                            </div>

                            <div className="text-sm leading-relaxed text-muted-foreground">
                              {renderContent(notification.content)}
                            </div>
                          </div>

                          <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>
            </>
          )}
        </PageContainer>
      </main>
    </div>
  );
};

export default StudentNotifications;
