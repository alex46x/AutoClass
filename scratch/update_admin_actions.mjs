import fs from 'fs';

const path = 'app/actions/admin.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /export async function getUsers\(\) \{[\s\S]*?return await db\.select\(\)\.from\(users\)\.orderBy\(users\.name\);[\s\S]*?\}/,
  `export async function getUsers() {
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
}`
);

content = content.replace(
  /export async function createUser\(data: \{ name: string; email: string; role: string \}\) \{[\s\S]*?revalidatePath\('\/admin\/users'\);\s*\}/,
  `export async function createUser(data: { name: string; email: string; role: string; departmentId?: number; semesterId?: number; sectionId?: number }) {
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
}`
);

content = content.replace(
  /export async function updateUserRole\(id: number, role: 'STUDENT' \| 'TEACHER' \| 'CR' \| 'ADMIN'\) \{[\s\S]*?revalidatePath\('\/admin\/users'\);\s*\}/,
  `export async function updateUserRole(id: number, role: 'STUDENT' | 'TEACHER' | 'CR' | 'ADMIN') {
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
    \`Your system role has been updated to \${role}. Please log out and log in again to see the changes.\`
  );
  
  revalidatePath('/admin/users');
}`
);

if (!content.includes('export async function getSemesters()')) {
  content += `\n
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
`;
}

fs.writeFileSync(path, content);
console.log("admin.ts updated!");
