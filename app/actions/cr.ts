'use server';

import { db } from '@/lib/db';
import { users, courses, classrooms, makeupClasses, enrollments, schedules, semesters, sections, notifications, enrollments as _e, studentRemovalRequests } from '@/lib/db/schema';
import { eq, and, sql, ne } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotification } from './notifications';

export async function requireCR() {
  const session = await getSession();
  if (!session || session.role !== 'CR') throw new Error('Unauthorized');

  const crUser = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!crUser) throw new Error('CR user not found');

  return { session, crUser };
}

// ── Classmate Approval ────────────────────────────────────────────────────────

export async function getPendingClassmates() {
  const { crUser } = await requireCR();
  return await db.select().from(users).where(
    and(
      eq(users.accountStatus, 'PENDING'),
      eq(users.semesterId, crUser.semesterId || 0),
      eq(users.sectionId, crUser.sectionId || 0)
    )
  ).orderBy(users.createdAt);
}

export async function approveClassmate(id: number) {
  const { crUser } = await requireCR();
  const targetUser = await db.select().from(users).where(eq(users.id, id)).get();
  if (!targetUser) throw new Error('User not found');
  if (targetUser.semesterId !== crUser.semesterId || targetUser.sectionId !== crUser.sectionId) {
    throw new Error('You can only approve students in your exact semester and section');
  }
  await db.update(users).set({ accountStatus: 'ACTIVE' }).where(eq(users.id, id));
  await sendNotification(id, '✅ Account Approved', `Welcome! Your account was approved by your CR (${crUser.name}). You can now log in to CampusFlow.`);
  revalidatePath('/cr/approvals');
}

export async function rejectClassmate(id: number) {
  const { crUser } = await requireCR();
  const targetUser = await db.select().from(users).where(eq(users.id, id)).get();
  if (!targetUser) throw new Error('User not found');
  if (targetUser.semesterId !== crUser.semesterId || targetUser.sectionId !== crUser.sectionId) {
    throw new Error('You can only reject students in your exact semester and section');
  }
  await db.update(users).set({ accountStatus: 'REJECTED' }).where(eq(users.id, id));
  revalidatePath('/cr/approvals');
}

// ── Class Roster (scoped by CR's semester + section) ─────────────────────────

export async function getCRClassmates() {
  const { crUser } = await requireCR();
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    studentId: users.studentId,
    roll: users.roll,
    semesterId: users.semesterId,
    sectionId: users.sectionId,
    accountStatus: users.accountStatus,
  }).from(users).where(
    and(
      eq(users.role, 'STUDENT'),
      eq(users.semesterId, crUser.semesterId || 0),
      eq(users.sectionId, crUser.sectionId || 0),
      eq(users.accountStatus, 'ACTIVE'),
    )
  ).orderBy(sql`CAST(${users.roll} AS INTEGER)`);
}

export async function getCRProfile() {
  const { crUser } = await requireCR();
  
  let semesterName = 'N/A';
  let sectionName = 'N/A';
  
  if (crUser.semesterId) {
    const sem = await db.select().from(semesters).where(eq(semesters.id, crUser.semesterId)).get();
    if (sem) semesterName = sem.name;
  }
  
  if (crUser.sectionId) {
    const sec = await db.select().from(sections).where(eq(sections.id, crUser.sectionId)).get();
    if (sec) sectionName = sec.name;
  }

  return {
    ...crUser,
    semester: semesterName,
    section: sectionName,
  };
}

// ── Makeup Class ──────────────────────────────────────────────────────────────

export async function getCRFormData() {
  const { crUser } = await requireCR();
  const departmentId = crUser.departmentId;

  if (!departmentId) {
    throw new Error('CR is not assigned to any department');
  }

  const allCourses = await db.select({
    id: courses.id,
    name: courses.name,
    code: courses.code,
  }).from(courses).where(eq(courses.departmentId, departmentId));

  const allClassrooms = await db.select({
    id: classrooms.id,
    name: classrooms.name,
    capacity: classrooms.capacity,
  }).from(classrooms);

  const teachers = await db.select({
    id: users.id,
    name: users.name,
  }).from(users).where(and(eq(users.role, 'TEACHER'), eq(users.departmentId, departmentId)));

  return { courses: allCourses, classrooms: allClassrooms, teachers, crUser };
}

export async function requestMakeupClass(data: {
  courseId: number;
  classroomId: number;
  teacherId: number;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const { session, crUser } = await requireCR();

  if (data.endTime <= data.startTime) {
    throw new Error('End time must be after start time');
  }

  await db.insert(makeupClasses).values({
    ...data,
    requestedBy: session.id,
    status: 'PENDING',
  });

  revalidatePath('/cr/makeup-class');
  revalidatePath('/admin/approvals');
}

// ── CR Dashboard Stats (scoped) ───────────────────────────────────────────────

export async function getCRDashboardStats() {
  const { crUser } = await requireCR();

  const semesterId = crUser.semesterId || 0;
  const sectionId = crUser.sectionId || 0;

  const classmates = await db.select({ id: users.id }).from(users).where(
    and(
      eq(users.role, 'STUDENT'),
      eq(users.semesterId, semesterId),
      eq(users.sectionId, sectionId),
      eq(users.accountStatus, 'ACTIVE'),
    )
  );

  const pendingStudents = await db.select({ id: users.id }).from(users).where(
    and(
      eq(users.accountStatus, 'PENDING'),
      eq(users.semesterId, semesterId),
      eq(users.sectionId, sectionId),
    )
  );

  const pendingMakeups = await db.select({ id: makeupClasses.id }).from(makeupClasses).where(
    and(
      eq(makeupClasses.requestedBy, crUser.id),
      eq(makeupClasses.status, 'PENDING'),
    )
  );
  
  let semesterName = 'N/A';
  let sectionName = 'N/A';
  
  if (semesterId) {
    const sem = await db.select().from(semesters).where(eq(semesters.id, semesterId)).get();
    if (sem) semesterName = sem.name;
  }
  
  if (sectionId) {
    const sec = await db.select().from(sections).where(eq(sections.id, sectionId)).get();
    if (sec) sectionName = sec.name;
  }

  return {
    classmateCount: classmates.length,
    pendingApprovals: pendingStudents.length,
    pendingMakeups: pendingMakeups.length,
    semester: semesterName,
    section: sectionName,
    crName: crUser.name,
  };
}

// ── Send Notice to section classmates ─────────────────────────────────────────

export async function sendNotice(data: { courseId: number; title: string; message: string }) {
  const { crUser } = await requireCR();
  const sectionId = crUser.sectionId || 0;

  const classmates = await db.select({ id: users.id }).from(users).where(
    and(
      eq(users.sectionId, sectionId),
      eq(users.accountStatus, 'ACTIVE'),
    )
  );

  if (classmates.length === 0) return;

  await Promise.all(
    classmates.map(student =>
      db.insert(notifications).values({
        userId: student.id,
        title: data.title,
        message: data.message,
      })
    )
  );

  revalidatePath('/cr/notices');
}

// ── Classmate Roster (full detail) ────────────────────────────────────────────

export async function getCRClassmatesWithDetails() {
  const { crUser } = await requireCR();
  const sectionId = crUser.sectionId || 0;
  const semesterId = crUser.semesterId || 0;

  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    studentId: users.studentId,
    roll: users.roll,
    role: users.role,
    accountStatus: users.accountStatus,
  }).from(users).where(
    and(
      eq(users.semesterId, semesterId),
      eq(users.sectionId, sectionId),
      eq(users.accountStatus, 'ACTIVE'),
      ne(users.id, crUser.id),
    )
  ).orderBy(sql`CAST(${users.roll} AS INTEGER)`);
}

// ── Student Removal Request ────────────────────────────────────────────────────

export async function requestStudentRemoval(studentId: number, reason: string) {
  const { crUser } = await requireCR();

  const student = await db.select().from(users).where(eq(users.id, studentId)).get();
  if (!student || student.sectionId !== crUser.sectionId) {
    throw new Error('Student is not in your section');
  }

  const existing = await db.select().from(studentRemovalRequests).where(
    and(
      eq(studentRemovalRequests.studentId, studentId),
      eq(studentRemovalRequests.status, 'PENDING')
    )
  ).get();
  if (existing) throw new Error('A removal request for this student is already pending');

  await db.insert(studentRemovalRequests).values({
    crId: crUser.id,
    studentId,
    reason,
    status: 'PENDING',
    createdAt: new Date(),
  });

  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN'));
  await Promise.all(
    admins.map(admin =>
      db.insert(notifications).values({
        userId: admin.id,
        title: '🚨 Student Removal Request',
        message: `CR ${crUser.name} has requested removal of a student. Reason: ${reason}`,
      })
    )
  );

  revalidatePath('/cr/roster');
  revalidatePath('/admin/approvals');
}

export async function getMyRemovalRequests() {
  const { crUser } = await requireCR();
  return await db.select({
    id: studentRemovalRequests.id,
    studentId: studentRemovalRequests.studentId,
    reason: studentRemovalRequests.reason,
    status: studentRemovalRequests.status,
    adminNote: studentRemovalRequests.adminNote,
    createdAt: studentRemovalRequests.createdAt,
    studentName: users.name,
    studentEmail: users.email,
  })
  .from(studentRemovalRequests)
  .leftJoin(users, eq(studentRemovalRequests.studentId, users.id))
  .where(eq(studentRemovalRequests.crId, crUser.id))
  .orderBy(studentRemovalRequests.createdAt);
}
