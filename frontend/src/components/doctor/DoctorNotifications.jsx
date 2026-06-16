import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Inbox, CheckCheck,
  MessageSquare, FileText, AlertTriangle
} from 'lucide-react';
import { PageContainer, PageHeader, SectionCard, EmptyState, LoadingState, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';

const DoctorNotifications = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  loading
}) => {
  const getNotificationIcon = (content, title) => {
    const text = (content + title).toLowerCase();
    if (text.includes('inquiry') || text.includes('question') || text.includes('message')) return MessageSquare;
    if (text.includes('submission') || text.includes('assignment') || text.includes('quiz')) return FileText;
    if (text.includes('urgent') || text.includes('alert') || text.includes('warning')) return AlertTriangle;
    return Bell;
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <PageContainer>
      <PageHeader
        icon={Bell}
        title="Activity Center"
        description="Student activity, academic inquiries, and system alerts."
        actions={
          hasUnread ? (
            <Button variant="outline" size="sm" onClick={onMarkAllRead}>
              <CheckCheck className="size-4" />
              <span>Mark all read</span>
            </Button>
          ) : null
        }
      />

      {loading ? (
        <LoadingState label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description="No pending alerts or activity in your current workspace."
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const Icon = getNotificationIcon(n.content, n.title);

                return (
                  <motion.div
                    layout
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => !n.is_read && onMarkRead(n.id)}
                    className={`flex gap-3 px-4 py-3 transition-colors ${
                      !n.is_read ? 'bg-muted/30 cursor-pointer hover:bg-muted/50' : ''
                    }`}
                  >
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${
                      !n.is_read
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-transparent bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className={`truncate text-sm font-medium ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <StatusBadge variant="accent" className="shrink-0">New</StatusBadge>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(n.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {n.content}
                      </p>
                    </div>

                    {!n.is_read && (
                      <span className="mt-1.5 size-1.5 shrink-0 self-start rounded-full bg-primary" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </SectionCard>
      )}
    </PageContainer>
  );
};

export default DoctorNotifications;
