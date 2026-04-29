import fs from 'fs';

const extra = `
// ── Student Removal Requests ──────────────────────────────────────────────────

export async function getStudentRemovalRequests() {
  await requireAdmin();

  return await db.all(sql\`
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
  \`) as any[];
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
`;

let c = fs.readFileSync('app/actions/admin.ts', 'utf8');
c += extra;
fs.writeFileSync('app/actions/admin.ts', c);
console.log('Admin actions appended!');
