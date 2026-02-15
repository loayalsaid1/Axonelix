
import React, { useState } from 'react';
import { MOCK_SUBJECTS } from '../constants.tsx';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setView: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f8] dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} bg-white dark:bg-[#16222e] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-40`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-icons-round">medical_services</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">MedCore</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Navigation</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setView('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeView === 'dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="material-icons-round text-lg">dashboard</span>
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView('qbank')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeView === 'qbank' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="material-icons-round text-lg">quiz</span>
                  QBank (Testing)
                </button>
              </li>
              <li>
                <button 
                   onClick={() => setView('library')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeView === 'library' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="material-icons-round text-lg">local_library</span>
                  Library
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Curriculum</h3>
            <div className="space-y-4">
              {MOCK_SUBJECTS.map((subject) => (
                <div key={subject.id} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 flex justify-between">
                    <span>{subject.name}</span>
                    <span className="text-primary">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all" style={{ width: `${subject.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">DR</div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Dr. Resident</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tight">MS-IV Resident</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
};
