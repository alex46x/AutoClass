'use server';

import { db } from '@/lib/db';
import { users, studentRemovalRequests, notifications } from '@/lib/db/schema';
import { eq, and, ne, or, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotification } from './notifications';

async function requireHead() {
  const session = await getSession();
  if (!session || session.role !== 'HEAD') {
    throw new Error('Unauthorized');
  }

  // JWT doesn't carry departmentId, so fetch it from DB
  const user = await db.select({ id: users.id, departmentId: users.departmentId })
    .from(users)
    .where(eq(users.id, session.id))
    .get();

  if (!user?.departmentId) {
    throw new Error('Department Head must be assigned to a department. Please contact Admin.');
  }

  return { ...session, departmentId: user.departmentId };
}

// ── Faculty Management ─────────────────────────────────────────────────────────

export async function getDepartmentFaculty() {
  const session = await requireHead();

  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    designation: users.designation,
    role: users.role,
    accountStatus: users.accountStatus,
  })
  .from(users)
  .where(and(
    eq(users.departmentId, session.departmentId!),
    or(eq(users.role, 'TEACHER'), eq(users.role, 'HEAD'))
  ))
  .orderBy(users.name);
}

export async function updateTeacherDesignation(teacherId: number, designation: string) {
  const session = await requireHead();

  const validDesignations = [
    'Lecturer',
    'Senior Lecturer',
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Visiting Professor',
    'Adjunct Faculty',
  ];
  if (!validDesignations.includes(designation)) {
    throw new Error('Invalid designation');
  }

  await db.update(users)
    .set({ designation })
    .where(and(
      eq(users.id, teacherId),
      eq(users.departmentId, session.departmentId!)
    ));

  await sendNotification(
    teacherId,
    '🎓 Designation Updated',
    `Your designation has been updated to ${designation} by your Department Head.`
  );

  revalidatePath('/teacher/faculty');
}

export async function sendTeacherMessage(teacherId: number, title: string, message: string) {
  const session = await requireHead();

  await sendNotification(
    teacherId,
    `✉️ ${title}`,
    `Message from Dept. Head: ${message}`
  );
}

export async function broadcastDepartmentNotice(
  title: string,
  message: string,
  target: 'ALL' | 'FACULTY' | 'STUDENTS' | 'CRS' = 'ALL'
) {
  const session = await requireHead();

  // Build role filter based on target
  let recipients: { id: number }[] = [];

  if (target === 'FACULTY' || target === 'ALL') {
    const faculty = await db.select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.departmentId, session.departmentId!),
        or(eq(users.role, 'TEACHER'), eq(users.role, 'HEAD')),
        ne(users.id, session.id)
      ));
    recipients.push(...faculty);
  }

  if (target === 'STUDENTS' || target === 'ALL') {
    const students = await db.select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.departmentId, session.departmentId!),
        or(eq(users.role, 'STUDENT'), eq(users.role, 'CR')),
        eq(users.accountStatus, 'ACTIVE')
      ));
    recipients.push(...students);
  }

  if (target === 'CRS') {
    const crs = await db.select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.departmentId, session.departmentId!),
        eq(users.role, 'CR'),
        eq(users.accountStatus, 'ACTIVE')
      ));
    recipients.push(...crs);
  }

  // Deduplicate by id
  const uniqueIds = [...new Set(recipients.map(r => r.id))];

  for (const recipientId of uniqueIds) {
    await sendNotification(
      recipientId,
      `📢 Dept. Notice: ${title}`,
      message
    );
  }
}

// ── Student Management ─────────────────────────────────────────────────────────

export async function getDepartmentStudents() {
  const session = await requireHead();

  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    studentId: users.studentId,
    roll: users.roll,
    accountStatus: users.accountStatus,
    role: users.role,
  })
  .from(users)
  .where(and(
    eq(users.departmentId, session.departmentId!),
    or(eq(users.role, 'STUDENT'), eq(users.role, 'CR'))
  ))
  .orderBy(users.name);
}

export async function removeStudentFromDepartment(studentId: number, reason: string) {
  const session = await requireHead();

  // Verify student is in this department
  const student = await db.select().from(users)
    .where(and(eq(users.id, studentId), eq(users.departmentId, session.departmentId!)))
    .get();

  if (!student) throw new Error('Student not found in your department');

  // Insert a removal request attributed to the head (using headId as crId for tracking)
  await db.insert(studentRemovalRequests).values({
    crId: session.id,
    studentId,
    reason,
  });

  revalidatePath('/teacher/faculty');
  revalidatePath('/admin/approvals');
}

export async function getPendingRemovalsForDept() {
  const session = await requireHead();

  const allRequests = await db.select({
    id: studentRemovalRequests.id,
    reason: studentRemovalRequests.reason,
    status: studentRemovalRequests.status,
    createdAt: studentRemovalRequests.createdAt,
    crId: studentRemovalRequests.crId,
    studentId: studentRemovalRequests.studentId,
  })
  .from(studentRemovalRequests)
  .where(eq(studentRemovalRequests.status, 'PENDING'));

  // Enrich with names
  const enriched = [];
  for (const req of allRequests) {
    const student = await db.select({ name: users.name, email: users.email, studentId: users.studentId, departmentId: users.departmentId })
      .from(users).where(eq(users.id, req.studentId)).get();

    // Only include students in head's department
    if (student && student.departmentId === session.departmentId) {
      const requestedBy = await db.select({ name: users.name })
        .from(users).where(eq(users.id, req.crId)).get();

      enriched.push({
        ...req,
        studentName: student.name,
        studentEmail: student.email,
        studentStudentId: student.studentId,
        requestedByName: requestedBy?.name ?? 'Unknown',
      });
    }
  }

  return enriched;
}
