import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'local.db'));

try {
  db.prepare("ALTER TABLE sections ADD COLUMN department_id INTEGER").run();
  console.log("Successfully added department_id to sections.");
} catch (e: any) {
  if (e.message.includes('duplicate column name')) {
    console.log("Column already exists.");
  } else {
    console.error("Error adding column:", e.message);
  }
}
