import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2, Plus, Edit3, Trash2, Layers, Activity,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  Toolbar,
  SearchInput,
  DataTable,
  Modal,
  FormField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DepartmentManager = () => {
  const { t, i18n } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_depts_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/departments', formData);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.departments.delete_confirm', { name }))) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success(t('common.success'));
      fetchDepartments();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const editDepartment = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAr = i18n.language === 'ar';

  const columns = [
    {
      key: 'code',
      header: t('admin.departments.modals.short_code'),
      headClassName: 'w-24',
      render: (dept) => (
        <span className="inline-flex items-center justify-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {dept.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: t('admin.departments.modals.full_name'),
      render: (dept) => (
        <span className="font-medium text-foreground">{dept.name}</span>
      ),
    },
    {
      key: 'description',
      header: t('admin.departments.modals.description'),
      cellClassName: 'max-w-md',
      render: (dept) => (
        <span className="line-clamp-2 text-muted-foreground">
          {dept.description || t('admin.departments.no_desc')}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('admin.departments.active_status'),
      headClassName: 'w-32',
      render: () => (
        <StatusBadge variant="success" icon={Activity}>
          {t('admin.departments.active_status')}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('common.actions')}</span>,
      headClassName: 'w-24 text-end',
      cellClassName: 'text-end',
      render: (dept) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => editDepartment(dept)}
            aria-label={t('common.edit')}
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(dept.id, dept.name)}
            aria-label={t('common.delete')}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 sm:px-0 text-start">
      <PageHeader
        icon={Building2}
        title={t('admin.departments.title')}
        description={t('admin.departments.registry_alignment')}
        actions={
          <Button onClick={() => setShowForm(true)} className={isAr ? 'font-arabic' : undefined}>
            <Plus className="size-4" />
            {t('admin.departments.add_button')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t('admin.departments.structure_nodes')}
          value={departments.length}
          icon={Layers}
          hint={t('admin.departments.total_count', { count: departments.length })}
          accent
        />
        <StatCard
          label={t('admin.departments.active_status')}
          value={filteredDepts.length}
          icon={Activity}
          hint={t('admin.sidebar.tabs.departments')}
        />
      </div>

      <Toolbar>
        <SearchInput
          placeholder={t('admin.departments.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Toolbar>

      {loading && departments.length === 0 ? (
        <LoadingState />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredDepts}
          getRowKey={(dept) => dept.id}
          empty={
            <EmptyState
              icon={Layers}
              title={t('admin.departments.no_departments')}
              description={t('admin.departments.no_departments_hint')}
              action={
                <Button variant="secondary" onClick={() => setShowForm(true)}>
                  <Plus className="size-4" />
                  {t('admin.departments.add_button')}
                </Button>
              }
            />
          }
        />
      )}

      {/* Create / edit modal */}
      <Modal
        open={showForm}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        size="lg"
        title={editingDept ? t('admin.departments.modals.edit_dept') : t('admin.departments.modals.new_dept')}
        description={t('admin.departments.registry_alignment')}
      >
        <AnimatePresence mode="wait">
          <motion.form
            key={editingDept ? `edit-${editingDept.id}` : 'create'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                label={t('admin.departments.modals.short_code')}
                htmlFor="dept-code"
                required
              >
                <Input
                  id="dept-code"
                  type="text"
                  required
                  placeholder={t('admin.departments.modals.placeholder_code')}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </FormField>

              <FormField
                label={t('admin.departments.modals.full_name')}
                htmlFor="dept-name"
                required
                className="md:col-span-2"
              >
                <Input
                  id="dept-name"
                  type="text"
                  required
                  placeholder={t('admin.departments.modals.placeholder_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormField>
            </div>

            <FormField
              label={t('admin.departments.modals.description')}
              htmlFor="dept-description"
            >
              <Textarea
                id="dept-description"
                rows="4"
                placeholder={t('admin.departments.modals.placeholder_desc')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </FormField>

            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={resetForm} className="sm:order-1">
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="sm:order-2">
                {loading ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </motion.form>
        </AnimatePresence>
      </Modal>
    </div>
  );
};

export default DepartmentManager;
