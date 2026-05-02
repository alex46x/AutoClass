'use server';

import { db } from '@/lib/db';
import { users, courses, classrooms, makeupClasses, enrollments, schedules, semesters, sections, notifications, studentRemovalRequests, crClassPosts, crPolls, crPollOptions, crPollVotes } from '@/lib/db/schema';
import { eq, and, sql, ne, desc } from 'drizzle-orm';
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

async function requireStudentOrCR() {
  const session = await getSession();
  if (!session || (session.role !== 'STUDENT' && session.role !== 'CR')) throw new Error('Unauthorized');

  const user = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user) throw new Error('User not found');

  return { session, user };
}

async function getScopedCourse(courseId: number, crUser: typeof users.$inferSelect) {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course || course.departmentId !== crUser.departmentId) {
    throw new Error('Course is not available to your department');
  }
  return course;
}

async function getSectionClassmates(crUser: typeof users.$inferSelect) {
  return await db.select({ id: users.id }).from(users)
    .where(and(
      eq(users.semesterId, crUser.semesterId || 0),
      eq(users.sectionId, crUser.sectionId || 0),
      eq(users.accountStatus, 'ACTIVE')
    ));
}

async function getPostRecipients(courseId: number, crUser: typeof users.$inferSelect) {
  if (courseId <= 0) {
    return await db.all(sql`
      SELECT DISTINCT u.id
      FROM users u
      WHERE u.account_status = 'ACTIVE'
        AND (u.role = 'STUDENT' OR u.role = 'CR')
        AND COALESCE(u.department_id, 0) = ${crUser.departmentId || 0}
        AND COALESCE(u.semester_id, 0) = ${crUser.semesterId || 0}
    `) as Array<{ id: number }>;
  }

  return await db.all(sql`
    SELECT DISTINCT u.id
    FROM users u
    LEFT JOIN enrollments e ON e.student_id = u.id
    WHERE u.account_status = 'ACTIVE'
      AND (u.role = 'STUDENT' OR u.role = 'CR')
      AND (
        (COALESCE(u.semester_id, 0) = ${crUser.semesterId || 0}
          AND COALESCE(u.section_id, 0) = ${crUser.sectionId || 0})
        OR e.course_id = ${courseId}
      )
  `) as Array<{ id: number }>;
}

async function notifyCourseTeachers(courseId: number, title: string, message: string) {
  const teachers = await db.selectDistinct({ id: schedules.teacherId }).from(schedules)
    .where(eq(schedules.courseId, courseId));

  if (teachers.length === 0) return;

  await db.insert(notifications).values(
    teachers.map(teacher => ({
      userId: teacher.id,
      title,
      message,
    }))
  );
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

export async function sendNotice(data: {
  courseId: number;
  title: string;
  message: string;
  type?: 'NOTICE' | 'SCHEDULE';
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
}) {
  const { crUser } = await requireCR();
  const semesterId = crUser.semesterId || 0;
  const sectionId = crUser.sectionId || 0;
  const type = data.type || 'NOTICE';
  const courseId = Number(data.courseId) || 0;

  if (courseId > 0) {
    await getScopedCourse(courseId, crUser);
  }

  if (!data.title.trim() || !data.message.trim()) throw new Error('Title and message are required');
  if (type === 'SCHEDULE' && courseId <= 0) {
    throw new Error('Schedules must be attached to a specific course');
  }
  if (type === 'SCHEDULE' && (!data.scheduledDate || !data.startTime || !data.endTime)) {
    throw new Error('Schedule date, start time, and end time are required');
  }
  if (type === 'SCHEDULE' && data.endTime! <= data.startTime!) {
    throw new Error('End time must be after start time');
  }

  await db.insert(crClassPosts).values({
    crId: crUser.id,
    courseId,
    semesterId,
    sectionId,
    type,
    title: data.title.trim(),
    message: data.message.trim(),
    scheduledDate: type === 'SCHEDULE' ? data.scheduledDate : null,
    startTime: type === 'SCHEDULE' ? data.startTime : null,
    endTime: type === 'SCHEDULE' ? data.endTime : null,
  });

  const classmates = await getPostRecipients(courseId, crUser);
  const titlePrefix = type === 'SCHEDULE' ? 'Class Schedule' : 'Class Notice';
  const teacherMessage = `${crUser.name} posted a ${type.toLowerCase()}: ${data.title}.`;

  if (classmates.length > 0) {
    await db.insert(notifications).values(
      classmates.map(student => ({
        userId: student.id,
        title: `${titlePrefix}: ${data.title}`,
        message: data.message,
      }))
    );
  }

  if (courseId > 0) {
    await notifyCourseTeachers(courseId, `${titlePrefix} from CR`, teacherMessage);
  }

  revalidatePath('/cr/notices');
  revalidatePath('/teacher/classes');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/class-updates');
  revalidatePath('/dashboard/notifications');
}

export async function getCRClassPosts() {
  const { crUser } = await requireCR();
  return await db.select({
    id: crClassPosts.id,
    type: crClassPosts.type,
    title: crClassPosts.title,
    message: crClassPosts.message,
    scheduledDate: crClassPosts.scheduledDate,
    startTime: crClassPosts.startTime,
    endTime: crClassPosts.endTime,
    createdAt: crClassPosts.createdAt,
    courseName: courses.name,
    courseCode: courses.code,
  })
    .from(crClassPosts)
    .leftJoin(courses, eq(crClassPosts.courseId, courses.id))
    .where(and(
      eq(crClassPosts.crId, crUser.id),
      eq(crClassPosts.semesterId, crUser.semesterId || 0),
      eq(crClassPosts.sectionId, crUser.sectionId || 0)
    ))
    .orderBy(desc(crClassPosts.createdAt));
}

export async function getTeacherCoursePosts() {
  const session = await getSession();
  if (!session || (session.role !== 'TEACHER' && session.role !== 'HEAD')) throw new Error('Unauthorized');

  return await db.all(sql`
    SELECT DISTINCT
      p.id,
      p.type,
      p.title,
      p.message,
      p.scheduled_date as scheduledDate,
      p.start_time as startTime,
      p.end_time as endTime,
      p.created_at as createdAt,
      c.name as courseName,
      c.code as courseCode,
      u.name as crName
    FROM cr_class_posts p
    JOIN courses c ON p.course_id = c.id
    JOIN users u ON p.cr_id = u.id
    JOIN schedules s ON p.course_id = s.course_id
    WHERE s.teacher_id = ${session.id}
    ORDER BY p.created_at DESC
    LIMIT 10
  `) as Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    scheduledDate: string | null;
    startTime: string | null;
    endTime: string | null;
    createdAt: number;
    courseName: string;
    courseCode: string;
    crName: string;
  }>;
}

export async function getStudentClassPosts() {
  const { user } = await requireStudentOrCR();

  return await db.select({
    id: crClassPosts.id,
    type: crClassPosts.type,
    title: crClassPosts.title,
    message: crClassPosts.message,
    scheduledDate: crClassPosts.scheduledDate,
    startTime: crClassPosts.startTime,
    endTime: crClassPosts.endTime,
    createdAt: crClassPosts.createdAt,
    courseName: courses.name,
    courseCode: courses.code,
    crName: users.name,
  })
    .from(crClassPosts)
    .leftJoin(courses, eq(crClassPosts.courseId, courses.id))
    .innerJoin(users, eq(crClassPosts.crId, users.id))
    .where(sql`
      (
        ${crClassPosts.semesterId} = ${user.semesterId || 0}
        AND ${crClassPosts.sectionId} = ${user.sectionId || 0}
      )
      OR (
        ${crClassPosts.courseId} > 0
        AND EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.course_id = ${crClassPosts.courseId}
            AND e.student_id = ${user.id}
        )
      )
    `)
    .orderBy(desc(crClassPosts.createdAt));
}

export async function createPoll(data: { courseId: number; title: string; description?: string; options: string[] }) {
  const { crUser } = await requireCR();
  const courseId = Number(data.courseId) || 0;
  if (courseId > 0) {
    await getScopedCourse(courseId, crUser);
  }

  const options = data.options.map(option => option.trim()).filter(Boolean);
  if (!data.title.trim()) throw new Error('Poll title is required');
  if (options.length < 2) throw new Error('A poll needs at least two options');

  const inserted = await db.insert(crPolls).values({
    crId: crUser.id,
    courseId,
    semesterId: crUser.semesterId || 0,
    sectionId: crUser.sectionId || 0,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    status: 'OPEN',
  }).returning({ id: crPolls.id });

  const pollId = inserted[0].id;
  await db.insert(crPollOptions).values(options.map(option => ({ pollId, text: option })));

  const classmates = await getPostRecipients(courseId, crUser);
  if (classmates.length > 0) {
    await db.insert(notifications).values(
      classmates.map(student => ({
        userId: student.id,
        title: 'New Class Poll',
        message: `${crUser.name} created a poll: ${data.title.trim()}`,
      }))
    );
  }

  revalidatePath('/cr/polls');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/polls');
  revalidatePath('/dashboard/notifications');
}

export async function addPollOption(pollId: number, text: string) {
  const { crUser } = await requireCR();
  const poll = await db.select().from(crPolls).where(and(eq(crPolls.id, pollId), eq(crPolls.crId, crUser.id))).get();
  if (!poll) throw new Error('Poll not found');
  if (poll.status !== 'OPEN') throw new Error('Closed polls cannot be changed');
  if (!text.trim()) throw new Error('Option text is required');

  await db.insert(crPollOptions).values({ pollId, text: text.trim() });
  revalidatePath('/cr/polls');
  revalidatePath('/dashboard/polls');
}

export async function removePollOption(optionId: number) {
  const { crUser } = await requireCR();
  const option = await db.select({
    id: crPollOptions.id,
    pollId: crPollOptions.pollId,
    crId: crPolls.crId,
    status: crPolls.status,
  })
    .from(crPollOptions)
    .innerJoin(crPolls, eq(crPollOptions.pollId, crPolls.id))
    .where(eq(crPollOptions.id, optionId))
    .get();

  if (!option || option.crId !== crUser.id) throw new Error('Option not found');
  if (option.status !== 'OPEN') throw new Error('Closed polls cannot be changed');

  const optionCount = await db.select({ count: sql<number>`COUNT(*)` }).from(crPollOptions)
    .where(eq(crPollOptions.pollId, option.pollId))
    .get();
  if ((optionCount?.count || 0) <= 2) throw new Error('A poll must keep at least two options');

  await db.delete(crPollVotes).where(eq(crPollVotes.optionId, optionId));
  await db.delete(crPollOptions).where(eq(crPollOptions.id, optionId));
  revalidatePath('/cr/polls');
  revalidatePath('/dashboard/polls');
}

export async function setPollStatus(pollId: number, status: 'OPEN' | 'CLOSED') {
  const { crUser } = await requireCR();
  await db.update(crPolls).set({ status }).where(and(eq(crPolls.id, pollId), eq(crPolls.crId, crUser.id)));
  revalidatePath('/cr/polls');
  revalidatePath('/dashboard/polls');
}

export async function getPollsForCR() {
  const { crUser } = await requireCR();
  return await getPollsForScope(crUser.semesterId || 0, crUser.sectionId || 0, crUser.departmentId || 0, crUser.id);
}

export async function getClassPolls() {
  const { user } = await requireStudentOrCR();
  return await getPollsForScope(user.semesterId || 0, user.sectionId || 0, user.departmentId || 0, user.id);
}

async function getPollsForScope(semesterId: number, sectionId: number, departmentId: number, viewerId: number) {
  const rows = await db.all(sql`
    SELECT
      p.id as pollId,
      p.title,
      p.description,
      p.status,
      p.created_at as createdAt,
      c.name as courseName,
      c.code as courseCode,
      o.id as optionId,
      o.text as optionText,
      COUNT(v.id) as votes,
      MAX(mine.option_id) as myOptionId
    FROM cr_polls p
    LEFT JOIN courses c ON p.course_id = c.id
    JOIN users cr ON p.cr_id = cr.id
    JOIN cr_poll_options o ON p.id = o.poll_id
    LEFT JOIN cr_poll_votes v ON o.id = v.option_id
    LEFT JOIN cr_poll_votes mine ON mine.poll_id = p.id AND mine.student_id = ${viewerId}
    WHERE (
        (p.semester_id = ${semesterId} AND p.section_id = ${sectionId})
        OR (
          p.course_id = 0
          AND COALESCE(cr.department_id, 0) = ${departmentId}
          AND p.semester_id = ${semesterId}
        )
        OR (
          p.course_id > 0
          AND EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.course_id = p.course_id AND e.student_id = ${viewerId}
          )
        )
      )
    GROUP BY p.id, o.id
    ORDER BY p.created_at DESC, o.id ASC
  `) as Array<{
    pollId: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: number;
    courseName: string | null;
    courseCode: string | null;
    optionId: number;
    optionText: string;
    votes: number;
    myOptionId: number | null;
  }>;

  return rows.reduce((polls, row) => {
    let poll = polls.find(item => item.id === row.pollId);
    if (!poll) {
      poll = {
        id: row.pollId,
        title: row.title,
        description: row.description,
        status: row.status,
        createdAt: row.createdAt,
        courseName: row.courseName,
        courseCode: row.courseCode,
        myOptionId: row.myOptionId,
        options: [] as Array<{ id: number; text: string; votes: number }>,
      };
      polls.push(poll);
    }
    poll.options.push({ id: row.optionId, text: row.optionText, votes: Number(row.votes) });
    return polls;
  }, [] as Array<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: number;
    courseName: string | null;
    courseCode: string | null;
    myOptionId: number | null;
    options: Array<{ id: number; text: string; votes: number }>;
  }>);
}

export async function votePoll(pollId: number, optionId: number) {
  const { session, user } = await requireStudentOrCR();
  const poll = await db.select().from(crPolls).where(eq(crPolls.id, pollId)).get();
  if (!poll || poll.status !== 'OPEN') throw new Error('Poll is not open');
  const pollCR = await db.select({ departmentId: users.departmentId }).from(users).where(eq(users.id, poll.crId)).get();
  const sameSection = poll.semesterId === (user.semesterId || 0) && poll.sectionId === (user.sectionId || 0);
  const sameGeneralBatch = poll.courseId === 0
    && poll.semesterId === (user.semesterId || 0)
    && (pollCR?.departmentId || 0) === (user.departmentId || 0);
  const enrolled = poll.courseId > 0
    ? await db.select().from(enrollments)
      .where(and(eq(enrollments.studentId, session.id), eq(enrollments.courseId, poll.courseId)))
      .get()
    : null;
  if (!sameSection && !sameGeneralBatch && !enrolled) throw new Error('Poll is not for your class');

  const option = await db.select().from(crPollOptions)
    .where(and(eq(crPollOptions.id, optionId), eq(crPollOptions.pollId, pollId)))
    .get();
  if (!option) throw new Error('Option not found');

  await db.delete(crPollVotes).where(and(eq(crPollVotes.pollId, pollId), eq(crPollVotes.studentId, session.id)));
  await db.insert(crPollVotes).values({ pollId, optionId, studentId: session.id });
  revalidatePath('/dashboard/polls');
  revalidatePath('/cr/polls');
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
