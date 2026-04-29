import Database from 'better-sqlite3';

const db = new Database('local.db');

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN student_id TEXT;
    ALTER TABLE users ADD COLUMN roll TEXT;
    ALTER TABLE users ADD COLUMN semester TEXT;
    ALTER TABLE users ADD COLUMN section TEXT;
    ALTER TABLE users ADD COLUMN account_status TEXT NOT NULL DEFAULT 'ACTIVE';
  `);
  console.log('Migration successful');
} catch (e) {
  console.log('Migration failed, possibly already run:', e.message);
}
