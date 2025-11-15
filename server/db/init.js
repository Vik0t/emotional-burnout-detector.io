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
        INSERT OR IGNORE INTO users (employee_id, first_name, is_admin, department)
        VALUES ('2', 'Admin', TRUE, 'Управление')
      `, (err) => {
        if (err) {
          console.error('Error creating default admin user:', err.message);
          return reject(err);
        } else {
          // Set default password for admin user
          const bcrypt = require('bcrypt');
          const saltRounds = 10;
          const defaultPassword = 'admin123';
          
          bcrypt.hash(defaultPassword, saltRounds, (hashErr, hashedPassword) => {
            if (hashErr) {
              console.error('Error hashing default password:', hashErr.message);
              return reject(hashErr);
            }
            
            db.run(`
              UPDATE users
              SET password_hash = ?
              WHERE employee_id = '2'
            `, [hashedPassword], (updateErr) => {
              if (updateErr) {
                console.error('Error setting default password:', updateErr.message);
                return reject(updateErr);
              } else {
                console.log('Default admin user created with password.');
                resolve();
              }
            });
          });
        }
      });
      
      // Add sample users with departments
      const sampleUsers = [
        { employee_id: '1', first_name: 'Иван', last_name: 'Иванов', department: 'IT' },
        { employee_id: '3', first_name: 'Петр', last_name: 'Петров', department: 'Логистика' },
        { employee_id: '4', first_name: 'Мария', last_name: 'Сидорова', department: 'Курьеры' },
        { employee_id: '5', first_name: 'Анна', last_name: 'Кузнецова', department: 'Клиент. сервис' }
      ];
      
      // Add sample gamification data after users are created
      setTimeout(() => {
        const gamificationData = [
          { employee_id: '1', points: 150, streak: 7, badges: '["test_taker", "improvement_champion", "7_day_streak"]' },
          { employee_id: '3', points: 120, streak: 5, badges: '["test_taker"]' },
          { employee_id: '4', points: 100, streak: 3, badges: '["test_taker"]' },
          { employee_id: '5', points: 90, streak: 2, badges: '["test_taker"]' }
        ];
        
        gamificationData.forEach(data => {
          db.run(`
            UPDATE users
            SET points = ?, streak = ?, badges = ?
            WHERE employee_id = ?
          `, [data.points, data.streak, data.badges, data.employee_id], (err) => {
            if (err) {
              console.error('Error updating gamification data:', err.message);
            }
          });
        });
      }, 1000);
      
      let completed = 0;
      sampleUsers.forEach(user => {
        db.run(`
          INSERT OR IGNORE INTO users (employee_id, first_name, last_name, department)
          VALUES (?, ?, ?, ?)
        `, [user.employee_id, user.first_name, user.last_name, user.department], (err) => {
          if (err) {
            console.error('Error creating sample user:', err.message);
          } else {
            completed++;
            if (completed === sampleUsers.length) {
              console.log('Sample users created.');
              // Add sample test results
              addSampleTestResults(db, () => {
                console.log('Sample data initialization complete.');
                resolve();
              });
            }
          }
        });
      });
    });
  });
}

function addSampleTestResults(db, callback) {
  // Add sample test results for users
  const sampleTestResults = [
    { employee_id: '1', emotional_exhaustion: 15, depersonalization: 8, personal_accomplishment: 25, total_score: 48, answers: '[1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4]' },
    { employee_id: '3', emotional_exhaustion: 22, depersonalization: 15, personal_accomplishment: 18, total_score: 55, answers: '[3,4,5,4,3,2,1,2,3,4,5,4,3,2,1,2,3,4,5,4,3,2,1,2]' },
    { employee_id: '4', emotional_exhaustion: 25, depersonalization: 18, personal_accomplishment: 12, total_score: 55, answers: '[4,5,5,4,3,3,2,1,2,3,4,5,5,4,3,3,2,1,2,3,4,5,5,4]' },
    { employee_id: '5', emotional_exhaustion: 18, depersonalization: 12, personal_accomplishment: 22, total_score: 52, answers: '[2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1]' }
  ];
  
  let completed = 0;
  sampleTestResults.forEach(result => {
    db.run(`
      INSERT INTO test_results (employee_id, emotional_exhaustion, depersonalization, personal_accomplishment, total_score, answers)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [result.employee_id, result.emotional_exhaustion, result.depersonalization, result.personal_accomplishment, result.total_score, result.answers], (err) => {
      if (err) {
        console.error('Error creating sample test result:', err.message);
      } else {
        completed++;
        if (completed === sampleTestResults.length) {
          console.log('Sample test results created.');
          callback();
        }
      }
    });
  });
}

module.exports = { initializeDatabase };