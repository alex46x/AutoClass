'use server';

import { db } from '@/lib/db';
import { exams, grades, enrollments, courses } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function getStudentTranscript() {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') throw new Error('Unauthorized');

  // 1. Get enrolled courses
  const enrolledCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      code: courses.code,
      credits: courses.credits,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.id));

  // 2. Get all grades for this student
  const studentGrades = await db
    .select({
      courseId: exams.courseId,
      examType: exams.type,
      examTitle: exams.title,
      maxMarks: exams.maxMarks,
      marksObtained: grades.marksObtained,
    })
    .from(grades)
    .innerJoin(exams, eq(grades.examId, exams.id))
    .where(eq(grades.studentId, session.id));

  // 3. Map grades to courses and calculate totals
  return enrolledCourses.map(course => {
    const courseGrades = studentGrades.filter(g => g.courseId === course.id);
    
    let totalMaxMarks = 0;
    let totalMarksObtained = 0;

    courseGrades.forEach(g => {
      totalMaxMarks += g.maxMarks;
      totalMarksObtained += g.marksObtained;
    });

    const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    
    // Simple Letter Grade mapping
    let letterGrade = 'N/A';
    if (totalMaxMarks > 0) {
      if (percentage >= 80) letterGrade = 'A+';
      else if (percentage >= 75) letterGrade = 'A';
      else if (percentage >= 70) letterGrade = 'A-';
      else if (percentage >= 65) letterGrade = 'B+';
      else if (percentage >= 60) letterGrade = 'B';
      else if (percentage >= 50) letterGrade = 'C';
      else letterGrade = 'F';
    }

    return {
      ...course,
      grades: courseGrades,
      totalMaxMarks,
      totalMarksObtained,
      percentage: Math.round(percentage * 10) / 10,
      letterGrade
    };
  });
}
