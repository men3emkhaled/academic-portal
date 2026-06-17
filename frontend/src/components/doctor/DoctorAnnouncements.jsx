import React, { useState, useEffect, useCallback } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PageHeader,
  SectionCard,
  FormField,
  EmptyState,
  LoadingState,
} from '@/components/common';

const DoctorAnnouncements = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const fetchAnnouncements = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/announcements/${selectedCourseId}`);
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, doctorApi]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error('Please select a course');
    if (!newAnnouncement.title || !newAnnouncement.content) return toast.error('Please fill all fields');

    setCreating(true);
    try {
      await doctorApi('post', '/doctor/announcements', {
        courseId: selectedCourseId,
        ...newAnnouncement
      });
      toast.success('Announcement posted successfully');
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to post announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await doctorApi('delete', `/doctor/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Course Announcements"
        description="Send notifications and updates to students enrolled in your courses"
      />

      {/* Compose form */}
      <SectionCard title="New Announcement">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Select Course" htmlFor="announcement-course">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger id="announcement-course" className="w-full">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Announcement Title" htmlFor="announcement-title">
              <Input
                id="announcement-title"
                type="text"
                placeholder="e.g., Lecture Cancelled, Assignment Update"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Announcement Content" htmlFor="announcement-content">
            <Textarea
              id="announcement-content"
              placeholder="Write your message here..."
              rows={4}
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="resize-none"
            />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              <span>Post Announcement</span>
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Feed */}
      <SectionCard
        title="Recent Announcements"
        bodyClassName="p-0"
      >
        {!selectedCourseId ? (
          <div className="p-4">
            <EmptyState
              icon={BookOpen}
              title="No course selected"
              description="Select a course to view its announcements"
            />
          </div>
        ) : loading ? (
          <LoadingState className="min-h-[30vh]" />
        ) : announcements.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="No announcements found for this course."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {announcements.map((ann) => (
                <motion.li
                  key={ann.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="group px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">{ann.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive lg:opacity-0 lg:group-hover:opacity-100"
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {new Date(ann.created_at).toLocaleString()}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </SectionCard>
    </div>
  );
};

export default DoctorAnnouncements;
