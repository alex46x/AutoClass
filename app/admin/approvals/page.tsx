import { getPendingMakeupClasses } from '@/app/actions/admin';
import { CheckSquare, Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import ApprovalButtons from './ApprovalButtons';

export default async function AdminApprovalsPage() {
  const pendingRequests = await getPendingMakeupClasses();

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-amber-500" />
          Pending Approvals
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve makeup class requests from Class Representatives.</p>
      </header>

      {pendingRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-slate-500 mt-1">There are no pending makeup class requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingRequests.map(request => (
            <div key={request.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-bl-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> PENDING
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pr-24">
                {request.courseName}
              </h3>

              <div className="space-y-3 mb-6">
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <User className="w-4 h-4 text-slate-400" /> 
                  <span className="font-medium text-slate-900 dark:text-white">{request.teacherName}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" /> 
                  <span className="font-medium text-slate-900 dark:text-white">{request.date}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" /> 
                  <span className="font-medium text-slate-900 dark:text-white">{request.startTime} - {request.endTime}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" /> 
                  <span className="font-medium text-slate-900 dark:text-white">{request.classroomName}</span>
                </p>
              </div>

              <ApprovalButtons requestId={request.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
