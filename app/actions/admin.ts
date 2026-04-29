'use server';

import { db } from '@/lib/db';
import { users, departments, classrooms, courses, makeupClasses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function getUsers() {
  await requireAdmin();
  return await db.select().from(users).orderBy(users.name);
}

export async function createUser(data: { name: string; email: string; role: string }) {
  await requireAdmin();
  
  // Hash a default password: "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    departmentId: 1 // Default to department 1 for now
  });
  
  revalidatePath('/admin/users');
}

export async function deleteUser(id: number) {
  await requireAdmin();
  await db.delete(users).where(eq(users.id, id));
  revalidatePath('/admin/users');
}

// Infrastructure
export async function getDepartments() {
  await requireAdmin();
  return await db.select().from(departments).orderBy(departments.name);
}

export async function createDepartment(data: { name: string; code: string }) {
  await requireAdmin();
  await db.insert(departments).values(data);
  revalidatePath('/admin/infrastructure');
}

export async function getClassrooms() {
  await requireAdmin();
  return await db.select().from(classrooms).orderBy(classrooms.name);
}

export async function createClassroom(data: { name: string; capacity: number; hasProjector: boolean; isLab: boolean }) {
  await requireAdmin();
  await db.insert(classrooms).values(data);
  revalidatePath('/admin/infrastructure');
}

// Courses
export async function getCourses() {
  await requireAdmin();
  return await db.select({
    id: courses.id,
    name: courses.name,
    code: courses.code,
    credits: courses.credits,
    departmentName: departments.name
  }).from(courses).leftJoin(departments, eq(courses.departmentId, departments.id)).orderBy(courses.name);
}

export async function createCourse(data: { name: string; code: string; credits: number; departmentId: number }) {
  await requireAdmin();
  await db.insert(courses).values(data);
  revalidatePath('/admin/courses');
}

// Approvals
export async function getPendingMakeupClasses() {
  await requireAdmin();
  return await db.select({
    id: makeupClasses.id,
    date: makeupClasses.date,
    startTime: makeupClasses.startTime,
    endTime: makeupClasses.endTime,
    status: makeupClasses.status,
    courseName: courses.name,
    teacherName: users.name,
    classroomName: classrooms.name
  })
  .from(makeupClasses)
  .leftJoin(courses, eq(makeupClasses.courseId, courses.id))
  .leftJoin(users, eq(makeupClasses.teacherId, users.id))
  .leftJoin(classrooms, eq(makeupClasses.classroomId, classrooms.id))
  .where(eq(makeupClasses.status, 'PENDING'));
}

export async function updateMakeupStatus(id: number, status: 'APPROVED' | 'REJECTED') {
  await requireAdmin();
  await db.update(makeupClasses).set({ status }).where(eq(makeupClasses.id, id));
  
  if (status === 'APPROVED') {
    // Ideally we would insert this into the `schedules` table, but for now we just approve it.
    // The attendance system will allow teachers to take attendance for it.
  }
  
  revalidatePath('/admin/approvals');
}
