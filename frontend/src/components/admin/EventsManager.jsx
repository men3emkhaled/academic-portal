import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, MapPin, Plus, Trash2, Edit3,
  LayoutGrid, List as ListIcon, Clock, CalendarDays,
} from 'lucide-react';

import {
  PageContainer,
  PageHeader,
  StatCard,
  Toolbar,
  SearchInput,
  SectionCard,
  DataTable,
  Modal,
  FormField,
  SegmentedTabs,
  StatusBadge,
  EmptyState,
  LoadingState,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EventsManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    category: 'Activity',
    is_published: true
  });

  const categories = ['All', 'Activity', 'Workshop', 'Social', 'Academic', 'Sports', 'Ceremony'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/all');
      setEvents(response.data);
    } catch (error) {
      toast.error(t('admin.messages.load_events_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/events', formData);
        toast.success(t('common.success'));
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.events.delete_confirm'))) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success(t('common.success'));
      fetchEvents();
    } catch (error) {
      toast.error(t('admin.messages.delete_event_failed'));
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      const date = new Date(event.event_date);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: localDate,
        location: event.location || '',
        category: event.category || 'Activity',
        is_published: event.is_published
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        category: 'Activity',
        is_published: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  const categoryLabel = (cat) =>
    cat === 'All'
      ? t('admin.events.categories.all')
      : t(`admin.events.categories.${cat.toLowerCase()}`);

  const tableColumns = [
    {
      key: 'title',
      header: t('admin.events.modals.event_title'),
      cellClassName: 'font-medium text-foreground',
      render: (event) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{event.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {categoryLabel(event.category || 'Activity')}
          </p>
        </div>
      ),
    },
    {
      key: 'event_date',
      header: t('admin.events.modals.event_date'),
      render: (event) => {
        const d = formatDate(event.event_date);
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-3.5" />
            {d.time} · {d.month} {d.day}
          </span>
        );
      },
    },
    {
      key: 'location',
      header: t('admin.events.modals.location'),
      render: (event) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {event.location || t('admin.events.online_protocol')}
        </span>
      ),
    },
    {
      key: 'is_published',
      header: t('admin.events.stream_status'),
      render: (event) => (
        <StatusBadge variant={event.is_published ? 'success' : 'neutral'}>
          {event.is_published ? t('admin.events.published') : t('admin.events.draft')}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (event) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openModal(event)}
            aria-label={t('common.edit')}
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(event.id)}
            aria-label={t('common.delete')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const emptyBlock = (
    <EmptyState
      icon={CalendarDays}
      title={t('admin.events.no_events')}
      description={t('admin.events.no_events_hint')}
      action={
        <Button onClick={() => openModal()}>
          <Plus className="size-4" />
          {t('admin.events.add_button')}
        </Button>
      }
    />
  );

  return (
    <PageContainer>
      <PageHeader
        icon={Calendar}
        title={t('admin.events.title')}
        description={t('admin.events.description')}
        actions={
          <Button onClick={() => openModal()}>
            <Plus className="size-4" />
            {t('admin.events.add_button')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          accent
          icon={CalendarDays}
          label={t('admin.events.stream_status')}
          value={events.length}
          hint={t('admin.events.total_count', { count: events.length })}
        />
      </div>

      <Toolbar>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.events.search_placeholder')}
            aria-label={t('admin.events.search_placeholder')}
          />
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="h-8 w-full sm:w-44" aria-label={t('admin.events.protocol')}>
              <SelectValue placeholder={categoryLabel('All')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabel(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SegmentedTabs
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'grid', label: '', icon: LayoutGrid },
            { value: 'list', label: '', icon: ListIcon },
          ]}
        />
      </Toolbar>

      {loading ? (
        <LoadingState />
      ) : filteredEvents.length === 0 ? (
        emptyBlock
      ) : viewMode === 'list' ? (
        <DataTable
          columns={tableColumns}
          rows={filteredEvents}
          getRowKey={(event) => event.id}
          empty={emptyBlock}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredEvents.map((event) => {
              const dateInfo = formatDate(event.event_date);
              return (
                <SectionCard key={event.id} bodyClassName="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {categoryLabel(event.category || 'Activity')}
                    </span>
                    <StatusBadge variant={event.is_published ? 'success' : 'neutral'}>
                      {event.is_published ? t('admin.events.published') : t('admin.events.draft')}
                    </StatusBadge>
                  </div>

                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0" />
                      <span className="truncate">{dateInfo.time} · {dateInfo.full}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" />
                      <span className="truncate">
                        {event.location || t('admin.events.online_protocol')}
                      </span>
                    </p>
                  </div>

                  {event.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/70">
                      {t('admin.events.no_desc')}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
                    <Button variant="ghost" size="sm" onClick={() => openModal(event)}>
                      <Edit3 className="size-4" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(event.id)}
                      aria-label={t('common.delete')}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </SectionCard>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      <Modal
        open={showModal}
        onOpenChange={(open) => (open ? setShowModal(true) : closeModal())}
        size="lg"
        title={editingEvent ? t('admin.events.modals.edit_event') : t('admin.events.modals.new_event')}
        description={t('admin.events.registry_sync')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="event-form" disabled={submitting}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t('admin.events.modals.event_title')} htmlFor="event-title" required>
            <Input
              id="event-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('admin.events.modals.placeholder_title')}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('admin.events.modals.event_date')} htmlFor="event-date" required>
              <Input
                id="event-date"
                type="datetime-local"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </FormField>

            <FormField label={t('admin.events.modals.location')} htmlFor="event-location">
              <Input
                id="event-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('admin.events.modals.placeholder_location')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('admin.events.modals.category')}>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('admin.events.modals.publish')} hint={t('admin.events.propagation_protocol')}>
              <div className="flex h-8 items-center">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  aria-label={t('admin.events.modals.publish')}
                />
              </div>
            </FormField>
          </div>

          <FormField label={t('admin.events.modals.description')} htmlFor="event-description">
            <Textarea
              id="event-description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.events.modals.placeholder_desc')}
              className="resize-none"
            />
          </FormField>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default EventsManager;
