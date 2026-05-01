import { getClassrooms, getDepartments } from '@/app/actions/admin';
import { MapPin, Users, Monitor, Beaker, Building2 } from 'lucide-react';
import AddClassroomForm from './AddClassroomForm';
import AddDepartmentForm from './AddDepartmentForm';
import EditDepartmentModal from './EditDepartmentModal';

export default async function AdminInfrastructurePage() {
  const classrooms = await getClassrooms();
  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Infrastructure & Facilities
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage university classrooms, labs, and capacities.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <AddDepartmentForm />
          <AddClassroomForm />
        </div>
      </header>

      {/* Departments Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-indigo-500" /> Departments
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group relative">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white flex flex-col">
                  {dept.name}
                  <span className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mt-1">{dept.code}</span>
                </h4>
                <EditDepartmentModal department={dept} />
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
              No departments configured yet.
            </div>
          )}
        </div>
      </section>

      {/* Classrooms Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-amber-500" /> Classrooms & Labs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classrooms.map(room => (
          <div key={room.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-colors group relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
               <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-amber-500" />
                 {room.name}
               </h4>
               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                 {room.isLab ? 'Lab' : 'Lecture'}
               </span>
             </div>

             <div className="space-y-3">
               <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                 <Users className="w-4 h-4 text-slate-400" /> 
                 Capacity: <span className="font-semibold text-slate-900 dark:text-white">{room.capacity} seats</span>
               </p>
               <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                 <Monitor className="w-4 h-4 text-slate-400" /> 
                 Projector: <span className="font-semibold text-slate-900 dark:text-white">{room.hasProjector ? 'Available' : 'None'}</span>
               </p>
               {room.isLab && (
                 <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                   <Beaker className="w-4 h-4 text-slate-400" /> 
                   Lab Equipment: <span className="font-semibold text-slate-900 dark:text-white">Yes</span>
                 </p>
               )}
             </div>
          </div>
        ))}
        {classrooms.length === 0 && (
          <div className="col-span-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
            No classrooms found in the system.
          </div>
        )}
        </div>
      </section>
    </div>
  );
}
