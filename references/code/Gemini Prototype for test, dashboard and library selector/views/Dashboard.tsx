
import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-10 space-y-10">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="animate-in slide-in-from-left duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">Good morning, Dr. Resident.</h1>
          <p className="text-slate-500 font-medium text-lg">You've completed 75% of your weekly learning goal. <span className="text-primary font-bold cursor-pointer hover:underline">Keep going!</span></p>
        </div>
        <div className="flex gap-4 animate-in slide-in-from-right duration-500">
          <div className="bg-white dark:bg-background-card px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                <span className="material-icons-round text-orange-500">local_fire_department</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Streak</span>
               <span className="text-lg font-bold text-slate-800 dark:text-white leading-none">14 DAYS</span>
             </div>
          </div>
          <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2">
            <span className="material-icons-round">play_arrow</span> Resume Test
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metric Cards */}
        {[
          { label: 'Average Score', value: '78%', color: 'text-emerald-500', barColor: 'bg-emerald-500', sub: 'Top 15% in current block' },
          { label: 'Percentile', value: '92nd', color: 'text-primary', barColor: 'bg-primary', sub: 'Global ranking: 1.2M users' },
          { label: 'Questions Done', value: '240 / 400', color: 'text-slate-800 dark:text-white', barColor: 'bg-slate-900 dark:bg-slate-100', sub: 'Cardiovascular Block: Phase II' }
        ].map((metric, i) => (
          <div key={i} className="bg-white dark:bg-background-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
              <span className={`text-3xl font-extrabold ${metric.color}`}>{metric.value}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className={`${metric.barColor} h-full transition-all duration-1000 ease-out group-hover:opacity-80`} 
                style={{ width: i === 0 ? '78%' : i === 1 ? '92%' : '60%' }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 italic flex items-center gap-1">
              <span className="material-icons-round text-sm">info</span>
              {metric.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics Section Simulation */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-background-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold">Activity Over Week</h2>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-500 p-2">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 px-4 min-h-[200px]">
             {[60, 45, 80, 55, 90, 75, 85].map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3">
                 <div 
                   className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer relative group" 
                   style={{ height: `${val}%` }}
                 >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     {val} Questions
                   </div>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400">
                   {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}
                 </span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white dark:bg-background-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="flex justify-between items-center mb-10">
             <h2 className="text-xl font-bold">Subject Mastery</h2>
             <button className="text-primary text-xs font-bold hover:underline">View All</button>
           </div>
           <div className="space-y-8">
             {[
               { name: 'Cardiology', val: 92, color: 'bg-primary' },
               { name: 'Pulmonology', val: 75, color: 'bg-blue-400' },
               { name: 'Gastroenterology', val: 64, color: 'bg-indigo-400' },
               { name: 'Endocrinology', val: 42, color: 'bg-emerald-400' }
             ].map((subj, i) => (
               <div key={i} className="space-y-3">
                 <div className="flex justify-between text-sm font-bold">
                   <span className="text-slate-700 dark:text-slate-300">{subj.name}</span>
                   <span className="text-primary">{subj.val}%</span>
                 </div>
                 <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`${subj.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${subj.val}%` }}></div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
