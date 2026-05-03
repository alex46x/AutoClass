'use client';

import { useState } from 'react';
import { sendNotice } from '@/app/actions/cr';
import { CheckCircle2 } from 'lucide-react';
import GlassDatePicker from '@/components/GlassDatePicker';
import GlassSelect from '@/components/GlassSelect';
import GlassTimePicker from '@/components/GlassTimePicker';

export default function NoticeForm({
  courses
}: {
  courses: { id: number; name: string; code: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [type, setType] = useState<'NOTICE' | 'SCHEDULE'>('NOTICE');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await sendNotice({
        courseId: Number(formData.get('courseId')),
        type,
        title: formData.get('title') as string,
        message: formData.get('message') as string,
        scheduledDate: formData.get('scheduledDate') as string,
        startTime: formData.get('startTime') as string,
        endTime: formData.get('endTime') as string,
      });

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        setSuccess(false);
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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Posted!</h3>
        <p className="text-slate-500 mt-2">The right classmates and teacher will be notified.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Post Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['NOTICE', 'SCHEDULE'] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                type === item
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item === 'NOTICE' ? 'Notice' : 'Schedule'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Course
        </label>
        <GlassSelect
          name="courseId" 
          required={type === 'SCHEDULE'}
          className="w-full"
        >
          {type === 'NOTICE' && <option value="0">General class update</option>}
          <option value="">{type === 'SCHEDULE' ? 'Select a course for this schedule...' : 'Or select a specific course...'}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </GlassSelect>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          General updates go to your active section classmates. Course notices also notify the course teacher.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Title
        </label>
        <input 
          type="text" 
          name="title"
          required
          placeholder={type === 'SCHEDULE' ? 'e.g., Lab practice on Sunday' : 'e.g., Assignment reminder'}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {type === 'SCHEDULE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date
            </label>
            <GlassDatePicker
              name="scheduledDate"
              required={type === 'SCHEDULE'}
              placeholder="Schedule date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start
            </label>
            <GlassTimePicker
              name="startTime"
              required={type === 'SCHEDULE'}
              placeholder="Start time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End
            </label>
            <GlassTimePicker
              name="endTime"
              required={type === 'SCHEDULE'}
              placeholder="End time"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Message
        </label>
        <textarea 
          name="message"
          required
          rows={5}
          placeholder={type === 'SCHEDULE' ? 'Add room, preparation notes, or agenda...' : 'Type the details of your notice here...'}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {loading ? 'Posting...' : type === 'SCHEDULE' ? 'Post Schedule' : 'Broadcast Notice'}
      </button>
    </form>
  );
}
