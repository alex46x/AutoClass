'use client';

import { useState } from 'react';
import { requestMakeupClass } from '@/app/actions/cr';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import GlassDatePicker from '@/components/GlassDatePicker';
import GlassSelect from '@/components/GlassSelect';
import GlassTimePicker from '@/components/GlassTimePicker';

export default function MakeupClassForm({
  courses,
  classrooms,
  teachers
}: {
  courses: { id: number; name: string; code: string }[];
  classrooms: { id: number; name: string }[];
  teachers: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      await requestMakeupClass({
        courseId: Number(formData.get('courseId')),
        classroomId: Number(formData.get('classroomId')),
        teacherId: Number(formData.get('teacherId')),
        date: formData.get('date') as string,
        startTime: formData.get('startTime') as string,
        endTime: formData.get('endTime') as string,
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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request Submitted!</h3>
        <p className="text-slate-500 mt-2">Your makeup class request has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Course
        </label>
        <GlassSelect
          name="courseId" 
          required
          className="w-full"
        >
          <option value="">Select a course...</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </GlassSelect>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Teacher
        </label>
        <GlassSelect
          name="teacherId" 
          required
          className="w-full"
        >
          <option value="">Select teacher...</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </GlassSelect>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Classroom
        </label>
        <GlassSelect
          name="classroomId" 
          required
          className="w-full"
        >
          <option value="">Select an empty room...</option>
          {classrooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </GlassSelect>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Date
          </label>
          <GlassDatePicker
            name="date"
            required
            placeholder="Select class date"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Time
            </label>
            <GlassTimePicker
              name="startTime"
              required
              placeholder="Start time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Time
            </label>
            <GlassTimePicker
              name="endTime"
              required
              placeholder="End time"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
