'use client';

import { useState, useEffect } from 'react';
import { getStudentsForAttendance, saveAttendance } from '@/app/actions/attendance';
import { Clock, Users, ChevronDown, ChevronUp, Save, CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import CourseMaterialsModal from './CourseMaterialsModal';

type SessionType = 'REGULAR' | 'MAKEUP';
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

interface Session {
  id: number;
  type: string;
  courseId: number;
  courseName: string;
  courseCode: string;
  classroomName: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface Student {
  id: number;
  name: string;
  studentId: string | null;
  roll: string | null;
  status: AttendanceStatus;
  marked: boolean;
}

const statusConfig = {
  PRESENT: { label: 'Present', color: 'emerald', icon: CheckCircle2 },
  ABSENT: { label: 'Absent', color: 'rose', icon: XCircle },
  LATE: { label: 'Late', color: 'amber', icon: AlertCircle },
};

export default function SessionCard({ session, date }: { session: Session; date: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  const loadStudents = async () => {
    if (students.length > 0) return;
    setLoading(true);
    try {
      const data = await getStudentsForAttendance(
        session.courseId,
        session.id,
        session.type as SessionType,
        date
      );
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isExpanded) await loadStudents();
    setIsExpanded(prev => !prev);
  };

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    setIsDirty(true);
    setSaved(false);
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    setIsDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAttendance(
        session.courseId,
        session.id,
        session.type as SessionType,
        date,
        students.map(s => ({ studentId: s.id, status: s.status }))
      );
      setSaved(true);
      setIsDirty(false);
      setStudents(prev => prev.map(s => ({ ...s, marked: true })));
    } catch (e) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const lateCount = students.filter(s => s.status === 'LATE').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Session Header */}
      <button
        onClick={handleToggle}
        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            session.type === 'MAKEUP'
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
              : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-slate-900 dark:text-white">{session.courseName}</span>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase">
                {session.courseCode}
              </span>
              {session.type === 'MAKEUP' && (
                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded uppercase">
                  Makeup
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {session.startTime} – {session.endTime} &nbsp;·&nbsp; {session.classroomName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {students.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">{presentCount}P</span>
              <span className="text-rose-500">{absentCount}A</span>
              {lateCount > 0 && <span className="text-amber-500">{lateCount}L</span>}
            </div>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Course Materials Modal */}
      {showMaterials && (
        <CourseMaterialsModal 
          courseId={session.courseId}
          courseName={session.courseName}
          onClose={() => setShowMaterials(false)}
        />
      )}

      {/* Actions Bar (Inside card but always visible or only visible when expanded? Let's make it visible when expanded) */}
      {isExpanded && (
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMaterials(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Manage Materials
          </button>
        </div>
      )}

      {/* Expanded Attendance Sheet */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No students enrolled in this course.</div>
          ) : (
            <>
              {/* Bulk actions bar */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mark all:</span>
                  <button onClick={() => markAll('PRESENT')} className="px-3 py-1 text-xs font-bold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors">✓ Present</button>
                  <button onClick={() => markAll('ABSENT')} className="px-3 py-1 text-xs font-bold bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg transition-colors">✗ Absent</button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 ${
                    saved
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Attendance'}
                </button>
              </div>

              {/* Student rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map(student => {
                  const cfg = statusConfig[student.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={student.id} className="px-6 py-3 flex items-center gap-4">
                      <span className="w-8 text-center font-mono text-xs font-bold text-slate-400">{student.roll || '—'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{student.name}</p>
                        <p className="font-mono text-xs text-slate-400">{student.studentId || ''}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {(['PRESENT', 'ABSENT', 'LATE'] as AttendanceStatus[]).map(s => {
                          const c = statusConfig[s];
                          const isActive = student.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(student.id, s)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                isActive
                                  ? c.color === 'emerald' ? 'bg-emerald-500 text-white shadow-sm' :
                                    c.color === 'rose' ? 'bg-rose-500 text-white shadow-sm' :
                                    'bg-amber-500 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
