'use client';

import { useState, useEffect } from 'react';
import { getCourseMaterials } from '@/app/actions/materials';
import { getCourseNotices } from '@/app/actions/notices';
import { BookOpen, Link as LinkIcon, FileText, Loader2, X, ExternalLink, Bell, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ViewMaterialsModal({ 
  courseId, 
  courseName, 
  onClose 
}: { 
  courseId: number; 
  courseName: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'MATERIALS' | 'NOTICES'>('MATERIALS');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'MATERIALS') {
        const data = await getCourseMaterials(courseId);
        setItems(data);
      } else {
        const data = await getCourseNotices(courseId);
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Course Hub: {courseName}
            </h2>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setActiveTab('MATERIALS')}
                className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'MATERIALS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                Resources
              </button>
              <button 
                onClick={() => setActiveTab('NOTICES')}
                className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'NOTICES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                Notice Board
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-400">Syncing with hub...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto" />
              <p className="text-slate-500 font-medium italic">No {activeTab.toLowerCase()} posted yet.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className={`p-5 rounded-2xl border transition-colors ${activeTab === 'NOTICES' ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${activeTab === 'NOTICES' ? 'bg-rose-100 text-rose-600' : (item.type === 'LINK' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600')}`}>
                    {activeTab === 'NOTICES' ? <Megaphone className="w-5 h-5" /> : (item.type === 'LINK' ? <LinkIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h3>
                      <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {activeTab === 'NOTICES' ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>
                    ) : (
                      item.type === 'LINK' ? (
                        <a 
                          href={item.content} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline truncate"
                        >
                          {item.content} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </p>
                      )
                    )}
                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted by {item.teacherName}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
