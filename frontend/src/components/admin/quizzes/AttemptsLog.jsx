import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, Calendar, BarChart3, Trophy } from 'lucide-react';

const AttemptsLog = ({ attempts, selectedQuiz }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-inner animate-in fade-in duration-700">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
            <thead>
            <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-start">{t('admin.quizzes.attempts.student_col')}</th>
                <th className="py-8 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-start">{t('admin.quizzes.attempts.date_col')}</th>
                <th className="py-8 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-start">{t('admin.quizzes.attempts.score_col')}</th>
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-end">{t('admin.quizzes.attempts.status_col')}</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
            {attempts.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-40 opacity-30">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <BarChart3 className="w-12 h-12 text-gray-400" />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white mb-2">{t('admin.quizzes.attempts.no_attempts')}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('admin.quizzes.registry_stream')}</p>
                    </td>
                </tr>
            ) : (
                attempts.map((att) => {
                const isPassed = att.percentage >= (selectedQuiz.passing_score || 50);
                return (
                <tr key={att.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all duration-500">
                    <td className="py-8 px-10 text-start">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-gray-100 dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                            {att.avatar_url ? (
                                <img src={att.avatar_url} alt={att.student_name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-7 h-7 text-gray-300" />
                            )}
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white font-black tracking-tighter text-base uppercase leading-none">{att.student_name}</p>
                            <p className="text-[9px] text-gray-400 dark:text-white/20 font-black tracking-[0.3em] uppercase mt-2 italic">ID_REF: {att.student_id}</p>
                        </div>
                    </div>
                    </td>
                    <td className="py-8 px-8 text-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            <Clock className="w-4 h-4 text-primary" /> {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest italic">
                            <Calendar className="w-4 h-4 text-primary/40" /> {new Date(att.started_at).toLocaleDateString()}
                        </div>
                    </div>
                    </td>
                    <td className="py-8 px-8 text-start">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{att.score !== null ? att.score : '--'}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">{t('admin.quizzes.attempts.raw_points')}</span>
                        </div>
                        <div className="w-32 h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                            <div className={`h-full rounded-full transition-all duration-1000 ${
                                isPassed ? 'bg-primary shadow-[0_0_12px_rgba(46,204,113,0.4)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                            }`} style={{ width: `${att.percentage || 0}%` }}></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-base font-black tracking-tighter ${isPassed ? 'text-primary' : 'text-rose-500'}`}>
                                {att.percentage !== null ? `${att.percentage}%` : '??'}
                            </span>
                            {isPassed && <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />}
                        </div>
                    </div>
                    </td>
                    <td className="py-8 px-10 text-end">
                    <span className={`px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${
                        att.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                        att.status === 'timed_out' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' :
                        'bg-amber-500/5 border-amber-500/20 text-amber-500'
                    }`}>
                        {att.status.toUpperCase()}
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
