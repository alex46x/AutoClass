'use server';

import { db } from '@/lib/db';
import { users, studentRemovalRequests, notifications, semesters, sections } from '@/lib/db/schema';
import { eq, and, ne, or, inArray, sql } from 'drizzle-orm';
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
    sectionId: users.sectionId,
  })
  .from(users)
  .where(and(
    eq(users.departmentId, session.departmentId!),
    or(eq(users.role, 'STUDENT'), eq(users.role, 'CR'))
  ))
  .orderBy(users.name);
}

export async function updateDepartmentStudentCrRole(studentId: number, makeCr: boolean) {
  const session = await requireHead();

  const student = await db.select({
    id: users.id,
    name: users.name,
    role: users.role,
    departmentId: users.departmentId,
    sectionId: users.sectionId,
    accountStatus: users.accountStatus,
  })
  .from(users)
  .where(and(
    eq(users.id, studentId),
    eq(users.departmentId, session.departmentId!)
  ))
  .get();

  if (!student) {
    throw new Error('Student not found in your department');
  }

  if (student.role !== 'STUDENT' && student.role !== 'CR') {
    throw new Error('Only students can be assigned as CRs');
  }

  if (student.accountStatus !== 'ACTIVE') {
    throw new Error('Only active students can be assigned as CRs');
  }

  if (makeCr) {
    if (!student.sectionId) {
      throw new Error('Assign the student to a section before promoting them to CR');
    }

    const existingCRs = await db.select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.role, 'CR'),
        eq(users.sectionId, student.sectionId),
        ne(users.id, studentId)
      ));

    if (existingCRs.length >= 2) {
      throw new Error('Maximum 2 CRs allowed per class section');
    }
  }

  const role = makeCr ? 'CR' : 'STUDENT';
  await db.update(users)
    .set({ role })
    .where(and(
      eq(users.id, studentId),
      eq(users.departmentId, session.departmentId!)
    ));

  await sendNotification(
    studentId,
    'Role Updated',
    makeCr
      ? 'Your Department Head has promoted you to Class Representative.'
      : 'Your Department Head has updated your role to Student.'
  );

  revalidatePath('/teacher/faculty');
  revalidatePath('/dashboard');
  revalidatePath('/cr');
  revalidatePath('/admin/users');
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

// ── Section Management ─────────────────────────────────────────────────────────

export async function getSemestersForHead() {
  const session = await requireHead();
  return await db.select().from(semesters)
    .where(eq(semesters.departmentId, session.departmentId!))
    .orderBy(semesters.createdAt);
}

export async function getDepartmentSections(semesterId?: number) {
  const session = await requireHead();
  
  const baseSelect = db.select({
    id: sections.id,
    name: sections.name,
    semesterId: sections.semesterId,
    departmentId: sections.departmentId,
    maxStudents: sections.maxStudents,
    semesterName: semesters.name
  })
  .from(sections)
  .innerJoin(semesters, eq(sections.semesterId, semesters.id));
  
  if (semesterId) {
    return await baseSelect
      .where(and(
        eq(sections.departmentId, session.departmentId!),
        eq(sections.semesterId, semesterId)
      ))
      .orderBy(sections.name);
  }
  
  return await baseSelect
    .where(eq(sections.departmentId, session.departmentId!))
    .orderBy(sections.name);
}



export async function addDepartmentSection(semesterId: number, name: string, maxStudents: number) {
  const session = await requireHead();
  
  await db.insert(sections).values({
    name,
    semesterId,
    departmentId: session.departmentId!,
    maxStudents,
  });
  
  revalidatePath('/teacher/sections');
}

export async function editDepartmentSection(sectionId: number, name: string, maxStudents: number) {
  const session = await requireHead();
  
  const section = await db.select().from(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.departmentId, session.departmentId!)))
    .get();
    
  if (!section) throw new Error('Section not found or unauthorized');

  await db.update(sections)
    .set({ name, maxStudents })
    .where(eq(sections.id, sectionId));
    
  revalidatePath('/teacher/sections');
}

export async function removeDepartmentSection(sectionId: number) {
  const session = await requireHead();
  
  const section = await db.select().from(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.departmentId, session.departmentId!)))
    .get();
    
  if (!section) throw new Error('Section not found or unauthorized');

  // Unassign students in this section
  await db.update(users)
    .set({ sectionId: null })
    .where(eq(users.sectionId, sectionId));

  await db.delete(sections).where(eq(sections.id, sectionId));
  
  revalidatePath('/teacher/sections');
}

export async function shiftStudentSection(studentId: number, newSectionId: number | null) {
  const session = await requireHead();
  
  // Verify student is in this department Department
  const student = await db.select().from(users)
    .where(and(eq(users.id, studentId), eq(users.departmentId, session.departmentId!)))
    .get();
    
  if (!student) throw new Error('Student not found in your department');

  let targetSection: typeof sections.$inferSelect | undefined;
  if (newSectionId) {
    targetSection = await db.select().from(sections)
      .where(eq(sections.id, newSectionId))
      .get();
    if (!targetSection) throw new Error('Section not found');
    if (targetSection.departmentId !== session.departmentId) throw new Error('Section not found in your department');

    // Check capacity
    const currentStudents = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.sectionId, newSectionId))
      .get();
      
    if (currentStudents && currentStudents.count >= targetSection.maxStudents) {
      throw new Error(`Cannot shift student. Section "${targetSection.name}" is already at maximum capacity (${targetSection.maxStudents}).`);
    }
  }

  await db.update(users)
    .set({
      sectionId: newSectionId,
      semesterId: targetSection?.semesterId ?? undefined,
    })
    .where(eq(users.id, studentId));

  if (newSectionId) {
    await sendNotification(
      studentId,
      '🏫 Section Updated',
      `Your Department Head has assigned you to a new section: ${targetSection?.name}.`
    );
  }

  revalidatePath('/teacher/sections');
}
