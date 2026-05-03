import {
  getDepartmentFaculty,
  getDepartmentSections,
  getDepartmentStudents,
  getPendingRemovalsForDept,
  getSemestersForHead,
} from '@/app/actions/head';
import { ShieldCheck, Users, GraduationCap, UserX, Filter } from 'lucide-react';
import Link from 'next/link';
import DesignationSelect from './DesignationSelect';
import SendMessageModal from './SendMessageModal';
import BroadcastModal from './BroadcastModal';
import RemoveStudentModal from './RemoveStudentModal';
import CRRoleButton from './CRRoleButton';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

type FacultySearchParams = {
  semester?: string;
  section?: string;
};

function getPositiveNumber(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function FacultyManagementPage({
  searchParams,
}: {
  searchParams?: Promise<FacultySearchParams>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HEAD') redirect('/teacher');

  const params = await searchParams;
  const selectedSemesterId = getPositiveNumber(params?.semester);
  const selectedSectionId = getPositiveNumber(params?.section);

  const [faculty, semesters, sections, students, pendingRemovals] = await Promise.all([
    getDepartmentFaculty(),
    getSemestersForHead(),
    getDepartmentSections(selectedSemesterId),
    getDepartmentStudents({ semesterId: selectedSemesterId, sectionId: selectedSectionId }),
    getPendingRemovalsForDept(),
  ]);

  const pendingStudentIds = new Set(pendingRemovals.map((r: any) => r.studentId));
  const hasStudentFilters = Boolean(selectedSemesterId || selectedSectionId);

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
            Department Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage faculty designations, communications, and students in your department.</p>
        </div>
        <BroadcastModal />
      </header>

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-indigo-500" /> Faculty Members ({faculty.length})
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Designation</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {faculty.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{teacher.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        teacher.role === 'HEAD'
                          ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {teacher.role === 'HEAD' ? 'Dept. Head' : 'Teacher'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DesignationSelect teacherId={teacher.id} currentDesignation={teacher.designation ?? 'Lecturer'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <SendMessageModal teacherId={teacher.id} teacherName={teacher.name} />
                    </td>
                  </tr>
                ))}
                {faculty.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No faculty members found in your department.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-500" /> Department Students ({students.length})
          </h2>
          {hasStudentFilters && (
            <Link href="/teacher/faculty" className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:text-fuchsia-300">
              Clear filters
            </Link>
          )}
        </div>

        <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <form action="/teacher/faculty" className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 md:items-end">
            <div>
              <label htmlFor="semester" className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                defaultValue={selectedSemesterId ?? ''}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              >
                <option value="">All semesters</option>
                {semesters.map(semester => (
                  <option key={semester.id} value={semester.id}>{semester.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="section" className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Section
              </label>
              <select
                id="section"
                name="section"
                defaultValue={selectedSectionId ?? ''}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              >
                <option value="">All sections</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {selectedSemesterId ? section.name : `${section.semesterName} - ${section.name}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-black text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Semester</th>
                  <th className="px-6 py-4 font-semibold">Section</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map(student => {
                  const hasPendingRemoval = pendingStudentIds.has(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.email}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{student.studentId || '-'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.semesterName || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.sectionName || 'Unassigned'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          student.role === 'CR'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {student.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="mb-2 flex justify-end">
                          <CRRoleButton studentId={student.id} studentName={student.name} currentRole={student.role} />
                        </div>
                        {hasPendingRemoval ? (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                            Removal Pending
                          </span>
                        ) : (
                          <RemoveStudentModal studentId={student.id} studentName={student.name} />
                        )}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">No students found for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {pendingRemovals.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <UserX className="w-5 h-5 text-rose-500" /> Pending Removal Requests ({pendingRemovals.length})
          </h2>
          <div className="space-y-3">
            {pendingRemovals.map((req: any) => (
              <div key={req.id} className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    <UserX className="w-4 h-4 text-rose-500 inline mr-1" />
                    {req.studentName}
                    <span className="font-mono text-xs text-slate-500 ml-2">{req.studentEmail}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Reason: {req.reason}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Requested by: {req.requestedByName}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  Awaiting Admin Approval
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
