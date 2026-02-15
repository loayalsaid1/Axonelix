
import React, { useState } from 'react';
import { LIBRARY_TOPICS } from '../constants.tsx';

export const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = LIBRARY_TOPICS.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.subtopics.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Clinical Library</h1>
          <p className="text-slate-500 font-medium text-lg">Deep dives into pathophysiology, management, and board-relevant facts.</p>
          
          <div className="relative max-w-2xl">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search diseases, symptoms, or medications..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-background-card border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-white dark:bg-background-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-icons-round">category</span>
                </div>
                <h3 className="font-bold text-xl">{topic.name}</h3>
              </div>
              <ul className="space-y-2">
                {topic.subtopics.map((sub, i) => (
                  <li key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {sub}
                    <span className="material-icons-round text-xs opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
