import { getCRRoster } from '@/app/actions/cr';
import { Users, Mail, GraduationCap } from 'lucide-react';

export default async function RosterPage() {
  const roster = await getCRRoster();

  // Group roster by course code
  const groupedRoster = roster.reduce((acc, curr) => {
    if (!acc[curr.courseCode]) {
      acc[curr.courseCode] = {
        courseName: curr.courseName,
        students: []
      };
    }
    acc[curr.courseCode].students.push(curr);
    return acc;
  }, {} as Record<string, { courseName: string, students: typeof roster }>);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Class Roster
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View all students enrolled in your batch courses.</p>
      </header>

      {Object.keys(groupedRoster).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
          <p className="text-slate-500 mt-1">You are not assigned to any courses yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRoster).map(([code, { courseName, students }]) => (
            <div key={code} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-4 border-b border-indigo-100 dark:border-indigo-800/30 flex justify-between items-center">
                <div>
                  <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-md mb-2">
                    {code}
                  </span>
                  <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">
                    {courseName}
                  </h2>
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800/50">
                  {students.length} Students
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => (
                  <div key={`${code}-${student.studentId}`} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 uppercase shrink-0">
                        {student.studentName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          {student.studentName}
                          {/* Highlight if it's the CR looking at their own name */}
                          {/* Not checking session ID here for simplicity, but could be a nice touch */}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Student ID: {1000 + student.studentId}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={`mailto:${student.studentEmail}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                      title={`Email ${student.studentName}`}
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
