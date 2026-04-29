'use server';

import { db } from '@/lib/db';
import { users, departments, classrooms, courses, makeupClasses, enrollments, notifications, semesters, sections, studentRemovalRequests } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { notifyEnrolledStudents, sendNotification } from './notifications';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function getUsers() {
  await requireAdmin();
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    departmentId: users.departmentId,
    semesterId: users.semesterId,
    sectionId: users.sectionId,
    accountStatus: users.accountStatus,
    createdAt: users.createdAt,
    departmentName: departments.name,
    semesterName: semesters.name,
    sectionName: sections.name,
  })
  .from(users)
  .leftJoin(departments, eq(users.departmentId, departments.id))
  .leftJoin(semesters, eq(users.semesterId, semesters.id))
  .leftJoin(sections, eq(users.sectionId, sections.id))
  .orderBy(users.name);
}

export async function createUser(data: { name: string; email: string; role: string; departmentId?: number; semesterId?: number; sectionId?: number }) {
  await requireAdmin();
  
  if (data.role === 'CR' && data.sectionId) {
    const existingCRs = await db.select().from(users).where(and(eq(users.role, 'CR'), eq(users.sectionId, data.sectionId)));
    if (existingCRs.length >= 2) {
      throw new Error("Maximum 2 CRs allowed per class section");
    }
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    departmentId: data.departmentId || null,
    semesterId: data.semesterId || null,
    sectionId: data.sectionId || null,
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

  // Fetch makeup class details before updating
  const makeup = await db.select({
    courseId: makeupClasses.courseId,
    date: makeupClasses.date,
    startTime: makeupClasses.startTime,
    endTime: makeupClasses.endTime,
    courseName: courses.name,
    classroomName: classrooms.name,
  })
    .from(makeupClasses)
    .leftJoin(courses, eq(makeupClasses.courseId, courses.id))
    .leftJoin(classrooms, eq(makeupClasses.classroomId, classrooms.id))
    .where(eq(makeupClasses.id, id))
    .get();

  await db.update(makeupClasses).set({ status }).where(eq(makeupClasses.id, id));

  if (status === 'APPROVED' && makeup) {
    // Auto-notify all enrolled students
    await notifyEnrolledStudents(
      makeup.courseId,
      '📅 Makeup Class Scheduled',
      `A makeup class for ${makeup.courseName} has been approved and scheduled on ${makeup.date} from ${makeup.startTime} to ${makeup.endTime} at ${makeup.classroomName}.`
    );
  }

  revalidatePath('/admin/approvals');
}

// User Approvals
export async function getPendingUsers() {
  await requireAdmin();
  return await db.select().from(users).where(eq(users.accountStatus, 'PENDING')).orderBy(users.createdAt);
}

export async function updateUserStatus(id: number, status: 'ACTIVE' | 'REJECTED') {
  await requireAdmin();

  // Fetch user before updating
  const user = await db.select().from(users).where(eq(users.id, id)).get();

  await db.update(users).set({ accountStatus: status }).where(eq(users.id, id));

  // Send notification to the user themselves
  if (user) {
    if (status === 'ACTIVE') {
      await sendNotification(
        id,
        '✅ Account Approved',
        `Welcome to CampusFlow, ${user.name}! Your account has been approved. You can now log in and access the university portal.`
      );
    } else {
      await sendNotification(
        id,
        '❌ Account Registration Rejected',
        `Your account registration request was reviewed and unfortunately rejected. Please contact your Class Representative or Admin for assistance.`
      );
    }
  }

  revalidatePath('/admin/approvals');
  revalidatePath('/admin/users');
}

export async function updateUserRole(id: number, role: 'STUDENT' | 'TEACHER' | 'CR' | 'ADMIN') {
  await requireAdmin();

  if (role === 'CR') {
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    if (user && user.sectionId) {
      const existingCRs = await db.select().from(users).where(and(eq(users.role, 'CR'), eq(users.sectionId, user.sectionId)));
      if (existingCRs.length >= 2) {
        throw new Error("Maximum 2 CRs allowed per class section");
      }
    }
  }

  await db.update(users).set({ role }).where(eq(users.id, id));
  
  await sendNotification(
    id,
    '🎭 Role Updated',
    `Your system role has been updated to ${role}. Please log out and log in again to see the changes.`
  );
  
  revalidatePath('/admin/users');
}


// Semesters & Sections
export async function getSemesters() {
  await requireAdmin();
  return await db.select().from(semesters).orderBy(semesters.createdAt);
}

export async function createSemester(name: string) {
  await requireAdmin();
  await db.insert(semesters).values({ name });
  revalidatePath('/admin/infrastructure');
}

export async function updateSemester(id: number, name: string) {
  await requireAdmin();
  await db.update(semesters).set({ name }).where(eq(semesters.id, id));
  revalidatePath('/admin/infrastructure');
}

export async function getSections() {
  await requireAdmin();
  return await db.select().from(sections).orderBy(sections.name);
}

export async function createSection(name: string, semesterId: number) {
  await requireAdmin();
  await db.insert(sections).values({ name, semesterId });
  revalidatePath('/admin/infrastructure');
}

// ── Student Removal Requests ──────────────────────────────────────────────────

export async function getStudentRemovalRequests() {
  await requireAdmin();

  return await db.all(sql`
    SELECT 
      srr.id,
      srr.reason,
      srr.status,
      srr.admin_note as adminNote,
      srr.created_at as createdAt,
      s.id as studentId,
      s.name as studentName,
      s.email as studentEmail,
      s.student_id as studentStudentId,
      cr.name as crName
    FROM student_removal_requests srr
    LEFT JOIN users s ON srr.student_id = s.id
    LEFT JOIN users cr ON srr.cr_id = cr.id
    WHERE srr.status = 'PENDING'
    ORDER BY srr.created_at DESC
  `) as any[];
}

export async function resolveStudentRemovalRequest(id: number, approve: boolean, adminNote?: string) {
  await requireAdmin();
  const status = approve ? 'APPROVED' : 'REJECTED';

  const request = await db.select()
    .from(studentRemovalRequests)
    .where(eq(studentRemovalRequests.id, id))
    .get();
  if (!request) throw new Error('Request not found');

  await db.update(studentRemovalRequests)
    .set({ status, adminNote: adminNote || null })
    .where(eq(studentRemovalRequests.id, id));

  if (approve) {
    await db.delete(users).where(eq(users.id, request.studentId));
  }

  revalidatePath('/admin/approvals');
  revalidatePath('/cr/roster');
}
