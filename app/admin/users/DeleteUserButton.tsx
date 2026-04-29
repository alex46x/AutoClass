'use client';

import { Trash2 } from 'lucide-react';
import { deleteUser } from '@/app/actions/admin';
import { useState } from 'react';

export default function DeleteUserButton({ id, name }: { id: number, name: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete ${name}?`)) {
      setLoading(true);
      try {
        await deleteUser(id);
      } catch (e) {
        alert('Failed to delete user.');
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
      title="Delete User"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
