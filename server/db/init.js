function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // users
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          telegram_chat_id TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          last_test_date DATETIME,
          next_test_date DATETIME,
          notifications_enabled BOOLEAN DEFAULT TRUE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
          return reject(err);
        } else {
          console.log('Users table ready.');
        }
      });

      // test_results
      db.run(`
        CREATE TABLE IF NOT EXISTS test_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT NOT NULL,
          emotional_exhaustion INTEGER NOT NULL,
          depersonalization INTEGER NOT NULL,
          personal_accomplishment INTEGER NOT NULL,
          total_score INTEGER NOT NULL,
          answers TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES users (employee_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating test_results table:', err.message);
          return reject(err);
        } else {
          console.log('Test results table ready.');
        }
      });

      // chat_messages
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT NOT NULL,
          message TEXT NOT NULL,
          response TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES users (employee_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating chat_messages table:', err.message);
          return reject(err);
        } else {
          console.log('Chat messages table ready.');
        }
      });

      // дефолтный админ
      db.run(`
        INSERT OR IGNORE INTO users (employee_id, first_name, is_admin)
        VALUES ('2', 'Admin', TRUE)
      `, (err) => {
        if (err) {
          console.error('Error creating default admin user:', err.message);
          return reject(err);
        } else {
          console.log('Default admin user created.');
          resolve();
        }
      });
    });
  });
}

module.exports = { initializeDatabase };