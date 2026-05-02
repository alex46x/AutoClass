import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAdminSections, getDepartments, getSemesters, getStudentsByDepartment } from '@/app/actions/admin';
import { BookOpen, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import AddAdminSectionModal from './AddAdminSectionModal';
import EditAdminSectionModal from './EditAdminSectionModal';
import RemoveAdminSectionButton from './RemoveAdminSectionButton';
import AdminShiftStudentModal from './AdminShiftStudentModal';

export default async function AdminSectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string; department?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/admin');

  const { semester, department } = await searchParams;

  // Resolve departments first so we know the default
  const departments = await getDepartments();
  const selectedDepartmentId = department ? parseInt(department) : departments[0]?.id;

  // Now fetch semesters scoped to selected department
  const semesters = await getSemesters(selectedDepartmentId);
  const selectedSemesterId = semester ? parseInt(semester) : semesters[0]?.id;

  const [currentSections, allDeptSections, students] = selectedDepartmentId
    ? await Promise.all([
        getAdminSections(selectedSemesterId, selectedDepartmentId),
        getAdminSections(undefined, selectedDepartmentId), // All sections for this dept
        getStudentsByDepartment(selectedDepartmentId),
      ])
    : [[], [], []];

  const unassignedStudents = students.filter(s => s.sectionId === null);
  const sectionsWithStudents = currentSections.map(sec => ({
    ...sec,
    students: students.filter(s => s.sectionId === sec.id),
  }));


  const selectedDept = departments.find(d => d.id === selectedDepartmentId);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Sections Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage sections and student assignments per department.
          </p>
        </div>
        {selectedSemesterId && selectedDepartmentId && (
          <AddAdminSectionModal semesterId={selectedSemesterId} departmentId={selectedDepartmentId} />
        )}
      </header>

      {/* Department Selector */}
      <section>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2">Department</p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex gap-2 overflow-x-auto shadow-sm">
          {departments.map(dept => (
            <Link
              key={dept.id}
              href={`/admin/sections?department=${dept.id}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                selectedDepartmentId === dept.id
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {dept.name}
            </Link>
          ))}
          {departments.length === 0 && <div className="px-4 py-2 text-sm text-slate-500 italic">No departments found.</div>}
        </div>
      </section>

      {/* Semester Selector — scoped to selected department */}
      <section>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2">Semester</p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex gap-2 overflow-x-auto shadow-sm">
          {semesters.length > 0 ? semesters.map(sem => (
            <Link
              key={sem.id}
              href={`/admin/sections?department=${selectedDepartmentId}&semester=${sem.id}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                selectedSemesterId === sem.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {sem.name}
            </Link>
          )) : (
            <div className="px-4 py-2 text-sm text-slate-500 italic">
              No semesters for this department. Create them in{' '}
              <Link href={`/admin/courses?departmentId=${selectedDepartmentId}`} className="text-indigo-500 underline">
                Academic Setup
              </Link>.
            </div>
          )}
        </div>
      </section>

      {/* Sections + Students */}
      {selectedDepartmentId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sections */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Sections — <span className="text-indigo-600 dark:text-indigo-400">{selectedDept?.name}</span>
            </h2>

            {!selectedSemesterId ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <p className="text-slate-500">Select or create a semester first.</p>
              </div>
            ) : sectionsWithStudents.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Sections Found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  No sections for this department and semester. Click &quot;Add Section&quot; above.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sectionsWithStudents.map(section => (
                  <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {section.name}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            section.students.length >= section.maxStudents
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          }`}>
                            {section.students.length}/{section.maxStudents}
                          </span>
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Users className="w-4 h-4" /> Enrolled Students
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <EditAdminSectionModal sectionId={section.id} currentName={section.name} currentMaxStudents={section.maxStudents} />
                        <RemoveAdminSectionButton sectionId={section.id} sectionName={section.name} studentCount={section.students.length} />
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {section.students.length === 0 ? (
                        <div className="px-6 py-8 text-center text-slate-500 text-sm italic">No students assigned to this section.</div>
                      ) : (
                        section.students.map(student => (
                          <div key={student.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{student.name}</span>
                              <span className="text-xs text-slate-500 truncate">{student.studentId || student.email}</span>
                            </div>
                            <AdminShiftStudentModal
                              studentId={student.id}
                              studentName={student.name}
                              currentSectionId={section.id}
                              sections={allDeptSections}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unassigned Students */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Unassigned Students
            </h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 border-b border-amber-200/50 dark:border-amber-800/30">
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                  {unassignedStudents.length} student{unassignedStudents.length !== 1 && 's'} without section
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                {unassignedStudents.length === 0 ? (
                  <div className="px-6 py-12 text-center text-slate-500 text-sm italic">All students assigned.</div>
                ) : (
                  unassignedStudents.map(student => (
                    <div key={student.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{student.name}</span>
                        <span className="text-xs text-slate-500 truncate">{student.studentId || student.email}</span>
                      </div>
                      <AdminShiftStudentModal
                        studentId={student.id}
                        studentName={student.name}
                        currentSectionId={null}
                        sections={allDeptSections}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
