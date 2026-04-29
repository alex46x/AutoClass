import { getStudentTranscript } from '@/app/actions/transcript';
import { BookOpen, GraduationCap, Award, ChevronRight } from 'lucide-react';

export default async function TranscriptPage() {
  const transcript = await getStudentTranscript();

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Academic Transcript
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View your grades and academic performance across all enrolled courses.</p>
      </header>

      {transcript.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Courses Found</h3>
          <p className="text-slate-500 mt-1">You are not currently enrolled in any courses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {transcript.map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              
              {/* Course Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {course.code}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{course.credits} Credits</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{course.name}</h2>
                </div>

                {course.totalMaxMarks > 0 ? (
                  <div className="flex items-center gap-6 md:min-w-[300px]">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Total Progress</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{course.percentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                          style={{ width: `${course.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{course.letterGrade}</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium border border-slate-200 dark:border-slate-700">
                    No grades published yet
                  </div>
                )}
              </div>

              {/* Grades Breakdown */}
              {course.grades.length > 0 && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Assessments Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {course.grades.map((grade, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {grade.examType}
                          </span>
                        </div>
                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1" title={grade.examTitle}>
                          {grade.examTitle}
                        </h5>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{grade.marksObtained}</span>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ {grade.maxMarks}</span>
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
