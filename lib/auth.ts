import { cookies } from 'next/headers';
export { signToken, verifyToken } from './token';
import { verifyToken } from './token';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload?.id) return null;

  try {
    const [{ db }, { users }, { eq }] = await Promise.all([
      import('@/lib/db'),
      import('@/lib/db/schema'),
      import('drizzle-orm'),
    ]);
    const user = await db.select().from(users).where(eq(users.id, Number(payload.id))).get();
    if (!user || user.accountStatus !== 'ACTIVE') return null;
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      uniqueId: user.uniqueId,
    };
  } catch {
    return payload as { id: number; role: string; name: string; email: string; uniqueId?: string | null };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
