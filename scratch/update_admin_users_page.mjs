import fs from 'fs';

const path = 'app/admin/users/page.tsx';
const content = `import { getUsers, getDepartments, getSemesters, getSections } from '@/app/actions/admin';
import { Users as UsersIcon, Mail } from 'lucide-react';
import DeleteUserButton from './DeleteUserButton';
import AddUserForm from './AddUserForm';
import RoleUpdateButton from './RoleUpdateButton';
import UserFilters from './UserFilters';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const allUsers = await getUsers();
  const departments = await getDepartments();
  const semesters = await getSemesters();
  const sections = await getSections();
  
  const params = await searchParams;
  const roleFilter = params.role as string;
  const deptFilter = params.departmentId as string;
  const semesterFilter = params.semesterId as string;
  const sectionFilter = params.sectionId as string;

  const filteredUsers = allUsers.filter(user => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (deptFilter && user.departmentId !== parseInt(deptFilter)) return false;
    if (semesterFilter && user.semesterId !== parseInt(semesterFilter)) return false;
    if (sectionFilter && user.sectionId !== parseInt(sectionFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage students, teachers, and system administrators.</p>
        </div>
        
        <AddUserForm departments={departments} semesters={semesters} sections={sections} />
      </header>

      <UserFilters departments={departments} semesters={semesters} sections={sections} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department & Class</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider \${
                      user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      user.role === 'TEACHER' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      user.role === 'CR' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }\`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.departmentName && <span className="text-slate-700 dark:text-slate-300 font-medium">{user.departmentName}</span>}
                      {user.semesterName && <span className="text-xs text-slate-500 dark:text-slate-400">{user.semesterName} {user.sectionName ? \`(\${user.sectionName})\` : ''}</span>}
                      {!user.departmentName && !user.semesterName && <span className="text-slate-400 italic">Not Assigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'ADMIN' && (
                        <>
                          <RoleUpdateButton id={user.id} currentRole={user.role} />
                          <DeleteUserButton id={user.id} name={user.name} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found matching the filters.
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
`;

fs.writeFileSync(path, content);
console.log('users page.tsx updated');
