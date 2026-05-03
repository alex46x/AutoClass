'use server';

import { db } from '@/lib/db';
import { campusEvents, eventDiscussions, eventRsvps, notifications, users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type EventScope = 'CLASS' | 'DEPARTMENT' | 'UNIVERSITY';
export type RsvpStatus = 'GOING' | 'INTERESTED' | 'NOT_GOING';
export type EventStatus = 'SCHEDULED' | 'CANCELLED';

type EventFormData = {
  title: string;
  description: string;
  location: string;
  coverImage?: string;
  category?: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
};

export type EventComment = {
  id: number;
  message: string;
  createdAt: number;
  authorName: string;
  authorRole: string;
};

export type EventRsvpAttendee = {
  id: number;
  name: string;
  role: string;
  status: RsvpStatus;
};

export type EventView = {
  id: number;
  hostId: number;
  scope: EventScope;
  title: string;
  description: string;
  location: string;
  coverImage: string | null;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string | null;
  endTime: string | null;
  status: EventStatus;
  createdAt: number;
  hostName: string;
  departmentName: string | null;
  semesterName: string | null;
  sectionName: string | null;
  goingCount: number;
  interestedCount: number;
  notGoingCount: number;
  myRsvp: RsvpStatus | null;
  rsvps: EventRsvpAttendee[];
  comments: EventComment[];
};

async function getCurrentUser() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const user = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user) throw new Error('User not found');

  return user;
}

async function requireHost(scope: EventScope) {
  const user = await getCurrentUser();

  if (scope === 'CLASS' && user.role !== 'CR') {
    throw new Error('Only a CR can host a class event');
  }
  if (scope === 'DEPARTMENT' && user.role !== 'HEAD') {
    throw new Error('Only a department head can host a department event');
  }
  if (scope === 'UNIVERSITY' && user.role !== 'ADMIN') {
    throw new Error('Only an admin can host a university event');
  }
  if ((scope === 'CLASS' || scope === 'DEPARTMENT') && !user.departmentId) {
    throw new Error('Your account is not assigned to a department');
  }
  if (scope === 'CLASS' && (!user.semesterId || !user.sectionId)) {
    throw new Error('Your CR account needs a semester and section before hosting a class event');
  }

  return user;
}

function validateEventData(data: EventFormData) {
  const title = data.title.trim();
  const description = data.description.trim();
  const location = data.location.trim();
  const category = data.category?.trim() || 'General';
  const coverImage = data.coverImage?.trim() || null;
  const endDate = data.endDate?.trim() || null;
  const endTime = data.endTime?.trim() || null;

  if (!title) throw new Error('Event title is required');
  if (!description) throw new Error('Event description is required');
  if (!location) throw new Error('Event location is required');
  if (!data.startDate || !data.startTime) throw new Error('Start date and time are required');
  if (endDate && endDate < data.startDate) throw new Error('End date cannot be before the start date');
  if ((endDate || data.startDate) === data.startDate && endTime && endTime <= data.startTime) {
    throw new Error('End time must be after the start time');
  }

  return {
    title,
    description,
    location,
    category,
    coverImage,
    startDate: data.startDate,
    startTime: data.startTime,
    endDate,
    endTime,
  };
}

async function getEventAudience(scope: EventScope, host: typeof users.$inferSelect) {
  if (scope === 'UNIVERSITY') {
    return await db.select({ id: users.id }).from(users)
      .where(eq(users.accountStatus, 'ACTIVE'));
  }

  if (scope === 'DEPARTMENT') {
    return await db.select({ id: users.id }).from(users)
      .where(and(
        eq(users.departmentId, host.departmentId || 0),
        eq(users.accountStatus, 'ACTIVE')
      ));
  }

  return await db.select({ id: users.id }).from(users)
    .where(and(
      eq(users.departmentId, host.departmentId || 0),
      eq(users.semesterId, host.semesterId || 0),
      eq(users.sectionId, host.sectionId || 0),
      eq(users.accountStatus, 'ACTIVE')
    ));
}

function scopeLabel(scope: EventScope) {
  if (scope === 'CLASS') return 'Class Event';
  if (scope === 'DEPARTMENT') return 'Department Event';
  return 'University Event';
}

function revalidateEventPaths() {
  revalidatePath('/dashboard/events');
  revalidatePath('/cr/events');
  revalidatePath('/teacher/events');
  revalidatePath('/admin/events');
  revalidatePath('/dashboard/notifications');
}

export async function createEvent(scope: EventScope, data: EventFormData) {
  const host = await requireHost(scope);
  const eventData = validateEventData(data);

  const inserted = await db.insert(campusEvents).values({
    hostId: host.id,
    scope,
    departmentId: scope === 'UNIVERSITY' ? null : host.departmentId,
    semesterId: scope === 'CLASS' ? host.semesterId : null,
    sectionId: scope === 'CLASS' ? host.sectionId : null,
    status: 'SCHEDULED',
    ...eventData,
  }).returning({ id: campusEvents.id });

  const recipients = await getEventAudience(scope, host);
  const recipientIds = recipients.map(recipient => recipient.id).filter(id => id !== host.id);

  if (recipientIds.length > 0) {
    await db.insert(notifications).values(
      recipientIds.map(userId => ({
        userId,
        title: `New ${scopeLabel(scope)}`,
        message: `${host.name} invited you to ${eventData.title} on ${eventData.startDate} at ${eventData.startTime}.`,
      }))
    );
  }

  await db.insert(eventRsvps).values({
    eventId: inserted[0].id,
    userId: host.id,
    status: 'GOING',
  });

  revalidateEventPaths();
}

export async function setEventStatus(eventId: number, status: EventStatus) {
  const user = await getCurrentUser();
  const event = await db.select().from(campusEvents).where(eq(campusEvents.id, eventId)).get();
  if (!event || event.hostId !== user.id) throw new Error('Event not found');

  await db.update(campusEvents)
    .set({ status })
    .where(eq(campusEvents.id, eventId));

  revalidateEventPaths();
}

export async function setEventRsvp(eventId: number, status: RsvpStatus) {
  const user = await getCurrentUser();
  await ensureCanViewEvent(eventId, user);

  const existing = await db.select().from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, user.id)))
    .get();

  if (existing) {
    await db.update(eventRsvps)
      .set({ status, updatedAt: new Date() })
      .where(eq(eventRsvps.id, existing.id));
  } else {
    await db.insert(eventRsvps).values({ eventId, userId: user.id, status });
  }

  revalidateEventPaths();
}

export async function addEventComment(eventId: number, message: string) {
  const user = await getCurrentUser();
  await ensureCanViewEvent(eventId, user);

  const cleaned = message.trim();
  if (!cleaned) throw new Error('Comment cannot be empty');

  await db.insert(eventDiscussions).values({
    eventId,
    userId: user.id,
    message: cleaned,
  });

  revalidateEventPaths();
}

export async function getHostedEvents(scope: EventScope) {
  const host = await requireHost(scope);
  return await getEventsForWhere(sql`e.host_id = ${host.id} AND e.scope = ${scope}`, host.id);
}

export async function getVisibleEvents() {
  const user = await getCurrentUser();
  return await getEventsForWhere(sql`
    e.scope = 'UNIVERSITY'
    OR (
      e.scope = 'DEPARTMENT'
      AND COALESCE(e.department_id, 0) = ${user.departmentId || 0}
    )
    OR (
      e.scope = 'CLASS'
      AND COALESCE(e.department_id, 0) = ${user.departmentId || 0}
      AND COALESCE(e.semester_id, 0) = ${user.semesterId || 0}
      AND COALESCE(e.section_id, 0) = ${user.sectionId || 0}
    )
  `, user.id);
}

async function ensureCanViewEvent(eventId: number, user: typeof users.$inferSelect) {
  const event = await db.select().from(campusEvents).where(eq(campusEvents.id, eventId)).get();
  if (!event) throw new Error('Event not found');

  const canView = event.scope === 'UNIVERSITY'
    || (event.scope === 'DEPARTMENT' && event.departmentId === user.departmentId)
    || (
      event.scope === 'CLASS'
      && event.departmentId === user.departmentId
      && event.semesterId === user.semesterId
      && event.sectionId === user.sectionId
    );

  if (!canView) throw new Error('Event is outside your scope');
}

async function getEventsForWhere(whereClause: ReturnType<typeof sql>, viewerId: number) {
  const rows = await db.all(sql`
    SELECT
      e.id,
      e.host_id as hostId,
      e.scope,
      e.title,
      e.description,
      e.location,
      e.cover_image as coverImage,
      e.category,
      e.start_date as startDate,
      e.start_time as startTime,
      e.end_date as endDate,
      e.end_time as endTime,
      e.status,
      e.created_at as createdAt,
      host.name as hostName,
      d.name as departmentName,
      sem.name as semesterName,
      sec.name as sectionName,
      COALESCE(SUM(CASE WHEN r.status = 'GOING' THEN 1 ELSE 0 END), 0) as goingCount,
      COALESCE(SUM(CASE WHEN r.status = 'INTERESTED' THEN 1 ELSE 0 END), 0) as interestedCount,
      COALESCE(SUM(CASE WHEN r.status = 'NOT_GOING' THEN 1 ELSE 0 END), 0) as notGoingCount,
      MAX(mine.status) as myRsvp
    FROM campus_events e
    JOIN users host ON host.id = e.host_id
    LEFT JOIN departments d ON d.id = e.department_id
    LEFT JOIN semesters sem ON sem.id = e.semester_id
    LEFT JOIN sections sec ON sec.id = e.section_id
    LEFT JOIN event_rsvps r ON r.event_id = e.id
    LEFT JOIN event_rsvps mine ON mine.event_id = e.id AND mine.user_id = ${viewerId}
    WHERE ${whereClause}
    GROUP BY e.id
    ORDER BY e.start_date ASC, e.start_time ASC, e.created_at DESC
  `) as Array<Omit<EventView, 'comments' | 'rsvps'>>;

  const events = rows.map(row => ({
    ...row,
    goingCount: Number(row.goingCount),
    interestedCount: Number(row.interestedCount),
    notGoingCount: Number(row.notGoingCount),
    rsvps: [] as EventRsvpAttendee[],
    comments: [] as EventComment[],
  }));

  for (const event of events) {
    const rsvps = await db.select({
      id: users.id,
      name: users.name,
      role: users.role,
      status: eventRsvps.status,
    })
      .from(eventRsvps)
      .innerJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(eventRsvps.eventId, event.id))
      .orderBy(users.name);

    event.rsvps = rsvps.map(rsvp => ({
      id: rsvp.id,
      name: rsvp.name,
      role: rsvp.role,
      status: rsvp.status as RsvpStatus,
    }));

    const comments = await db.select({
      id: eventDiscussions.id,
      message: eventDiscussions.message,
      createdAt: eventDiscussions.createdAt,
      authorName: users.name,
      authorRole: users.role,
    })
      .from(eventDiscussions)
      .innerJoin(users, eq(eventDiscussions.userId, users.id))
      .where(eq(eventDiscussions.eventId, event.id))
      .orderBy(desc(eventDiscussions.createdAt))
      .limit(6);

    event.comments = comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Date
        ? comment.createdAt.getTime()
        : Number(comment.createdAt),
    }));
  }

  return events as EventView[];
}
