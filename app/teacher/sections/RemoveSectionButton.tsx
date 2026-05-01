'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { removeDepartmentSection } from '@/app/actions/head';
import ConfirmModal from '@/components/ConfirmModal';

export default function RemoveSectionButton({ sectionId, sectionName, studentCount }: { sectionId: number, sectionName: string, studentCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeDepartmentSection(sectionId);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to remove section');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
        title="Remove Section"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Remove Section?"
        message={`Are you sure you want to remove "${sectionName}"? The ${studentCount} student(s) currently in this section will become unassigned.`}
        confirmLabel={loading ? "Removing..." : "Remove Section"}
        onConfirm={handleRemove}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
