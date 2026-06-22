import React from 'react';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TATasks = ({ courses }) => {
  const { t } = useTranslation();
  if (!courses || courses.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('ta.tasks.title')}</h1>
        <p className="text-gray-400 font-medium">{t('ta.tasks.empty_courses')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('ta.tasks.title')}</h1>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{t('ta.tasks.subtitle')}</p>
      <div className="grid grid-cols-1 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-[#059669]" />
              <h3 className="font-bold text-gray-900 dark:text-white">{course.name}</h3>
            </div>
            <p className="text-sm text-gray-400 mt-2">{t('ta.tasks.coming_soon')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TATasks;
