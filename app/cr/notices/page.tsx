import { getCRFormData } from '@/app/actions/cr';
import { Bell } from 'lucide-react';

import NoticeForm from './NoticeForm';

export default async function NoticesPage() {


  const { courses } = await getCRFormData();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Send Notice
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast an announcement to your batch.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <NoticeForm courses={courses} />
        </div>
    </div>
  );
}
