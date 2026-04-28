'use server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { attendance } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function submitAttendanceAction(
  scheduleId: number, 
  courseId: number, 
  date: string, 
  records: { studentId: number; status: "PRESENT" | "ABSENT" | "LATE" }[]
) {
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') throw new Error("Unauthorized");

  const timestamp = new Date();

  // Begin simple transaction equivalent: delete existing for today & schedule, then insert new.
  await db.delete(attendance).where(
    and(
      eq(attendance.scheduleId, scheduleId),
      eq(attendance.date, date)
    )
  );

  const values = records.map(r => ({
    scheduleId,
    courseId,
    studentId: r.studentId,
    teacherId: session.id,
    date,
    status: r.status,
    timestamp
  }));

  if (values.length > 0) {
    await db.insert(attendance).values(values);
  }

  return { success: true };
}
