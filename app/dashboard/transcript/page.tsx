import { getStudentTranscript } from '@/app/actions/transcript';
import { BookOpen, GraduationCap, Award, Star, BookCheck, Activity } from 'lucide-react';

export default async function TranscriptPage() {
  const data = await getStudentTranscript();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Academic Transcript
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Official summary of your academic performance and credits.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden">
          <Star className="absolute -right-2 -bottom-2 w-20 h-20 text-white/10" />
          <p className="text-xs font-black uppercase tracking-widest text-indigo-100/80 mb-1">Current CGPA</p>
          <p className="text-4xl font-black">{data.overall.cgpa}</p>
          <div className="mt-3 flex items-center gap-2">
             <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${(Number(data.overall.cgpa) / 4) * 100}%` }} />
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Credits Earned</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{data.overall.totalCreditsEarned}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Out of {data.overall.totalCreditsAttempted} attempted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Courses</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{data.overall.courseCount}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Active enrollments</p>
        </div>
      </div>

      {data.courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Academic Records</h3>
          <p className="text-slate-500 mt-1">Enroll in courses and complete assessments to see your transcript.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                      {course.code}
                    </span>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{course.credits} Credits</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{course.name}</h2>
                </div>

                <div className="flex items-center gap-8">
                  {course.totalMaxMarks > 0 ? (
                    <>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course GPA</p>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{course.gradePoint.toFixed(2)}</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center justify-center shrink-0">
                         <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{course.letterGrade}</span>
                         <span className="text-[9px] font-black uppercase text-indigo-400 dark:text-indigo-500">Grade</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase italic">In Progress</span>
                  )}
                </div>
              </div>

              {course.grades.length > 0 && (
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {course.grades.map((grade: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{grade.examType}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-3 truncate">{grade.examTitle}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{grade.marksObtained}</span>
                          <span className="text-xs font-bold text-slate-400">/ {grade.maxMarks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
