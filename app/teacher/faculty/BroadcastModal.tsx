'use client';

import { useState } from 'react';
import { Megaphone, X, Users, GraduationCap, Globe, Shield } from 'lucide-react';
import { broadcastDepartmentNotice } from '@/app/actions/head';
import { motion, AnimatePresence } from 'framer-motion';

type Target = 'ALL' | 'FACULTY' | 'STUDENTS' | 'CRS';

const targetOptions: { value: Target; label: string; desc: string; icon: any; color: string }[] = [
  { value: 'ALL',      label: 'Everyone',    desc: 'All teachers & students in department', icon: Globe,         color: 'indigo' },
  { value: 'FACULTY',  label: 'Faculty Only', desc: 'All teachers & dept. heads only',       icon: Users,         color: 'fuchsia' },
  { value: 'STUDENTS', label: 'Students',     desc: 'All enrolled department students',      icon: GraduationCap, color: 'amber' },
  { value: 'CRS',      label: 'CRs Only',     desc: 'Class Representatives only',            icon: Shield,        color: 'emerald' },
];

export default function BroadcastModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<Target>('ALL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setLoading(true);
    try {
      await broadcastDepartmentNotice(title, message, target);
      setIsOpen(false);
      setTitle('');
      setMessage('');
      setTarget('ALL');
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast notice');
    } finally {
      setLoading(false);
    }
  };

  const selectedTarget = targetOptions.find(t => t.value === target)!;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-medium shadow-sm transition-colors"
      >
        <Megaphone className="w-4 h-4" /> Broadcast Notice
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-fuchsia-500" /> Department Broadcast
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select audience and compose your notice.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-4 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Target audience selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Send To</label>
                  <div className="grid grid-cols-4 gap-2">
                    {targetOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTarget(opt.value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all ${
                          target === opt.value
                            ? opt.value === 'ALL'      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500'
                            : opt.value === 'FACULTY'  ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-500'
                            : opt.value === 'STUDENTS' ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-center">
                    {selectedTarget.desc}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
                    placeholder="e.g., Department Meeting Tomorrow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none text-sm"
                    placeholder="Type the notice content here..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                  >
                    <Megaphone className="w-4 h-4" />
                    {loading ? 'Sending...' : `Broadcast to ${selectedTarget.label}`}
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
