import Database from 'better-sqlite3';

const db = new Database('local.db');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  console.log('Migration successful: created course_materials table.');
} catch (error) {
  console.error('Migration failed:', error.message);
} finally {
  db.close();
}
