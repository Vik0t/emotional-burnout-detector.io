function findOrCreateUser(db, employeeId, callback) {
  db.get(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId],
    (err, user) => {
      if (err) return callback(err);

      if (!user) {
        db.run(
          'INSERT INTO users (employee_id) VALUES (?)',
          [employeeId],
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

  if (updates.length === 0) return callback(null);

  values.push(employeeId);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE employee_id = ?`;

  db.run(sql, values, (err) => callback(err));
}

module.exports = {
  findOrCreateUser,
  getUserByEmployeeId,
  updateUserTestInfo
};
