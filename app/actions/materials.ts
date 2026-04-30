'use server';

import { db } from '@/lib/db';
import { courseMaterials, courses, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCourseMaterials(courseId: number) {
  return await db.select({
    id: courseMaterials.id,
    title: courseMaterials.title,
    content: courseMaterials.content,
    type: courseMaterials.type,
    createdAt: courseMaterials.createdAt,
    teacherName: users.name,
  })
  .from(courseMaterials)
  .leftJoin(users, eq(courseMaterials.teacherId, users.id))
  .where(eq(courseMaterials.courseId, courseId))
  .orderBy(desc(courseMaterials.createdAt));
}

export async function addCourseMaterial(data: {
  courseId: number;
  title: string;
  content: string;
  type: 'TEXT' | 'LINK';
}) {
  const session = await getSession();
  if (!session || (session.role !== 'TEACHER' && session.role !== 'HEAD')) throw new Error('Unauthorized');

  await db.insert(courseMaterials).values({
    courseId: data.courseId,
    teacherId: session.id,
    title: data.title,
    content: data.content,
    type: data.type,
  });

  revalidatePath(`/teacher/classes`);
  revalidatePath(`/dashboard/courses`);
}

export async function deleteCourseMaterial(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'TEACHER' && session.role !== 'HEAD')) throw new Error('Unauthorized');

  await db.delete(courseMaterials).where(and(
    eq(courseMaterials.id, id),
    eq(courseMaterials.teacherId, session.id)
  ));

  revalidatePath(`/teacher/classes`);
}
