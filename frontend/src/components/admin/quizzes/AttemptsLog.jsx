import React from 'react';
import { User, Clock, Calendar, BarChart3 } from 'lucide-react';

const AttemptsLog = ({ attempts, selectedQuiz }) => {
  return (
    <div className="overflow-x-auto animate-fadeIn">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-white/[0.01] transition-colors">
            <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Node Principal</th>
            <th className="py-5 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Temporal Delta</th>
            <th className="py-5 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Vector Score</th>
            <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
          {attempts.length === 0 ? (
             <tr>
                  <td colSpan="4" className="text-center py-24 grayscale opacity-10">
                      <BarChart3 className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-white" />
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white">No sync logs detected</p>
                  </td>
             </tr>
          ) : (
            attempts.map((att) => (
              <tr key={att.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-6 px-8">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-400 dark:text-slate-500 transition-colors overflow-hidden">
                          {att.avatar_url ? (
                            <img src={att.avatar_url} alt={att.student_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                      </div>
                      <div>
                          <p className="text-gray-900 dark:text-white font-black tracking-tight transition-colors">{att.student_name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold tracking-widest uppercase transition-colors">ID: {att.student_id}</p>
                      </div>
                  </div>
                </td>
                <td className="py-6 px-6">
                  <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase flex items-center gap-2 transition-colors"><Clock className="w-3 h-3" /> {new Date(att.started_at).toLocaleTimeString()}</span>
                       <span className="text-[10px] font-bold text-gray-300 dark:text-slate-600 uppercase flex items-center gap-2 transition-colors"><Calendar className="w-3 h-3" /> {new Date(att.started_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="py-6 px-6">
                  <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-gray-900 dark:text-white transition-colors">{att.score !== null ? att.score : '--'}</span>
                      <div className="w-20 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden transition-colors">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                              att.percentage >= (selectedQuiz.passing_score || 50) ? 'bg-emerald-600 dark:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-600 dark:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                          }`} style={{ width: `${att.percentage || 0}%` }}></div>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                          att.percentage >= (selectedQuiz.passing_score || 50) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>{att.percentage !== null ? `${att.percentage}%` : '??'}</span>
                  </div>
                </td>
                <td className="py-6 px-8 text-right">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    att.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                    att.status === 'timed_out' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-300'
                  }`}>
                    {att.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttemptsLog;
