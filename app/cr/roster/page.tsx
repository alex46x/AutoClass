import { getCRClassmatesWithDetails, getCRProfile, getMyRemovalRequests } from '@/app/actions/cr';
import { Users, GraduationCap, Mail, Phone, Hash, AlertTriangle, Clock } from 'lucide-react';
import RemovalRequestButton from './RemovalRequestButton';

export default async function CRRosterPage() {
  const [classmates, cr, removalRequests] = await Promise.all([
    getCRClassmatesWithDetails(),
    getCRProfile(),
    getMyRemovalRequests(),
  ]);

  const pendingRemovals = removalRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Class Roster
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Active students in <strong>{cr?.semester}</strong>, Section <strong>{cr?.section}</strong>
        </p>
      </header>

      {/* Pending removal notices */}
      {pendingRemovals.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
              {pendingRemovals.length} pending removal request{pendingRemovals.length > 1 ? 's' : ''} awaiting admin approval.
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              Students: {pendingRemovals.map(r => r.studentName).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {classmates.length} active member{classmates.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
            {cr?.semester} · Sec {cr?.section}
          </span>
        </div>

        {classmates.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No active classmates in your section yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16">Roll</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classmates.map((student, idx) => {
                  const hasPendingRemoval = removalRequests.some(r => r.studentId === student.id && r.status === 'PENDING');
                  return (
                    <tr key={student.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${hasPendingRemoval ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center">
                          {student.roll || idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black text-sm shrink-0">
                            {student.name[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {student.studentId || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${student.email}`} className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors text-sm">
                          <Mail className="w-3.5 h-3.5" />{student.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          student.role === 'CR' 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        }`}>
                          {student.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {hasPendingRemoval ? (
                          <span className="flex items-center justify-end gap-1 text-xs text-amber-500 font-medium">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        ) : student.role !== 'CR' && (
                          <RemovalRequestButton student={{ id: student.id, name: student.name, email: student.email }} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Requests */}
      {removalRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm">My Removal Requests</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {removalRequests.map(req => (
              <div key={req.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{req.studentName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{req.reason}</p>
                  {req.adminNote && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">Admin note: {req.adminNote}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                  req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
