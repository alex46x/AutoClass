import { getExamsForCourse, getGradesForExam } from '@/app/actions/grading';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import CreateExamForm from './CreateExamForm';
import GradingSheet from './GradingSheet';

export default async function CourseGradingPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.courseId);
  
  if (isNaN(courseId)) redirect('/teacher/grading');

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course) redirect('/teacher/grading');

  const exams = await getExamsForCourse(courseId);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <Link href="/teacher/grading" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {course.name}
              <span className="text-sm font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-lg ml-2">{course.code}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage assessments and student grades for this course.</p>
          </div>
          <CreateExamForm courseId={courseId} />
        </div>
      </header>

      {exams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Assessments Created</h3>
          <p className="text-slate-500 mt-1 mb-6">Create a Midterm, Final, or Assignment to start grading students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {exams.map(async (exam) => {
            const studentsWithGrades = await getGradesForExam(courseId, exam.id);
            return (
              <GradingSheet 
                key={exam.id} 
                exam={exam} 
                students={studentsWithGrades} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
