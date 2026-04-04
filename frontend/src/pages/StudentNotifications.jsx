import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentNotifications = () => {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
    fetchNotifications();
  }, [student, navigate]);

  const fetchNotifications = async () => {
    try {
      const response = await studentApi.get('/notifications/my-notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await studentApi.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await studentApi.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="notifications" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                🔔 Notifications
              </h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-gray-600">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-gray-400 text-lg">No notifications yet</p>
              <p className="text-gray-500 text-sm mt-1">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    notification.is_read
                      ? 'bg-white/5 border-white/10'
                      : 'bg-primary/10 border-primary/30 shadow-lg'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${notification.is_read ? 'text-white' : 'text-primary'}`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="text-xs bg-primary text-dark px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;