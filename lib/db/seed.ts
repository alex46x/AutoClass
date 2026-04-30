import { db, sqlite } from './index';
import * as schema from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function seed() {
  console.log('Seeding database...');
  
  // Create tables using drizzle syntax or raw SQL
  // For better-sqlite3 with standard usage, we can write raw DDL or just let drizzle-kit handle.
  // Actually, without drizzle-kit push in code, we can create tables manually or run migrations.
  // We'll write raw create statements here just for the initial setup to ensure the app boots.
  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      department_id INTEGER,
      semester_id INTEGER,
      section_id INTEGER,
      student_id TEXT,
      roll TEXT,
      account_status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      credits INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      has_projector INTEGER NOT NULL,
      is_lab INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      classroom_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS makeup_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      classroom_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      requested_by INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER,
      makeup_class_id INTEGER,
      course_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  // Check if admin exists
  const existingAdmin = db.select().from(schema.users).where(
    eq(schema.users.email, 'admin@university.edu')
  ).get();

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const pwdHashStudent = await bcrypt.hash('student123', 10);
    const pwdHashTeacher = await bcrypt.hash('teacher123', 10);
    const pwdHashCR = await bcrypt.hash('cr123', 10);
    
    console.log("Original student hash:", pwdHashStudent);
    console.log("Compare immediately:", await bcrypt.compare('student123', pwdHashStudent));

    const now = new Date();

    sqlite.exec("BEGIN TRANSACTION");

    try {
      db.insert(schema.departments).values([
        { name: 'Computer Science', code: 'CS' },
        { name: 'Mathematics', code: 'MATH' },
      ]).run();
  
      db.insert(schema.classrooms).values([
        { name: 'Room 101', capacity: 30, hasProjector: true, isLab: false },
        { name: 'Lab 201', capacity: 40, hasProjector: true, isLab: true },
        { name: 'Room 305', capacity: 60, hasProjector: false, isLab: false },
      ]).run();
  
      db.insert(schema.courses).values([
        { name: 'Data Structures', code: 'CS201', departmentId: 1, credits: 3 },
        { name: 'Algorithms', code: 'CS301', departmentId: 1, credits: 3 },
        { name: 'Calculus I', code: 'MATH101', departmentId: 2, credits: 4 },
      ]).run();
      
      const res = db.insert(schema.users).values([
        { name: 'System Admin', email: 'admin@university.edu', passwordHash, role: 'ADMIN', createdAt: now },
        { name: 'Dr. Alan Turing', email: 'teacher@university.edu', passwordHash: pwdHashTeacher, role: 'TEACHER', departmentId: 1, createdAt: now },
        { name: 'John Doe', email: 'student@university.edu', passwordHash: pwdHashStudent, role: 'STUDENT', departmentId: 1, createdAt: now },
        { name: 'Jane Smith (CR)', email: 'cr@university.edu', passwordHash: pwdHashCR, role: 'CR', departmentId: 1, createdAt: now },
      ]).returning({ id: schema.users.id }).run();
  
      const studentId = 3;
      const crId = 4;
      const teacherId = 2;
  
      db.insert(schema.enrollments).values([
        { studentId: studentId, courseId: 1 },
        { studentId: crId, courseId: 1 },
      ]).run();
  
      db.insert(schema.schedules).values([
        { courseId: 1, classroomId: 1, teacherId: teacherId, dayOfWeek: 1, startTime: '09:00', endTime: '10:30' },
        { courseId: 1, classroomId: 2, teacherId: teacherId, dayOfWeek: 3, startTime: '10:30', endTime: '12:00' },
      ]).run();
  
      db.insert(schema.attendance).values([
        { scheduleId: 1, courseId: 1, studentId: studentId, teacherId: teacherId, date: '2023-09-01', status: 'PRESENT', timestamp: now },
        { scheduleId: 1, courseId: 1, studentId: studentId, teacherId: teacherId, date: '2023-09-08', status: 'ABSENT', timestamp: now },
        { scheduleId: 1, courseId: 1, studentId: crId, teacherId: teacherId, date: '2023-09-01', status: 'PRESENT', timestamp: now },
      ]).run();
  
      db.insert(schema.notifications).values([
        { userId: studentId, title: 'Welcome to CampusFlow', message: 'Your semester begins today.', createdAt: now },
      ]).run();
  
      sqlite.exec("COMMIT");
      console.log("Seeding complete. Use student@university.edu : student123");
    } catch(e) {
      sqlite.exec("ROLLBACK");
      console.error(e);
    }
  }

  // Always ensure HEAD user exists (even if admin was already seeded)
  const existingHead = db.select().from(schema.users).where(
    eq(schema.users.email, 'head@university.edu')
  ).get();

  if (!existingHead) {
    const pwdHashHead = await bcrypt.hash('head123', 10);
    db.insert(schema.users).values({
      name: 'Prof. Grace Hopper',
      email: 'head@university.edu',
      passwordHash: pwdHashHead,
      role: 'HEAD',
      departmentId: 1,
      designation: 'Department Head',
      createdAt: new Date()
    }).run();
    console.log("Added head@university.edu");
  }
}

// Execute seed if run directly
if (require.main === module) {
  seed().catch(console.error);
}

