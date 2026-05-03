'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createExam } from '@/app/actions/grading';
import { motion, AnimatePresence } from 'framer-motion';
import GlassSelect from '@/components/GlassSelect';

export default function CreateExamForm({ courseId }: { courseId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    type: 'MIDTERM', 
    maxMarks: 30 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createExam(courseId, formData.type, formData.title, Number(formData.maxMarks));
      setIsOpen(false);
      setFormData({ title: '', type: 'MIDTERM', maxMarks: 30 });
    } catch (err) {
      alert('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors"
      >
        <Plus className="w-4 h-4" /> Create Assessment
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Assessment</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assessment Type</label>
                  <GlassSelect
                    value={formData.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      let maxMarks = 30;
                      if (type === 'FINAL') maxMarks = 40;
                      if (type === 'QUIZ') maxMarks = 10;
                      if (type === 'ASSIGNMENT') maxMarks = 10;
                      setFormData({...formData, type, maxMarks});
                    }}
                    className="w-full"
                  >
                    <option value="MIDTERM">Midterm Exam</option>
                    <option value="FINAL">Final Exam</option>
                    <option value="QUIZ">Quiz / Class Test</option>
                    <option value="ASSIGNMENT">Assignment</option>
                  </GlassSelect>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Spring 2024 Midterm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Maximum Marks</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    step="0.5"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({...formData, maxMarks: Number(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70"
                  >
                    {loading ? 'Creating...' : 'Create Assessment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
