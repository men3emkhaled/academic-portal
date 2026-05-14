import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, Calendar, BarChart3, ChevronRight, Activity, Trophy } from 'lucide-react';

const AttemptsLog = ({ attempts, selectedQuiz }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white/80 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-inner animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="py-6 px-10 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.quizzes.attempts.student_col')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.quizzes.attempts.date_col')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.quizzes.attempts.score_col')}</th>
                <th className="py-6 px-10 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">{t('admin.quizzes.attempts.status_col')}</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
            {attempts.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-32 opacity-30 grayscale">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">{t('admin.quizzes.attempts.no_attempts')}</p>
                    </td>
                </tr>
            ) : (
                attempts.map((att) => {
                const isPassed = att.percentage >= (selectedQuiz.passing_score || 50);
                return (
                <tr key={att.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 px-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                            {att.avatar_url ? (
                                <img src={att.avatar_url} alt={att.student_name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-gray-300" />
                            )}
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-sm">{att.student_name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black tracking-widest uppercase mt-0.5">ID: {att.student_id}</p>
                        </div>
                    </div>
                    </td>
                    <td className="py-6 px-8">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5 text-indigo-500/50" /> {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500/50" /> {new Date(att.started_at).toLocaleDateString()}
                        </div>
                    </div>
                    </td>
                    <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{att.score !== null ? att.score : '--'}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('admin.quizzes.attempts.raw_points')}</span>
                        </div>
                        <div className="w-24 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-1000 ${
                                isPassed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                            }`} style={{ width: `${att.percentage || 0}%` }}></div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-black tracking-tighter ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {att.percentage !== null ? `${att.percentage}%` : '??'}
                            </span>
                            {isPassed && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                    </div>
                    </td>
                    <td className="py-6 px-10 text-right">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        att.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' :
                        att.status === 'timed_out' ? 'bg-rose-500/5 border-rose-500/20 text-rose-600' :
                        'bg-amber-500/5 border-amber-500/20 text-amber-600'
                    }`}>
                        {t(`admin.quizzes.attempts.statuses.${att.status}`)}
                    </span>
                    </td>
                </tr>
                );})
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttemptsLog;
