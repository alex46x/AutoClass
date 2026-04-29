import Database from 'better-sqlite3';

const files = ['campusflow.db', 'local.db'];

for (const f of files) {
  try {
    const db = new Database(f);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(f, '→ tables:', tables.map(t => t.name).join(', '));

    const hasTable = tables.some(t => t.name === 'student_removal_requests');
    if (!hasTable) {
      db.exec(`CREATE TABLE IF NOT EXISTS student_removal_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cr_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        admin_note TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )`);
      console.log(f, '→ Created student_removal_requests table ✓');
    } else {
      console.log(f, '→ Table already exists ✓');
    }
    db.close();
  } catch (e) {
    console.log(f, '→ Error:', e.message);
  }
}
