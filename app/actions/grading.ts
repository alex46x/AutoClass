'use server';

import { db } from '@/lib/db';
import { exams, grades, users, enrollments, courses, schedules } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireTeacher() {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') throw new Error('Unauthorized');
  return session;
}

// Get all unique courses assigned to this teacher
export async function getTeacherCoursesForGrading() {
  const session = await requireTeacher();

  // Find all distinct courses from schedules where teacherId = session.id
  const teacherSchedules = await db
    .select({ courseId: schedules.courseId })
    .from(schedules)
    .where(eq(schedules.teacherId, session.id));

  const courseIds = [...new Set(teacherSchedules.map(s => s.courseId))];

  if (courseIds.length === 0) return [];

  return await db
    .select()
    .from(courses)
    .where(sql`${courses.id} IN ${courseIds}`);
}

// Get all exams for a specific course
export async function getExamsForCourse(courseId: number) {
  await requireTeacher();
  return await db.select().from(exams).where(eq(exams.courseId, courseId)).orderBy(exams.createdAt);
}

// Create a new exam
export async function createExam(courseId: number, type: string, title: string, maxMarks: number) {
  await requireTeacher();
  await db.insert(exams).values({
    courseId,
    type,
    title,
    maxMarks
  });
  revalidatePath(`/teacher/grading/${courseId}`);
}

// Get enrolled students and their grades for a specific exam
export async function getGradesForExam(courseId: number, examId: number) {
  await requireTeacher();
  
  // 1. Get all students enrolled in this course
  const enrolledStudents = await db
    .select({
      id: users.id,
      name: users.name,
      studentId: users.studentId,
      roll: users.roll
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(enrollments.courseId, courseId));

  // 2. Get all existing grades for this exam
  const existingGrades = await db
    .select()
    .from(grades)
    .where(eq(grades.examId, examId));

  // 3. Map grades to students
  return enrolledStudents.map(student => {
    const gradeRecord = existingGrades.find(g => g.studentId === student.id);
    return {
      ...student,
      marksObtained: gradeRecord ? gradeRecord.marksObtained : null
    };
  }).sort((a, b) => Number(a.roll) - Number(b.roll));
}

// Bulk save grades
export async function saveGrades(examId: number, updates: { studentId: number, marksObtained: number }[]) {
  await requireTeacher();
  
  // We can just upsert or delete/insert. Since SQLite in drizzle doesn't natively support bulk upsert easily, 
  // we can do it in a transaction or loop. 
  // For simplicity, we delete all existing grades for these students in this exam and insert fresh.
  
  const studentIds = updates.map(u => u.studentId);
  if (studentIds.length > 0) {
    await db.delete(grades).where(
      and(
        eq(grades.examId, examId),
        sql`${grades.studentId} IN ${studentIds}`
      )
    );

    await db.insert(grades).values(
      updates.map(u => ({
        examId,
        studentId: u.studentId,
        marksObtained: u.marksObtained
      }))
    );
  }

  // Find the course ID to revalidate
  const exam = await db.select().from(exams).where(eq(exams.id, examId)).get();
  if (exam) {
    revalidatePath(`/teacher/grading/${exam.courseId}`);
  }
}
