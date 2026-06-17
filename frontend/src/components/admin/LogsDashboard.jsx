import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ActivityLogsManager from './ActivityLogsManager';
import StudentLogins from './StudentLogins';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Users, History } from 'lucide-react';
import { PageHeader, SectionCard, SegmentedTabs } from '@/components/common';

const LogsDashboard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('admin');

  const tabOptions = [
    { value: 'admin', label: t('admin.logs.admin_tab'), icon: ShieldAlert },
    { value: 'student', label: t('admin.logs.student_tab'), icon: Users },
  ];

  return (
    <div className={`space-y-6 pb-10 text-start ${isAr ? 'font-arabic' : ''}`}>
      <PageHeader
        icon={History}
        title={t('admin.logs.title')}
        description={t('admin.logs.audit_trail')}
        actions={
          <SegmentedTabs
            value={activeTab}
            onChange={setActiveTab}
            options={tabOptions}
          />
        }
      />

      <SectionCard bodyClassName="p-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'admin' ? <ActivityLogsManager /> : <StudentLogins />}
          </motion.div>
        </AnimatePresence>
      </SectionCard>
    </div>
  );
};

export default LogsDashboard;
