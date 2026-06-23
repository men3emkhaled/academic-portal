import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building2, CalendarDays, Clock, ExternalLink, Eye } from 'lucide-react';

const statusColors = {
  Open: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Closed: 'bg-red-500/10 text-red-500 border-red-500/20',
  Upcoming: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const modeColors = {
  Online: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  Offline: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Online + Offline': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const InternshipCard = ({ internship, onViewDetails, isLocked }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const statusKey = internship.status?.toLowerCase();
  const modeKey = internship.work_mode?.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-white dark:bg-[#0e0e16] border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => !isLocked && onViewDetails?.(internship)}
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 dark:bg-black/30 rounded-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
            <p className="text-xs font-bold text-amber-500">{t('internships.level_required', { level: internship.min_level })}</p>
          </div>
        </div>
      )}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-white/10">
          {internship.company_logo_url ? (
            <img src={internship.company_logo_url} alt={internship.company_name} className="w-full h-full object-contain" />
          ) : (
            <Building2 className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
            {internship.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {internship.company_name}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {internship.status && (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[internship.status] || 'bg-gray-500/10 text-gray-500'}`}>
            {t(`internships.status_${statusKey}`)}
          </span>
        )}
        {internship.tracks?.map(t => (
          <span key={t.id} className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
            {t.name}
          </span>
        ))}
        {internship.work_mode && (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${modeColors[internship.work_mode] || 'bg-gray-500/10 text-gray-500'}`}>
            {t(`internships.${modeKey?.replace(/[\s\+]+/g, '_')}`)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        {internship.duration && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {internship.duration}
          </span>
        )}
        {internship.application_deadline && (
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(internship.application_deadline).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails?.(internship); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {t('internships.view_details')}
        </button>
        {internship.application_link && internship.status === 'Open' && (
          <a
            href={internship.application_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('internships.apply_now')}
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default InternshipCard;
