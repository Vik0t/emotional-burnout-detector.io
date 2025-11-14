const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or connect to SQLite database
const dbPath = path.join(__dirname, '../burnout.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Migration functions
const migrations = [
  // Migration 1: Add department column to users table
  function migration1(callback) {
    db.run(`ALTER TABLE users ADD COLUMN department TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error in migration 1:', err.message);
        callback(err);
      } else {
        console.log('Migration 1 completed: Added department column to users table');
        callback(null);
      }
    });
  },
  
  // Migration 2: Add index for faster queries
  function migration2(callback) {
    db.run(`CREATE INDEX IF NOT EXISTS idx_test_results_employee_id ON test_results (employee_id)`, (err) => {
      if (err) {
        console.error('Error in migration 2:', err.message);
        callback(err);
      } else {
        console.log('Migration 2 completed: Added index to test_results table');
        callback(null);
      }
    });
  },
  
  // Migration 3: Add index for chat messages
  function migration3(callback) {
    db.run(`CREATE INDEX IF NOT EXISTS idx_chat_messages_employee_id ON chat_messages (employee_id)`, (err) => {
      if (err) {
        console.error('Error in migration 3:', err.message);
        callback(err);
      } else {
        console.log('Migration 3 completed: Added index to chat_messages table');
        callback(null);
      }
    });
  }
];

// Run all migrations
function runMigrations() {
  let currentMigration = 0;
  
  function next() {
    if (currentMigration < migrations.length) {
      migrations[currentMigration](function(err) {
        if (err) {
          console.error('Migration failed:', err.message);
          db.close();
          return;
        }
        currentMigration++;
        next();
      });
    } else {
      console.log('All migrations completed successfully');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  }
  
  next();
}

// Run migrations
runMigrations();