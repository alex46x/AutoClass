'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import ViewMaterialsModal from './ViewMaterialsModal';

export default function ViewMaterialsButton({ 
  courseId, 
  courseName 
}: { 
  courseId: number; 
  courseName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5" /> Course Hub
      </button>

      {open && (
        <ViewMaterialsModal 
          courseId={courseId}
          courseName={courseName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
