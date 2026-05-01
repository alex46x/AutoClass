import { getCourses, getDepartments, getSemesters, getSections } from '@/app/actions/admin';
import { BookOpen, Hash } from 'lucide-react';
import AddCourseForm from './AddCourseForm';
import SemesterManager from './SemesterManager';
import CourseFilters from './CourseFilters';
import EditCourseModal from './EditCourseModal';

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const allCourses = await getCourses();
  const departments = await getDepartments();
  const semesters = await getSemesters();
  const sections = await getSections();

  const params = await searchParams;
  const deptFilter = params.departmentId as string;

  const courses = allCourses.filter(course => {
    if (deptFilter && course.departmentId !== parseInt(deptFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Academic Setup
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage university courses and credit allocations.</p>
        </div>
        
        <AddCourseForm departments={departments} />
      </header>

      <CourseFilters departments={departments} />

      <SemesterManager semesters={semesters} sections={sections} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Course Code</th>
                <th className="px-6 py-4 font-semibold">Course Name</th>
                <th className="px-6 py-4 font-semibold">Credits</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {course.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {course.credits}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {course.departmentName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditCourseModal course={course} departments={departments} />
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
