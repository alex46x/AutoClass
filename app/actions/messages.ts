'use server';

import { db } from '@/lib/db';
import { departments, personalMessages, users } from '@/lib/db/schema';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotification } from './notifications';

const STAFF_ROLES = ['TEACHER', 'HEAD', 'ADMIN'];
const MESSAGING_ROLES = [...STAFF_ROLES, 'CR'];

type UserRow = typeof users.$inferSelect;

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

async function requireMessagingUser() {
  const session = await getSession();
  if (!session || !MESSAGING_ROLES.includes(session.role)) {
    throw new Error('Unauthorized');
  }

  const user = await db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user || user.accountStatus !== 'ACTIVE') {
    throw new Error('Unauthorized');
  }

  return { session, user };
}

function isStaffRole(role: string | null | undefined) {
  return !!role && STAFF_ROLES.includes(role);
}

function isMessagingRole(role: string | null | undefined) {
  return !!role && MESSAGING_ROLES.includes(role);
}

function sameDepartment(a: UserRow, b: UserRow) {
  return !!a.departmentId && !!b.departmentId && a.departmentId === b.departmentId;
}

function canStartConversation(sender: UserRow, recipient: UserRow) {
  if (!isMessagingRole(sender.role) || !isMessagingRole(recipient.role)) return false;
  if (sender.id === recipient.id || recipient.accountStatus !== 'ACTIVE') return false;

  if (isStaffRole(sender.role) && isStaffRole(recipient.role)) return true;
  if (isStaffRole(sender.role) && recipient.role === 'CR') return sameDepartment(sender, recipient);
  if (sender.role === 'CR' && (recipient.role === 'TEACHER' || recipient.role === 'HEAD')) return sameDepartment(sender, recipient);

  return false;
}

function revalidateStaffMessages() {
  revalidatePath('/teacher/messages');
  revalidatePath('/admin/messages');
  revalidatePath('/cr/messages');
  revalidatePath('/dashboard/notifications');
}

export async function getStaffRecipients() {
  const { user } = await requireMessagingUser();
  const recipientScope = user.role === 'CR'
    ? sql`(${users.role} IN ('TEACHER', 'HEAD') AND COALESCE(${users.departmentId}, 0) = ${user.departmentId || 0})`
    : sql`(
        ${users.role} IN ('TEACHER', 'HEAD', 'ADMIN')
        OR (${users.role} = 'CR' AND COALESCE(${users.departmentId}, 0) = ${user.departmentId || 0})
      )`;

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
      recipientScope,
      eq(users.accountStatus, 'ACTIVE'),
      sql`${users.id} != ${user.id}`
    ))
    .orderBy(users.role, users.name);
}

export async function sendPersonalMessage(data: { recipientId: number; subject: string; body: string }) {
  const { session, user } = await requireMessagingUser();
  const subject = data.subject.trim();
  const body = data.body.trim();

  if (!subject || !body) {
    throw new Error('Subject and message are required');
  }

  const recipient = await db.select()
    .from(users)
    .where(eq(users.id, data.recipientId))
    .get();

  if (!recipient || !canStartConversation(user, recipient as UserRow)) {
    throw new Error('Recipient must be an active staff member or an allowed department CR');
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
  const { session } = await requireMessagingUser();
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
  const { session } = await requireMessagingUser();

  await db.update(personalMessages)
    .set({ isRead: true })
    .where(and(
      eq(personalMessages.recipientId, session.id),
      or(eq(personalMessages.id, threadId), eq(personalMessages.parentMessageId, threadId))
    ));

  revalidateStaffMessages();
}

export async function getMyMessageThreads() {
  const { session } = await requireMessagingUser();
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
  const { session } = await requireMessagingUser();
  return { id: session.id, name: session.name, role: session.role };
}
