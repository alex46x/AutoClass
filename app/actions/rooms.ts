'use server';

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function findEmptyRooms(
  dayOfWeek: number, 
  startTime: string, 
  endTime: string, 
  minCapacity: number,
  needsProjector: boolean,
  needsLab: boolean
) {
  const session = await getSession();
  if (!session || (session.role !== 'CR' && session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
    throw new Error('Unauthorized');
  }

  // Find classrooms that match capacity and equipment requirements,
  // AND are NOT present in the schedules table for the given day/time where there's an overlap.

  // Time overlap logic in sqlite:
  // (s.start_time < new_end) AND (s.end_time > new_start)

  let query = `
    SELECT c.id, c.name, c.capacity, c.has_projector, c.is_lab
    FROM classrooms c
    WHERE c.capacity >= ${minCapacity}
  `;

  if (needsProjector) query += ` AND c.has_projector = 1`;
  if (needsLab) query += ` AND c.is_lab = 1`;

  query += `
    AND c.id NOT IN (
      SELECT schedule.classroom_id
      FROM schedules schedule
      WHERE schedule.day_of_week = ${dayOfWeek}
        AND schedule.start_time < '${endTime}'
        AND schedule.end_time > '${startTime}'
    )
  `;

  const availableRooms = await db.all(sql.raw(query));
  return availableRooms;
}
