import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Using local.db inside the workspace or a specific SQLite env var.
const getDbPath = () => {
  if (process.env.SQLITE_DB_URL) return process.env.SQLITE_DB_URL;
  // Next.js build runs from / instead of /app/applet in some cases
  const potentialWorkspacePath = path.join('/', 'app', 'applet');
  if (fs.existsSync(potentialWorkspacePath)) {
    return path.join(potentialWorkspacePath, 'local.db');
  }
  return path.join(process.cwd(), 'local.db');
};

const DB_FILE = getDbPath();
console.log("INITIALIZING DB from SQLite at:", DB_FILE);

const sqlite = new Database(DB_FILE);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Execute schema creation to ensure tables exist.
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
  CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    semester_id INTEGER NOT NULL
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
  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT,
    start_time TEXT,
    max_marks REAL NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    marks_obtained REAL NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE TABLE IF NOT EXISTS course_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE TABLE IF NOT EXISTS course_notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE TABLE IF NOT EXISTS student_removal_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cr_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
`);

const addColumnIfMissing = (table: string, column: string, definition: string) => {
  const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((existingColumn) => existingColumn.name === column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
};

// CREATE TABLE IF NOT EXISTS does not update old local databases, so keep the
// additive migrations here with the bootstrap schema.
addColumnIfMissing('users', 'semester_id', 'semester_id INTEGER');
addColumnIfMissing('users', 'section_id', 'section_id INTEGER');
addColumnIfMissing('users', 'student_id', 'student_id TEXT');
addColumnIfMissing('users', 'roll', 'roll TEXT');
addColumnIfMissing('users', 'account_status', "account_status TEXT NOT NULL DEFAULT 'ACTIVE'");
addColumnIfMissing('users', 'designation', "designation TEXT NOT NULL DEFAULT 'Lecturer'");
addColumnIfMissing('exams', 'date', 'date TEXT');
addColumnIfMissing('exams', 'start_time', 'start_time TEXT');
addColumnIfMissing('sections', 'max_students', 'max_students INTEGER NOT NULL DEFAULT 40');
addColumnIfMissing('sections', 'department_id', 'department_id INTEGER');
addColumnIfMissing('semesters', 'department_id', 'department_id INTEGER');

const db = drizzle(sqlite, { schema });

export { db, sqlite };
