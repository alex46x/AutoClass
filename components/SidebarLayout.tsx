'use client';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, Bell, LogOut, Search, Users, MapPin, CheckSquare, User, BarChart3, Menu, X, Megaphone, MessageSquare, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import ConfirmModal from './ConfirmModal';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type NavItem = { icon: any; label: string; href: string; divider?: string };

const navItems: Record<string, NavItem[]> = {
  STUDENT: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: CalendarIcon, label: 'Routine', href: '/dashboard/routine' },
    { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
    { icon: BookOpen, label: 'Transcript', href: '/dashboard/transcript' },
    { icon: CalendarIcon, label: 'Leave Requests', href: '/dashboard/leave' },
    { icon: CalendarClock, label: 'Events', href: '/dashboard/events' },
    { icon: Bell, label: 'Class Updates', href: '/dashboard/class-updates' },
    { icon: BarChart3, label: 'Class Polls', href: '/dashboard/polls' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: CalendarIcon, label: 'Calendar', href: '/dashboard/calendar' },
  ],
  TEACHER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
    { icon: MessageSquare, label: 'Messages', href: '/teacher/messages' },
    { icon: CalendarIcon, label: 'Classes & Attendance', href: '/teacher/classes' },
    { icon: BookOpen, label: 'Grading', href: '/teacher/grading' },
    { icon: CalendarIcon, label: 'Calendar', href: '/teacher/calendar' },
  ],
  HEAD: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
    { icon: MessageSquare, label: 'Messages', href: '/teacher/messages' },
    { icon: Users, label: 'Faculty & Students', href: '/teacher/faculty', divider: 'Department Head' },
    { icon: CalendarClock, label: 'Department Events', href: '/teacher/events' },
    { icon: BookOpen, label: 'Sections', href: '/teacher/sections' },
    { icon: CalendarIcon, label: 'Classes & Attendance', href: '/teacher/classes', divider: 'Teacher' },
    { icon: BookOpen, label: 'Grading', href: '/teacher/grading' },
    { icon: CalendarIcon, label: 'Calendar', href: '/teacher/calendar' },
  ],
  CR: [
    // ── Student Features ─────────────────────────
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', divider: 'My Academics' },
    { icon: CalendarIcon, label: 'Routine', href: '/dashboard/routine' },
    { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
    { icon: BookOpen, label: 'Transcript', href: '/dashboard/transcript' },
    { icon: CalendarClock, label: 'Events', href: '/dashboard/events' },
    { icon: Bell, label: 'Class Updates', href: '/dashboard/class-updates' },
    { icon: BarChart3, label: 'Class Polls', href: '/dashboard/polls' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    // ── CR Management Features ────────────────────
    { icon: LayoutDashboard, label: 'CR Dashboard', href: '/cr', divider: 'CR Tools' },
    { icon: Users, label: 'Class Roster', href: '/cr/roster' },
    { icon: Users, label: 'Approve Classmates', href: '/cr/approvals' },
    { icon: Search, label: 'Find Room', href: '/cr/rooms' },
    { icon: MapPin, label: 'Room Occupancy', href: '/cr/rooms/occupancy' },
    { icon: CalendarIcon, label: 'Makeup Class', href: '/cr/makeup-class' },
    { icon: CalendarClock, label: 'Class Events', href: '/cr/events' },
    { icon: Bell, label: 'Notices & Schedules', href: '/cr/notices' },
    { icon: BarChart3, label: 'Polls', href: '/cr/polls' },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
    { icon: Users, label: 'User Management', href: '/admin/users' },
    { icon: MapPin, label: 'Infrastructure', href: '/admin/infrastructure' },
    { icon: BookOpen, label: 'Academic Setup', href: '/admin/courses' },
    { icon: BookOpen, label: 'Sections', href: '/admin/sections' },
    { icon: CalendarClock, label: 'University Events', href: '/admin/events' },
    { icon: CheckSquare, label: 'Approvals', href: '/admin/approvals' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
    { icon: Megaphone, label: 'Broadcast', href: '/admin/broadcast' },
  ]
};

export default function SidebarLayout({ children, role, userName }: { children: React.ReactNode, role: string, userName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const items = navItems[role as keyof typeof navItems] || [];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            CampusFlow <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <X className="w-5 h-5" suppressHydrationWarning />
        </button>
      </div>
      
      <nav className="mt-4 px-4 space-y-1 flex-1 overflow-y-auto">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <div key={`${item.href}-${index}`}>
              {item.divider && (
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 px-4 pt-4 pb-1">
                  {item.divider}
                </p>
              )}
              <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <span className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer relative group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} suppressHydrationWarning />
                  {item.label}
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 w-1.5 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}
                </span>
              </Link>
            </div>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-3 border border-slate-100 dark:border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 uppercase">
            {userName[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 truncate uppercase tracking-widest">{role}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
        >
          <LogOut className="w-4 h-4" suppressHydrationWarning />
          Sign Out
        </button>

        <ConfirmModal 
          isOpen={showLogoutConfirm}
          title="Sign Out?"
          message="Are you sure you want to end your current session?"
          confirmLabel="Sign Out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:block">
        <div className="fixed top-0 left-0 bottom-0 w-64 h-full">
          {SidebarContent()}
        </div>
      </aside>

      {/* Mobile Sidebar Slide-over */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] z-[101] md:hidden shadow-2xl flex flex-col"
            >
              {SidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Menu className="w-6 h-6" suppressHydrationWarning />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
                {pathname === '/dashboard' || pathname === '/teacher' || pathname === '/admin' || pathname === '/cr' ? 'Overview' : pathname.split('/').pop()?.replace(/-/g, ' ')}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </div>
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
