import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { FileSpreadsheet, Download, BookOpen } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ExportAttendancePage() {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') redirect('/login');

  const assignedCourses = await db.all(sql`
    SELECT c.id, c.name, c.code, COUNT(e.student_id) as student_count
    FROM courses c
    JOIN schedules s ON s.course_id = c.id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE s.teacher_id = ${session.id}
    GROUP BY c.id
  `);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Export Attendance
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Download complete attendance records for your courses as CSV files.</p>
      </header>

      {assignedCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses assigned</h3>
          <p className="text-slate-500 mt-1">You do not have any courses assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(assignedCourses as any[]).map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                    {course.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{course.student_count} Enrolled Students</p>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <a 
                  href={`/api/export/${course.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold transition-colors border border-emerald-200 dark:border-emerald-800/50"
                  download
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
