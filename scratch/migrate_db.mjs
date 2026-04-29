import Database from 'better-sqlite3';

const db = new Database('local.db');

// Create new tables
db.exec(`
  CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    semester_id INTEGER NOT NULL
  );
`);

// Try to add missing columns to users
const addColumn = (col, def) => {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
    console.log(`Added column ${col}`);
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log(`Column ${col} already exists.`);
    } else {
      console.error(`Error adding ${col}: ${e.message}`);
    }
  }
};

addColumn('semester_id', 'INTEGER');
addColumn('section_id', 'INTEGER');
addColumn('student_id', 'TEXT');
addColumn('roll', 'TEXT');
addColumn('account_status', "TEXT NOT NULL DEFAULT 'ACTIVE'");

console.log("Migration complete!");
db.close();
