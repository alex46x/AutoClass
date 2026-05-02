import { getStudentProfile } from '@/app/actions/profile';
import { User, GraduationCap, Hash, Mail, Shield } from 'lucide-react';
import EditProfileForm from './EditProfileForm';

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'emerald' },
  PENDING: { label: 'Pending Approval', color: 'amber' },
  REJECTED: { label: 'Rejected', color: 'rose' },
};

export default async function ProfilePage() {
  const profile = await getStudentProfile();
  const status = statusConfig[profile.accountStatus as keyof typeof statusConfig] || statusConfig.ACTIVE;

  return (
    <div className="space-y-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and update your academic information.</p>
      </header>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black border border-white/20 shrink-0">
            {profile.name[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black truncate">{profile.name}</h2>
            <p className="text-indigo-200 font-medium mt-0.5">{profile.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {profile.studentId && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  ID: {profile.studentId}
                </span>
              )}
              {profile.uniqueId && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  Login ID: {profile.uniqueId}
                </span>
              )}
              {profile.semesterId && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold">
                  Semester {profile.semesterId}
                </span>
              )}
              {profile.sectionId && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold">
                  Section {profile.sectionId}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                status.color === 'emerald' ? 'bg-emerald-400/20 text-emerald-200' :
                status.color === 'amber' ? 'bg-amber-400/20 text-amber-200' :
                'bg-rose-400/20 text-rose-200'
              }`}>
                ● {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Static Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center shrink-0">
            <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Roll No.</p>
            <p className="font-bold text-slate-900 dark:text-white">{profile.roll || '—'}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Semester</p>
            <p className="font-bold text-slate-900 dark:text-white">{profile.semesterId || '—'}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section</p>
            <p className="font-bold text-slate-900 dark:text-white">{profile.sectionId || '—'}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <EditProfileForm profile={profile} />
    </div>
  );
}
