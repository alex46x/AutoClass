'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const { user } = await res.json();
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'TEACHER' || user.role === 'HEAD') router.push('/teacher');
        else if (user.role === 'CR') router.push('/cr');
        else router.push('/dashboard');
        
        // Refresh router to apply middleware state
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError('Invalid email, ID, or password. Please try again.');
        } else {
          setError(data.error || 'Failed to login. Please try again later.');
        }
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
         setError('Network error. Please check your internet connection.');
      } else {
         setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative z-10"
      >
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20">
            <span className="text-white font-bold text-2xl">U</span>
          </div>
          <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            UniHub
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Sign in to your intelligent university portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm text-center font-medium border border-rose-100 dark:border-rose-800/50"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Email address, student ID, or teacher ID
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all focus:bg-white dark:focus:bg-slate-800 font-medium"
                placeholder="Email, student ID, or teacher ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all focus:bg-white dark:focus:bg-slate-800 font-medium"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded overflow-hidden dark:bg-slate-700 dark:border-slate-600 outline-none"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-8">
           <div className="relative">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
             </div>
             <div className="relative flex justify-center text-sm">
               <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider">Demo Setup</span>
             </div>
           </div>
           
           <div className="text-center mt-4">
             <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
               Don&apos;t have an account?{' '}
               <Link href="/register" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-bold">
                 Sign up
               </Link>
             </p>
           </div>
           <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
             Use your university email, student ID, or teacher ID with your password.
           </div>
        </div>
      </motion.div>
    </div>
  );
}
