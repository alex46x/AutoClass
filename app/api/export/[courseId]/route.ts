import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  
  const session = await getSession();
  if (!session || session.role !== 'TEACHER') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get all attendance for this course
  const records = await db.all(sql`
    SELECT u.name as student_name, u.email as student_email, a.date, a.status
    FROM attendance a
    JOIN schedules s ON a.schedule_id = s.id
    JOIN users u ON a.student_id = u.id
    WHERE s.course_id = ${courseId} AND s.teacher_id = ${session.id}
    ORDER BY a.date DESC, u.name ASC
  `);

  // Generate CSV
  const csvHeaders = 'Student Name,Email,Date,Status\n';
  const csvRows = records.map((r: any) => `"${r.student_name}","${r.student_email}","${r.date}","${r.status}"`).join('\n');
  const csvData = csvHeaders + csvRows;

  return new NextResponse(csvData, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="attendance_course_${courseId}.csv"`,
    },
  });
}
