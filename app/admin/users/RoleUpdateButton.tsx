'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/admin';
import { ShieldAlert, GraduationCap } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function RoleUpdateButton({ id, currentRole }: { id: number, currentRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | 'HEAD' | null>(null);

  const handleRoleChange = async () => {
    if (!targetRole) return;
    const roleToSet = targetRole;
    setTargetRole(null);
    setLoading(true);
    try {
      await updateUserRole(id, roleToSet);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (currentRole === 'ADMIN') return null;

  return (
    <div className="flex items-center gap-1 justify-end">
      {currentRole === 'TEACHER' && (
        <button
          onClick={() => setTargetRole('HEAD')}
          disabled={loading}
          className="p-1.5 rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600 border border-fuchsia-200 dark:bg-fuchsia-900/20 dark:hover:bg-fuchsia-900/30 dark:border-fuchsia-900/50 transition-colors"
          title="Promote to Department Head"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      )}
      {currentRole === 'HEAD' && (
        <button
          onClick={() => setTargetRole('TEACHER')}
          disabled={loading}
          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:border-emerald-900/50 transition-colors"
          title="Demote to Teacher"
        >
          <GraduationCap className="w-4 h-4" />
        </button>
      )}

      <ConfirmModal 
        isOpen={!!targetRole}
        title="Change Role?"
        message={`Are you sure you want to change this user's role to ${targetRole === 'HEAD' ? 'Department Head' : targetRole}?`}
        confirmLabel="Change Role"
        variant="primary"
        onConfirm={handleRoleChange}
        onCancel={() => setTargetRole(null)}
      />
    </div>
  );
}
