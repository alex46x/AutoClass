import { getCRFormData, requestMakeupClass } from '@/app/actions/cr';
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';

import MakeupClassForm from './MakeupClassForm';

export default async function MakeupClassPage() {


  const { courses, classrooms, teachers } = await getCRFormData();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Request Makeup Class
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Schedule an extra class or lab session.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <MakeupClassForm courses={courses} classrooms={classrooms} teachers={teachers} />
        </div>
    </div>
  );
}
