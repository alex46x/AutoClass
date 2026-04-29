import { getCRClassmates, getCRProfile } from '@/app/actions/cr';
import { Users, GraduationCap, Hash, Mail } from 'lucide-react';

export default async function CRRosterPage() {
  const [classmates, cr] = await Promise.all([getCRClassmates(), getCRProfile()]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Class Roster
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Active students in Semester <strong>{cr?.semester}</strong>, Section <strong>{cr?.section}</strong>
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {classmates.length} active student{classmates.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
            Sem {cr?.semester} · Sec {cr?.section}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classmates.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center">
                        {student.roll || idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black text-sm shrink-0">
                        {student.name[0].toUpperCase()}
                      </div>
                      {student.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {student.studentId || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <a href={`mailto:${student.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
                        <Mail className="w-3.5 h-3.5" />{student.email}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
