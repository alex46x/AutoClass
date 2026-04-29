'use client';

import { useState } from 'react';
import { updateStudentProfile } from '@/app/actions/profile';
import { Save, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfileForm({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    semester: profile.semester || '',
    section: profile.section || '',
    roll: profile.roll || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStudentProfile(formData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Pencil className="w-5 h-5 text-slate-400" />
          Edit Information
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold text-center"
          >
            ✓ Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
              <input
                type="text"
                value={formData.roll}
                onChange={e => setFormData({ ...formData, roll: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester (e.g., 2.2)</label>
              <input
                type="text"
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                placeholder="e.g. 2.2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                placeholder="e.g. A"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Full Name', value: profile.name },
            { label: 'Roll Number', value: profile.roll || '—' },
            { label: 'Semester', value: profile.semester || '—' },
            { label: 'Section', value: profile.section || '—' },
            { label: 'Student ID', value: profile.studentId || '—' },
            { label: 'Email', value: profile.email },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
