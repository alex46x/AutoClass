import fs from 'fs';

const path = 'lib/db/schema.ts';
let content = fs.readFileSync(path, 'utf8');

// Update users
content = content.replace(
  /departmentId: integer\('department_id'\),\s*studentId: text\('student_id'\),\s*roll: text\('roll'\),\s*semester: text\('semester'\),\s*section: text\('section'\),/g,
  `departmentId: integer('department_id'),
  semesterId: integer('semester_id'),
  sectionId: integer('section_id'),
  studentId: text('student_id'),
  roll: text('roll'),`
);

// Add semesters and sections
if (!content.includes("export const semesters =")) {
  content = content.replace(
    /export const departments = sqliteTable\('departments', {[\s\S]*?}\);/,
    `export const departments = sqliteTable('departments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
});

export const semesters = sqliteTable('semesters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  semesterId: integer('semester_id').notNull(),
});`
  );
}

fs.writeFileSync(path, content);
console.log("Schema updated!");
