'use client';

import { useState } from 'react';
import { Megaphone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBroadcast = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });
      if (!res.ok) throw new Error('Broadcast failed');
      setSuccess(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          System-Wide Broadcast
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Send an urgent notice to all students, teachers, and administrators.</p>
      </header>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl flex items-center gap-4 text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="font-bold">Broadcast Sent Successfully!</p>
              <p className="text-sm opacity-90">Every user has received your notification.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject / Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Campus Holiday Announcement"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message Content</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write the detailed message here..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white font-medium resize-none"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? 'Transmitting...' : 'Send Global Broadcast'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium justify-center">
          <Megaphone className="w-3 h-3" />
          Note: This action is recorded and visible to all system logs.
        </div>
      </form>

      <ConfirmModal 
        isOpen={showConfirm}
        title="Send Global Broadcast?"
        message="This will instantly notify every user in the system. Are you sure you want to proceed?"
        confirmLabel="Broadcast Now"
        onConfirm={handleBroadcast}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
