'use client';

import { Trash2 } from 'lucide-react';
import { deleteUser } from '@/app/actions/admin';
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

export default function DeleteUserButton({ id, name }: { id: number, name: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await deleteUser(id);
    } catch (e) {
      alert('Failed to delete user.');
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
        title="Delete User"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal 
        isOpen={showConfirm}
        title="Delete User?"
        message={`Are you sure you want to permanently delete ${name}?`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
