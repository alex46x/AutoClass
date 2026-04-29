'use client';

import { useState, useEffect } from 'react';
import { getCourseMaterials, addCourseMaterial, deleteCourseMaterial } from '@/app/actions/materials';
import { getCourseNotices, addCourseNotice, deleteCourseNotice } from '@/app/actions/notices';
import { BookOpen, Plus, Trash2, Link as LinkIcon, FileText, Loader2, X, Megaphone, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '@/components/ConfirmModal';

export default function CourseMaterialsModal({ 
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
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  
  // Form states
  const [materialForm, setMaterialForm] = useState({ title: '', content: '', type: 'TEXT' as 'TEXT' | 'LINK' });
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });

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

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addCourseMaterial({ courseId, ...materialForm });
      setMaterialForm({ title: '', content: '', type: 'TEXT' });
      await loadData();
    } finally {
      setAdding(false);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addCourseNotice({ courseId, ...noticeForm });
      setNoticeForm({ title: '', message: '' });
      await loadData();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    if (activeTab === 'MATERIALS') {
      await deleteCourseMaterial(id);
    } else {
      await deleteCourseNotice(id);
    }
    await loadData();
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
                Notices
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeTab === 'MATERIALS' ? (
            <form onSubmit={handleMaterialSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Add New Resource
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Resource Title (e.g., Week 1 Slides)"
                    required
                    value={materialForm.title}
                    onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <select
                  value={materialForm.type}
                  onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as 'TEXT' | 'LINK' })}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="TEXT">Note / Text</option>
                  <option value="LINK">External Link</option>
                </select>
                <input
                  type="text"
                  placeholder={materialForm.type === 'LINK' ? 'https://...' : 'Write note here...'}
                  required
                  value={materialForm.content}
                  onChange={e => setMaterialForm({ ...materialForm, content: e.target.value })}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <button type="submit" disabled={adding} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {adding ? 'Processing...' : 'Post Resource'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleNoticeSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-rose-500" />
                Post New Notice
              </h3>
              <input
                type="text"
                placeholder="Notice Title (e.g., Tomorrow's class cancelled)"
                required
                value={noticeForm.title}
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <textarea
                placeholder="Write your detailed message..."
                required
                rows={3}
                value={noticeForm.message}
                onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
              <button type="submit" disabled={adding} className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="className" />}
                {adding ? 'Broadcasting...' : 'Post Notice'}
              </button>
            </form>
          )}

          {/* List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {activeTab === 'MATERIALS' ? 'Resources' : 'Notice History'}
            </h3>
            {loading ? (
              <p className="text-center py-8 text-slate-400">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-center py-8 text-slate-500 italic text-sm">Nothing posted yet.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-start justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl group">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${activeTab === 'MATERIALS' ? (item.type === 'LINK' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600') : 'bg-rose-100 text-rose-600'}`}>
                      {activeTab === 'MATERIALS' ? (item.type === 'LINK' ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />) : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate">{activeTab === 'MATERIALS' ? item.content : item.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title={`Delete ${activeTab === 'MATERIALS' ? 'Resource' : 'Notice'}?`}
        message={`Are you sure you want to permanently remove this ${activeTab === 'MATERIALS' ? 'resource' : 'notice'}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Send({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  )
}
