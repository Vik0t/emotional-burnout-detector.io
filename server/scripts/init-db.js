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

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    telegram_chat_id TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    department TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    last_test_date DATETIME,
    next_test_date DATETIME,
    notifications_enabled BOOLEAN DEFAULT TRUE
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready.');
    }
  });

  // Create test_results table
  db.run(`CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    emotional_exhaustion INTEGER NOT NULL,
    depersonalization INTEGER NOT NULL,
    personal_accomplishment INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    answers TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users (employee_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating test_results table:', err.message);
    } else {
      console.log('Test results table ready.');
    }
  });

  // Create chat_messages table
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users (employee_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating chat_messages table:', err.message);
    } else {
      console.log('Chat messages table ready.');
    }
  });

  // Create some default admin user for testing
  db.run(`INSERT OR IGNORE INTO users (employee_id, first_name, is_admin) VALUES ('2', 'Admin', TRUE)`, (err) => {
    if (err) {
      console.error('Error creating default admin user:', err.message);
    } else {
      console.log('Default admin user created.');
    }
  });
  
  // Ensure existing user with employee_id '2' is admin
  db.run(`UPDATE users SET is_admin = TRUE, first_name = 'Admin' WHERE employee_id = '2'`, (err) => {
    if (err) {
      console.error('Error updating admin user:', err.message);
    } else {
      console.log('Admin user status updated.');
    }
  });

  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}

// Initialize database
initializeDatabase();