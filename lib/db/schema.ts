import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  uniqueId: text('unique_id').unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'STUDENT', 'TEACHER', 'CR', 'ADMIN'
  departmentId: integer('department_id'),
  semesterId: integer('semester_id'),
  sectionId: integer('section_id'),
  studentId: text('student_id'),
  roll: text('roll'),
  designation: text('designation').notNull().default('Lecturer'), // For TEACHER and HEAD roles
  accountStatus: text('account_status').notNull().default('ACTIVE'), // 'PENDING', 'ACTIVE', 'REJECTED'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const departments = sqliteTable('departments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
});

export const semesters = sqliteTable('semesters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  departmentId: integer('department_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  semesterId: integer('semester_id').notNull(),
  departmentId: integer('department_id'),
  maxStudents: integer('max_students').notNull().default(40),
});

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  departmentId: integer('department_id').notNull(),
  credits: integer('credits').notNull(),
});

export const enrollments = sqliteTable('enrollments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').notNull(),
  courseId: integer('course_id').notNull(),
});

export const classrooms = sqliteTable('classrooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // e.g. "Room 301"
  capacity: integer('capacity').notNull(),
  hasProjector: integer('has_projector', { mode: 'boolean' }).notNull(),
  isLab: integer('is_lab', { mode: 'boolean' }).notNull(),
});

export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  classroomId: integer('classroom_id').notNull(),
  teacherId: integer('teacher_id').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text('start_time').notNull(), // "09:00"
  endTime: text('end_time').notNull(), // "10:30"
});

export const makeupClasses = sqliteTable('makeup_classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  classroomId: integer('classroom_id').notNull(),
  teacherId: integer('teacher_id').notNull(),
  requestedBy: integer('requested_by').notNull(), // CR ID
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status').notNull(), // 'PENDING', 'APPROVED', 'REJECTED'
});

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scheduleId: integer('schedule_id'), // null if makeup class
  makeupClassId: integer('makeup_class_id'),
  courseId: integer('course_id').notNull(),
  studentId: integer('student_id').notNull(),
  teacherId: integer('teacher_id').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  status: text('status').notNull(), // 'PRESENT', 'ABSENT', 'LATE'
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const personalMessages = sqliteTable('personal_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull(),
  recipientId: integer('recipient_id').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  parentMessageId: integer('parent_message_id'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const exams = sqliteTable('exams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  type: text('type').notNull(), // 'MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT'
  title: text('title').notNull(),
  date: text('date'), // YYYY-MM-DD
  startTime: text('start_time'), // "09:00"
  maxMarks: real('max_marks').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const grades = sqliteTable('grades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  examId: integer('exam_id').notNull(),
  studentId: integer('student_id').notNull(),
  marksObtained: real('marks_obtained').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const leaveRequests = sqliteTable('leave_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'REJECTED'
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const courseMaterials = sqliteTable('course_materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  teacherId: integer('teacher_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Can be text or a URL
  type: text('type').notNull(), // 'TEXT', 'LINK', 'FILE_REF'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
export const courseNotices = sqliteTable('course_notices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull(),
  teacherId: integer('teacher_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const studentRemovalRequests = sqliteTable('student_removal_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  crId: integer('cr_id').notNull(),
  studentId: integer('student_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('PENDING'),
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const crClassPosts = sqliteTable('cr_class_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  crId: integer('cr_id').notNull(),
  courseId: integer('course_id').notNull(),
  semesterId: integer('semester_id').notNull(),
  sectionId: integer('section_id').notNull(),
  type: text('type').notNull(), // 'NOTICE' | 'SCHEDULE'
  title: text('title').notNull(),
  message: text('message').notNull(),
  scheduledDate: text('scheduled_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const crPolls = sqliteTable('cr_polls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  crId: integer('cr_id').notNull(),
  courseId: integer('course_id').notNull(),
  semesterId: integer('semester_id').notNull(),
  sectionId: integer('section_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('OPEN'), // 'OPEN' | 'CLOSED'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const crPollOptions = sqliteTable('cr_poll_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').notNull(),
  text: text('text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const crPollVotes = sqliteTable('cr_poll_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').notNull(),
  optionId: integer('option_id').notNull(),
  studentId: integer('student_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const campusEvents = sqliteTable('campus_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hostId: integer('host_id').notNull(),
  scope: text('scope').notNull(), // 'CLASS' | 'DEPARTMENT' | 'UNIVERSITY'
  departmentId: integer('department_id'),
  semesterId: integer('semester_id'),
  sectionId: integer('section_id'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  coverImage: text('cover_image'),
  category: text('category').notNull().default('General'),
  startDate: text('start_date').notNull(),
  startTime: text('start_time').notNull(),
  endDate: text('end_date'),
  endTime: text('end_time'),
  status: text('status').notNull().default('SCHEDULED'), // 'SCHEDULED' | 'CANCELLED'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const eventRsvps = sqliteTable('event_rsvps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull(),
  userId: integer('user_id').notNull(),
  status: text('status').notNull(), // 'GOING' | 'INTERESTED' | 'NOT_GOING'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const eventDiscussions = sqliteTable('event_discussions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull(),
  userId: integer('user_id').notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
