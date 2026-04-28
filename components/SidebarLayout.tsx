'use client';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, Bell, Settings, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = {
  STUDENT: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: CalendarIcon, label: 'Routine', href: '/dashboard/routine' },
    { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
  ],
  TEACHER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
    { icon: CalendarIcon, label: 'Classes & Attendance', href: '/teacher/classes' },
  ],
  CR: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/cr' },
    { icon: Search, label: 'Find Room', href: '/cr/rooms' },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: BookOpen, label: 'Departments', href: '/admin/departments' },
  ]
};

export default function SidebarLayout({ children, role, userName }: { children: React.ReactNode, role: string, userName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = navItems[role as keyof typeof navItems] || [];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 relative hidden md:block">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            CampusFlow <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                  {item.label}
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 w-1.5 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-3 border border-slate-100 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 uppercase">
              {userName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Header for mobile */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
           <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            CampusFlow
          </h1>
          <button onClick={handleLogout} className="text-slate-500">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {userName.split(' ')[0]}</h1>
                <p className="text-slate-500 dark:text-slate-400">Here&apos;s what&apos;s happening today.</p>
              </div>
              <div className="flex gap-3">
                <div className="hidden sm:flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Healthy
                </div>
                <button className="p-2 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
                </button>
              </div>
            </header>
            
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
