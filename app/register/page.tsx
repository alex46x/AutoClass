'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, GraduationCap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Smart extracted fields
  const [studentId, setStudentId] = useState('');
  const [roll, setRoll] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('A'); // Default
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Smart extraction logic based on typing email
  useEffect(() => {
    if (email.endsWith('@nwu.ac.bd')) {
      const prefix = email.split('@')[0];
      // Expecting format like 20242031010
      if (prefix.length >= 10 && !isNaN(Number(prefix))) {
        setStudentId(prefix);
        
        // Extract roll (assuming it's character 6 and 7, e.g. "31" from "20242031010")
        const extractedRoll = prefix.slice(6, 8);
        if (extractedRoll) setRoll(extractedRoll);

        // Guess semester (e.g., 2024 means 2nd year 2nd semester in 2026)
        const admissionYear = parseInt(prefix.slice(0, 4));
        const currentYear = new Date().getFullYear(); // e.g. 2026
        const yearDiff = currentYear - admissionYear;
        
        let guessedSemester = '1.1';
        if (yearDiff === 0) guessedSemester = '1.1';
        if (yearDiff === 1) guessedSemester = '2.1';
        if (yearDiff === 2) guessedSemester = '2.2'; // Matches user example
        if (yearDiff === 3) guessedSemester = '3.2';
        if (yearDiff >= 4) guessedSemester = '4.2';
        
        setSemester(guessedSemester);
      }
    }
  }, [email]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.endsWith('@nwu.ac.bd')) {
      setError('You must use a valid @nwu.ac.bd university email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, studentId, roll, semester, section }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to register. Please try again.');
      }
    } catch (err: any) {
       setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Registration Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your account has been created successfully. However, it requires approval before you can access the dashboard.
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl mb-8">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Status: Pending Approval
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
              Your Class Representative or University Admin must approve your registration.
            </p>
          </div>
          <Link href="/login" className="inline-flex justify-center w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Return to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative z-10"
      >
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Student Registration
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Join the CampusFlow AI network using your university email
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm text-center font-medium border border-rose-100 dark:border-rose-800/50"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Account Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Account Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">University Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                  placeholder="20242031010@nwu.ac.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Academic Intelligence */}
            <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                Academic Profile
                {email.endsWith('@nwu.ac.bd') && <span className="text-[10px] bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">Auto-Filled</span>}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-indigo-900/70 dark:text-indigo-300/70 mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900/70 dark:text-indigo-300/70 mb-1">Roll</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900/70 dark:text-indigo-300/70 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-900/70 dark:text-indigo-300/70 mb-1">Semester (e.g., 2.2)</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Registration'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
