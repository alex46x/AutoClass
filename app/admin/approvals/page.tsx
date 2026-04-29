import { getPendingMakeupClasses, getPendingUsers } from '@/app/actions/admin';
import { getPendingLeaveRequests } from '@/app/actions/leave';
import { CheckSquare, Calendar, Clock, MapPin, User, AlertCircle, ShieldAlert, GraduationCap, CalendarOff } from 'lucide-react';
import ApprovalButtons from './ApprovalButtons';
import UserApprovalButtons from './UserApprovalButtons';
import LeaveApprovalButtons from './LeaveApprovalButtons';

export default async function AdminApprovalsPage() {
  const pendingRequests = await getPendingMakeupClasses();
  const pendingUsers = await getPendingUsers();
  const pendingLeave = await getPendingLeaveRequests();

  const totalPending = pendingRequests.length + pendingUsers.length + pendingLeave.length;

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-amber-500" />
          Pending Approvals
          {totalPending > 0 && (
            <span className="ml-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalPending}
            </span>
          )}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve makeup class requests and new user registrations.</p>
      </header>

      {totalPending === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-slate-500 mt-1">There are no pending requests or registrations at the moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* USER REGISTRATION APPROVALS */}
          {pendingUsers.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                Account Registrations ({pendingUsers.length})
              </h2>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Student Name</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold">Academic Profile</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pendingUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {user.studentId ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md w-fit">ID: {user.studentId}</span>
                                <span className="text-xs">Sem: {user.semester} • Sec: {user.section} • Roll: {user.roll}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No academic data</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end">
                              <UserApprovalButtons userId={user.id} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* LEAVE APPLICATIONS */}
          {pendingLeave.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <CalendarOff className="w-5 h-5 text-rose-500" />
                Student Leave Applications ({pendingLeave.length})
              </h2>
              <div className="space-y-4">
                {pendingLeave.map(req => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-start gap-5">
                    <div className="shrink-0 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 text-center min-w-[120px]">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">From</p>
                      <p className="font-mono font-black text-slate-900 dark:text-white text-sm">{req.startDate}</p>
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mt-2 mb-1">To</p>
                      <p className="font-mono font-black text-slate-900 dark:text-white text-sm">{req.endDate}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        {req.studentName}
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{req.studentId || req.studentEmail}</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{req.reason}</p>
                      <LeaveApprovalButtons requestId={req.id} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MAKEUP CLASS APPROVALS */}
          {pendingRequests.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Makeup Class Requests ({pendingRequests.length})
              </h2>
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
            </section>
          )}

        </div>
      )}
    </div>
  );
}
