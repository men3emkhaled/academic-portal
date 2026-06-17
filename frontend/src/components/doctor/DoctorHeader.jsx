import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, HelpCircle, CheckCircle2, Inbox, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const DoctorHeader = ({
  doctor, onSearch, onCreateQuiz,
  notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead,
  setActiveTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between gap-4 px-6 lg:px-8 z-40">

      {/* Search Bar */}
      <div className="relative w-full max-w-[180px] sm:max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Quick Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="ps-9"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onCreateQuiz}
          className="hidden lg:inline-flex"
        >
          <Plus className="size-4" />
          <span>New Assessment</span>
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant={showNotifications ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 bg-destructive rounded-full border-2 border-background flex items-center justify-center text-[8px] font-semibold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.12 }}
                className="absolute top-12 end-0 w-80 lg:w-96 bg-popover border border-border rounded-xl shadow-sm z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Activity Feed</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto hidden-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-14 text-center px-8">
                      <div className="size-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Inbox className="size-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Your agenda is clear.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && onMarkRead(n.id)}
                          className={`px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-muted/30' : ''}`}
                        >
                          <div className={`size-9 rounded-md flex items-center justify-center shrink-0 border ${
                            !n.is_read ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-transparent'
                          }`}>
                            <CheckCircle2 className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {n.title}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {n.content}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="absolute end-3 bottom-3 size-1.5 rounded-full bg-primary"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 bg-muted/30 text-center border-t border-border">
                    <button
                      onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 w-full"
                    >
                      Full Feed <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          aria-label="Help"
        >
          <HelpCircle className="size-4" />
        </Button>

        <Separator orientation="vertical" className="hidden lg:block mx-1 h-6" />

        {/* Profile */}
        <div className="flex items-center gap-3 ps-1">
          <div className="text-end hidden sm:block">
            <div className="flex items-center justify-end gap-1.5">
              <span className="size-1.5 rounded-full bg-primary"></span>
              <p className="text-sm font-medium text-foreground">Inst. {doctor?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <Avatar size="default">
            <AvatarImage src={doctor?.avatar_url} alt={doctor?.name} />
            <AvatarFallback>{doctor?.name?.charAt(0)?.toUpperCase() || 'D'}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
};

export default DoctorHeader;
