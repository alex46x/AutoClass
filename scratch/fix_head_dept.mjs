import Database from 'better-sqlite3';
import path from 'path';

// Try local.db first (the real DB)
const db = new Database(path.join(process.cwd(), 'local.db'));

// Check head user
const head = db.prepare("SELECT * FROM users WHERE email = 'head@university.edu'").get();
console.log("HEAD user:", head);

if (head) {
  if (!head.department_id) {
    // Assign to department 1 (Computer Science)
    db.prepare("UPDATE users SET department_id = 1 WHERE email = 'head@university.edu'").run();
    console.log("Updated head@university.edu to departmentId = 1");
  } else {
    console.log("HEAD already has departmentId:", head.department_id);
  }
} else {
  console.log("HEAD user not found! Run the seed endpoint first.");
}

// Also check designation column exists
const cols = db.prepare("PRAGMA table_info(users)").all();
console.log("User columns:", cols.map(c => c.name));
