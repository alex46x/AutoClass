import Database from 'better-sqlite3';

const db = new Database('local.db');

try {
  db.exec(`
    ALTER TABLE exams ADD COLUMN date TEXT;
    ALTER TABLE exams ADD COLUMN start_time TEXT;
  `);
  console.log('Migration successful: added date and start_time to exams table.');
} catch (error) {
  console.error('Migration failed (maybe columns already exist?):', error.message);
} finally {
  db.close();
}
