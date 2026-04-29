'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/admin';
import { ShieldAlert, GraduationCap } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function RoleUpdateButton({ id, currentRole }: { id: number, currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'TEACHER' | 'CR' | 'ADMIN' | null>(null);

  const handleRoleChange = async () => {
    if (!targetRole) return;
    const roleToSet = targetRole;
    setTargetRole(null);
    setLoading(true);
    try {
      await updateUserRole(id, roleToSet);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (currentRole === 'ADMIN') return null;

  return (
    <div className="flex items-center gap-1 justify-end">
      {currentRole === 'STUDENT' && (
        <button
          onClick={() => setTargetRole('CR')}
          disabled={loading}
          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 dark:border-amber-900/50 transition-colors"
          title="Promote to CR"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      )}
      {currentRole === 'CR' && (
        <button
          onClick={() => setTargetRole('STUDENT')}
          disabled={loading}
          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:border-indigo-900/50 transition-colors"
          title="Demote to Student"
        >
          <GraduationCap className="w-4 h-4" />
        </button>
      )}

      <ConfirmModal 
        isOpen={!!targetRole}
        title="Change Role?"
        message={`Are you sure you want to change this user's role to ${targetRole}?`}
        confirmLabel="Change Role"
        variant="primary"
        onConfirm={handleRoleChange}
        onCancel={() => setTargetRole(null)}
      />
    </div>
  );
}
