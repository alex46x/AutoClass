import Database from 'better-sqlite3';

const db = new Database('./sqlite.db');
try {
  db.exec("ALTER TABLE users ADD COLUMN designation TEXT DEFAULT 'Lecturer';");
  console.log("Added designation column successfully.");
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log("Column designation already exists.");
  } else {
    console.error("Error:", e);
  }
}
