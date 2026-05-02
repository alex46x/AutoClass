import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

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
