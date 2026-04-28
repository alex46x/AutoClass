'use client';

import { useState } from 'react';
import { sendNotice } from '@/app/actions/cr';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function NoticeForm({
  courses
}: {
  courses: { id: number; name: string; code: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      await sendNotice({
        courseId: Number(formData.get('courseId')),
        title: formData.get('title') as string,
        message: formData.get('message') as string,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/cr');
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notice Sent!</h3>
        <p className="text-slate-500 mt-2">All students in the course will be notified.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Course
        </label>
        <select 
          name="courseId" 
          required
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a course to broadcast to...</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Notice Title
        </label>
        <input 
          type="text" 
          name="title"
          required
          placeholder="e.g., Makeup Class Tomorrow"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Message
        </label>
        <textarea 
          name="message"
          required
          rows={5}
          placeholder="Type the details of your notice here..."
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {loading ? 'Sending...' : 'Broadcast Notice'}
      </button>
    </form>
  );
}
