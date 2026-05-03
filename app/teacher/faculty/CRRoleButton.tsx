'use client';

import { useState } from 'react';
import { GraduationCap, Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import { updateDepartmentStudentCrRole } from '@/app/actions/head';

export default function CRRoleButton({
  studentId,
  studentName,
  currentRole,
}: {
  studentId: number;
  studentName: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const makeCr = currentRole !== 'CR';

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await updateDepartmentStudentCrRole(studentId, makeCr);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update CR role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          makeCr
            ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-900/30'
            : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-900/30'
        }`}
        title={makeCr ? 'Promote to CR' : 'Demote to Student'}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : makeCr ? (
          <ShieldAlert className="h-4 w-4" />
        ) : (
          <GraduationCap className="h-4 w-4" />
        )}
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        title={makeCr ? 'Promote to CR?' : 'Demote to Student?'}
        message={
          makeCr
            ? `Promote ${studentName} to Class Representative?`
            : `Demote ${studentName} back to Student?`
        }
        confirmLabel={makeCr ? 'Promote' : 'Demote'}
        variant="primary"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
