'use server';

import { db } from '@/lib/db';
import { departments, personalMessages, users } from '@/lib/db/schema';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotification } from './notifications';

const STAFF_ROLES = ['TEACHER', 'HEAD', 'ADMIN'];

type MessageRow = {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  body: string;
  parentMessageId: number | null;
  isRead: boolean | number;
  createdAt: number | string | Date;
  senderName: string;
  senderRole: string;
  recipientName: string;
  recipientRole: string;
};

async function requireStaff() {
  const session = await getSession();
  if (!session || !STAFF_ROLES.includes(session.role)) {
    throw new Error('Unauthorized');
  }
  return session;
}

function isStaffRole(role: string | null | undefined) {
  return !!role && STAFF_ROLES.includes(role);
}

function revalidateStaffMessages() {
  revalidatePath('/teacher/messages');
  revalidatePath('/admin/messages');
  revalidatePath('/dashboard/notifications');
}

export async function getStaffRecipients() {
  const session = await requireStaff();

  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    designation: users.designation,
    departmentName: departments.name,
  })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(and(
      or(eq(users.role, 'TEACHER'), eq(users.role, 'HEAD'), eq(users.role, 'ADMIN')),
      eq(users.accountStatus, 'ACTIVE'),
      sql`${users.id} != ${session.id}`
    ))
    .orderBy(users.role, users.name);
}

export async function sendPersonalMessage(data: { recipientId: number; subject: string; body: string }) {
  const session = await requireStaff();
  const subject = data.subject.trim();
  const body = data.body.trim();

  if (!subject || !body) {
    throw new Error('Subject and message are required');
  }

  const recipient = await db.select({ id: users.id, role: users.role, name: users.name, accountStatus: users.accountStatus })
    .from(users)
    .where(eq(users.id, data.recipientId))
    .get();

  if (!recipient || !isStaffRole(recipient.role) || recipient.accountStatus !== 'ACTIVE' || recipient.id === session.id) {
    throw new Error('Recipient must be an active teacher, department head, or admin');
  }

  const [message] = await db.insert(personalMessages).values({
    senderId: session.id,
    recipientId: recipient.id,
    subject,
    body,
  }).returning({ id: personalMessages.id });

  await sendNotification(
    recipient.id,
    `New message from ${session.name}`,
    subject
  );

  revalidateStaffMessages();
  return message;
}

export async function replyToPersonalMessage(parentMessageId: number, body: string) {
  const session = await requireStaff();
  const messageBody = body.trim();

  if (!messageBody) {
    throw new Error('Reply cannot be empty');
  }

  const root = await db.select()
    .from(personalMessages)
    .where(eq(personalMessages.id, parentMessageId))
    .get();

  if (!root || root.parentMessageId !== null) {
    throw new Error('Conversation not found');
  }

  if (root.senderId !== session.id && root.recipientId !== session.id) {
    throw new Error('Unauthorized');
  }

  const recipientId = root.senderId === session.id ? root.recipientId : root.senderId;

  await db.insert(personalMessages).values({
    senderId: session.id,
    recipientId,
    subject: root.subject,
    body: messageBody,
    parentMessageId: root.id,
  });

  await sendNotification(
    recipientId,
    `Reply from ${session.name}`,
    root.subject
  );

  revalidateStaffMessages();
}

export async function markMessageThreadRead(threadId: number) {
  const session = await requireStaff();

  await db.update(personalMessages)
    .set({ isRead: true })
    .where(and(
      eq(personalMessages.recipientId, session.id),
      or(eq(personalMessages.id, threadId), eq(personalMessages.parentMessageId, threadId))
    ));

  revalidateStaffMessages();
}

export async function getMyMessageThreads() {
  const session = await requireStaff();
  const rows = await db.all(sql`
    SELECT
      pm.id,
      pm.sender_id as senderId,
      pm.recipient_id as recipientId,
      pm.subject,
      pm.body,
      pm.parent_message_id as parentMessageId,
      pm.is_read as isRead,
      pm.created_at as createdAt,
      sender.name as senderName,
      sender.role as senderRole,
      recipient.name as recipientName,
      recipient.role as recipientRole
    FROM personal_messages pm
    JOIN users sender ON sender.id = pm.sender_id
    JOIN users recipient ON recipient.id = pm.recipient_id
    WHERE pm.sender_id = ${session.id} OR pm.recipient_id = ${session.id}
    ORDER BY pm.created_at ASC, pm.id ASC
  `) as MessageRow[];

  const threads = new Map<number, MessageRow[]>();

  for (const row of rows) {
    const rootId = row.parentMessageId ?? row.id;
    const existing = threads.get(rootId) ?? [];
    existing.push(row);
    threads.set(rootId, existing);
  }

  return Array.from(threads.entries())
    .map(([id, messages]) => {
      const root = messages[0];
      const latest = messages[messages.length - 1];
      const otherParty = root.senderId === session.id
        ? { id: root.recipientId, name: root.recipientName, role: root.recipientRole }
        : { id: root.senderId, name: root.senderName, role: root.senderRole };

      return {
        id,
        subject: root.subject,
        otherParty,
        latest,
        messages,
        unreadCount: messages.filter(message => message.recipientId === session.id && !message.isRead).length,
      };
    })
    .sort((a, b) => Number(b.latest.createdAt) - Number(a.latest.createdAt) || b.latest.id - a.latest.id);
}

export async function getCurrentStaffUser() {
  const session = await requireStaff();
  return { id: session.id, name: session.name, role: session.role };
}
