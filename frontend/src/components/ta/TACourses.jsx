import React, { useState } from 'react';
import { BookOpen, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TACourses = ({ courses, onSelectCourse }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('ta.courses.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t('ta.courses.subtitle')}</p>
        </div>
      </div>

      <input
        type="text"
        placeholder={t('ta.courses.search_placeholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md bg-gray-100 dark:bg-white/5 border border-transparent focus:border-[#059669] rounded-2xl py-3 px-6 text-sm outline-none transition-all"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-[#059669]/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-[#059669]/10">
                <BookOpen className="w-6 h-6 text-[#059669]" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">{course.name}</h3>
            {course.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{course.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.student_count || 0}</span>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400 font-medium">
            {t('ta.courses.empty')}
          </div>
        )}
      </div>
    </div>
  );
};

export default TACourses;
