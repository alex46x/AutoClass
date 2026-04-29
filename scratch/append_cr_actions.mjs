import fs from 'fs';

const extra = `
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
  ).orderBy(sql\`CAST(\${users.roll} AS INTEGER)\`);
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
        message: \`CR \${crUser.name} has requested removal of a student. Reason: \${reason}\`,
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
`;

let c = fs.readFileSync('app/actions/cr.ts', 'utf8');
c += extra;
fs.writeFileSync('app/actions/cr.ts', c);
console.log('CR actions appended!');
