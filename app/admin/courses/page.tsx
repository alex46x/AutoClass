import { getCourses, getDepartments, getSemesters, getSections, initializeUniversityStructure } from '@/app/actions/admin';
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
  const params = await searchParams;
  const deptFilter = params.departmentId as string | undefined;

  const departments = await getDepartments();
  // Only resolve a department when explicitly filtered — don't auto-select
  const selectedDeptId = deptFilter ? parseInt(deptFilter) : undefined;

  const [allCourses, semesters, sections] = await Promise.all([
    getCourses(),
    getSemesters(selectedDeptId),
    getSections(selectedDeptId),
  ]);

  const courses = allCourses.filter(course => {
    if (selectedDeptId && course.departmentId !== selectedDeptId) return false;
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
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage courses, semesters and sections per department.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <form action={initializeUniversityStructure}>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-semibold text-sm shadow-sm transition-colors"
            >
              Initialize University Structure
            </button>
          </form>
          <AddCourseForm departments={departments} />
        </div>
      </header>

      <CourseFilters departments={departments} />

      {selectedDeptId ? (
        <>
          <SemesterManager semesters={semesters} sections={sections} departmentId={selectedDeptId} />

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
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{course.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {course.credits}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{course.departmentName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-right">
                        <EditCourseModal course={course} departments={departments} />
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No courses found for this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-inner">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Department Selection Required</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Please select a department from the filter above to manage its academic structure, courses, and sections.
          </p>
        </div>
      )}
    </div>
  );
}
