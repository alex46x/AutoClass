'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound, Loader2, X } from 'lucide-react';
import { resetUserPassword } from '@/app/actions/admin';

export default function ResetPasswordButton({ id, name }: { id: number; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setTemporaryPassword('');
    try {
      const result = await resetUserPassword(id);
      setTemporaryPassword(result.temporaryPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTemporaryPassword('');
    setCopied(false);
    setError('');
  };

  const handleCopy = async () => {
    if (!temporaryPassword) return;
    await navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        title="Reset Password"
      >
        <KeyRound className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Generate a temporary password for {name}.
                </p>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-sm">
                {error}
              </div>
            )}

            {temporaryPassword ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                    Temporary Password
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/40 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white">
                      {temporaryPassword}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                      title="Copy temporary password"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This password is shown only now. It is stored in the database as a hash, not as readable text.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                The user&apos;s old password cannot be viewed. Resetting will replace it with a new temporary password.
              </p>
            )}

            <div className="pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-slate-500 font-medium text-sm"
              >
                Close
              </button>
              {!temporaryPassword && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Temporary Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
