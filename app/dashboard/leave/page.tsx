import { getMyLeaveRequests } from '@/app/actions/leave';
import { CalendarOff, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import SubmitLeaveForm from './SubmitLeaveForm';

const statusConfig = {
  PENDING: { label: 'Pending Review', icon: Clock, color: 'amber' },
  APPROVED: { label: 'Approved', icon: CheckCircle2, color: 'emerald' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'rose' },
};

export default async function LeavePage() {
  const requests = await getMyLeaveRequests();

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarOff className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Leave Requests
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Apply for leave and track your application status.</p>
      </header>

      {/* Leave Application Form */}
      <SubmitLeaveForm />

      {/* Leave History */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-slate-400" />
          My Applications ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-sm">
            <CalendarOff className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">You have no leave applications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const cfg = statusConfig[req.status as keyof typeof statusConfig] || statusConfig.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-start gap-5">
                  
                  {/* Date Range */}
                  <div className="shrink-0 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 text-center min-w-[120px]">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">From</p>
                    <p className="font-mono font-black text-slate-900 dark:text-white text-sm">{req.startDate}</p>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-2 mb-1">To</p>
                    <p className="font-mono font-black text-slate-900 dark:text-white text-sm">{req.endDate}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{req.reason}</p>
                    {req.adminNote && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
                        Admin note: {req.adminNote}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                      ${cfg.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : ''}
                      ${cfg.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : ''}
                      ${cfg.color === 'rose' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : ''}
                    `}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
