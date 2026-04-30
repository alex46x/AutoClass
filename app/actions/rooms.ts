'use server';

import { db } from '@/lib/db';
import { schedules, classrooms } from '@/lib/db/schema';
import { and, eq, gte, notInArray, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function getRoomOccupancyData() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // We want to count how many rooms are busy at each (Day, TimeSlot)
  // Standard slots: 08:00, 09:30, 11:00, 12:30, 14:00, 15:30
  const slots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30'];
  const days = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat

  const allSchedules = await db.select({
    dayOfWeek: schedules.dayOfWeek,
    startTime: schedules.startTime,
  }).from(schedules);

  const [totalRoomsCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(classrooms);
  const totalRooms = totalRoomsCount.count || 1;

  const heatmap = days.map(day => {
    return slots.map(slot => {
      const busyCount = allSchedules.filter(s => s.dayOfWeek === day && s.startTime === slot).length;
      return Math.round((busyCount / totalRooms) * 100);
    });
  });

  return {
    heatmap,
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots
  };
}

export async function findEmptyRooms(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  capacity: number,
  needsProjector: boolean,
  needsLab: boolean
) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const roomFilters = [gte(classrooms.capacity, capacity)];

  if (needsProjector) {
    roomFilters.push(eq(classrooms.hasProjector, true));
  }

  if (needsLab) {
    roomFilters.push(eq(classrooms.isLab, true));
  }

  const busyRooms = db
    .select({ classroomId: schedules.classroomId })
    .from(schedules)
    .where(and(
      eq(schedules.dayOfWeek, dayOfWeek),
      sql`${schedules.startTime} < ${endTime}`,
      sql`${schedules.endTime} > ${startTime}`
    ));

  return await db
    .select({
      id: classrooms.id,
      name: classrooms.name,
      capacity: classrooms.capacity,
      has_projector: classrooms.hasProjector,
      is_lab: classrooms.isLab,
    })
    .from(classrooms)
    .where(and(
      ...roomFilters,
      notInArray(classrooms.id, busyRooms)
    ))
    .orderBy(classrooms.name);
}
