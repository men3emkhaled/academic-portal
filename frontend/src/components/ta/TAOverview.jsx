import React from 'react';
import { BookOpen, Users, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TAOverview = ({ stats, courses }) => {
  const { t } = useTranslation();
  const statCards = [
    { label: t('ta.overview.assigned_courses'), value: stats?.courses_count || 0, icon: <BookOpen className="w-6 h-6" />, color: 'bg-[#059669]/10 text-[#059669]' },
    { label: t('ta.overview.total_students'), value: stats?.students_count || 0, icon: <Users className="w-6 h-6" />, color: 'bg-[#34d399]/10 text-[#059669]' },
    { label: t('ta.overview.active_tasks'), value: courses?.length || 0, icon: <ClipboardList className="w-6 h-6" />, color: 'bg-[#047857]/10 text-[#047857]' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('ta.overview.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('ta.overview.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white mt-2">{card.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {courses && courses.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">{t('ta.overview.my_courses')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white">{course.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{course.student_count || 0} {t('ta.overview.students')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TAOverview;
