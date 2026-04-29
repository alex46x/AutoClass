'use client';

import { useState } from 'react';
import { enrollInCourse, unenrollFromCourse } from '@/app/actions/profile';
import { Plus, Minus, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function EnrollButton({ courseId, isEnrolled }: { courseId: number; isEnrolled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAction = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      if (enrolled) {
        await unenrollFromCourse(courseId);
        setEnrolled(false);
      } else {
        await enrollInCourse(courseId);
        setEnrolled(true);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enrolled) {
      setShowConfirm(true);
    } else {
      handleAction();
    }
  };

  if (loading) {
    return (
      <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold opacity-60 bg-slate-100 dark:bg-slate-800 text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
      </button>
    );
  }

  return (
    <>
      {enrolled ? (
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" /> Unenroll
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Enroll
        </button>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Unenroll?"
        message="Are you sure you want to unenroll from this course? Your attendance and grade data will be hidden."
        confirmLabel="Unenroll"
        onConfirm={handleAction}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
