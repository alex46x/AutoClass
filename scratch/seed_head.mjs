import { db } from '../lib/db/index.js';
import * as schema from '../lib/db/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function addHead() {
  const existingHead = await db.select().from(schema.users).where(
    eq(schema.users.email, 'head@university.edu')
  ).get();

  if (!existingHead) {
    const pwdHashHead = await bcrypt.hash('head123', 10);
    const now = new Date();
    
    await db.insert(schema.users).values({
      name: 'Prof. Grace Hopper',
      email: 'head@university.edu',
      passwordHash: pwdHashHead,
      role: 'HEAD',
      departmentId: 1,
      designation: 'Department Head',
      createdAt: now
    }).run();
    console.log("Added head@university.edu");
  } else {
    console.log("head@university.edu already exists.");
  }
}

addHead().catch(console.error);
