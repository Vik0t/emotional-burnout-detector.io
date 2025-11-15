const bcrypt = require('bcrypt');

function findOrCreateUser(db, employeeId, password, callback) {
  db.get(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId],
    (err, user) => {
      if (err) return callback(err);

      if (!user) {
        // Hash password for new user
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
          if (hashErr) return callback(hashErr);

          db.run(
            'INSERT INTO users (employee_id, password_hash) VALUES (?, ?)',
            [employeeId, hashedPassword],
            function (insertErr) {
              if (insertErr) return callback(insertErr);

              db.get(
                'SELECT * FROM users WHERE id = ?',
                [this.lastID],
                (err2, newUser) => {
                  if (err2) return callback(err2);
                  callback(null, newUser, true);
                }
              );
            }
          );
        });
      } else {
        callback(null, user, false);
      }
    }
  );
}

function getUserByEmployeeId(db, employeeId, callback) {
  db.get(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId],
    callback
  );
}

function updateUserTestInfo(db, employeeId, fields, callback) {
  const updates = [];
  const values = [];

  if (fields.last_test_date !== undefined) {
    updates.push('last_test_date = ?');
    values.push(fields.last_test_date);
  }
  if (fields.next_test_date !== undefined) {
    updates.push('next_test_date = ?');
    values.push(fields.next_test_date);
  }
  if (fields.notifications_enabled !== undefined) {
    updates.push('notifications_enabled = ?');
    values.push(fields.notifications_enabled ? 1 : 0);
  }
  if (fields.last_login !== undefined) {
    updates.push('last_login = ?');
    values.push(fields.last_login);
  }
  if (fields.points !== undefined) {
    updates.push('points = ?');
    values.push(fields.points);
  }
  if (fields.streak !== undefined) {
    updates.push('streak = ?');
    values.push(fields.streak);
  }
  if (fields.last_streak_date !== undefined) {
    updates.push('last_streak_date = ?');
    values.push(fields.last_streak_date);
  }
  if (fields.badges !== undefined) {
    updates.push('badges = ?');
    values.push(fields.badges);
  }

  if (updates.length === 0) return callback(null);

  values.push(employeeId);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE employee_id = ?`;

  db.run(sql, values, (err) => callback(err));
}

// Function to get user gamification data
function getUserGamificationData(db, employeeId, callback) {
  db.get(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId],
    (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(null, null);
      
      // Check if gamification columns exist
      const hasGamificationColumns = 'points' in row && 'streak' in row && 'badges' in row;
      
      if (hasGamificationColumns) {
        try {
          const badges = row.badges ? JSON.parse(row.badges) : [];
          callback(null, {
            points: row.points || 0,
            streak: row.streak || 0,
            last_streak_date: row.last_streak_date,
            badges: badges
          });
        } catch (parseErr) {
          callback(parseErr);
        }
      } else {
        // Return default values if columns don't exist
        callback(null, {
          points: 0,
          streak: 0,
          last_streak_date: null,
          badges: []
        });
      }
    }
  );
}

// Function to update user points
function updateUserPoints(db, employeeId, points, callback) {
  db.run(
    'UPDATE users SET points = points + ? WHERE employee_id = ?',
    [points, employeeId],
    callback
  );
}

// Function to update user streak
function updateUserStreak(db, employeeId, streak, lastStreakDate, callback) {
  db.run(
    'UPDATE users SET streak = ?, last_streak_date = ? WHERE employee_id = ?',
    [streak, lastStreakDate, employeeId],
    callback
  );
}

// Function to add badge to user
function addUserBadge(db, employeeId, badge, callback) {
  db.get(
    'SELECT badges FROM users WHERE employee_id = ?',
    [employeeId],
    (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error('User not found'));
      
      try {
        const badges = row.badges ? JSON.parse(row.badges) : [];
        if (!badges.includes(badge)) {
          badges.push(badge);
          db.run(
            'UPDATE users SET badges = ? WHERE employee_id = ?',
            [JSON.stringify(badges), employeeId],
            callback
          );
        } else {
          callback(null);
        }
      } catch (parseErr) {
        callback(parseErr);
      }
    }
  );
}

function verifyUserPassword(db, employeeId, password, callback) {
  db.get(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId],
    (err, user) => {
      if (err) return callback(err);
      if (!user) return callback(null, false);
      
      // If user doesn't have a password hash, they can't login with password
      if (!user.password_hash) return callback(null, false);
      
      bcrypt.compare(password, user.password_hash, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    }
  );
}

module.exports = {
  findOrCreateUser,
  getUserByEmployeeId,
  updateUserTestInfo,
  verifyUserPassword,
  getUserGamificationData,
  updateUserPoints,
  updateUserStreak,
  addUserBadge
};
