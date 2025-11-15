function saveChatMessage(db, employeeId, message, response, callback) {
  db.run(
    'INSERT INTO chat_messages (employee_id, message, response) VALUES (?, ?, ?)',
    [employeeId, message, response],
    (err) => callback(err)
  );
}

function getChatHistory(db, employeeId, callback) {
  db.all(
    `SELECT * FROM chat_messages
     WHERE employee_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [employeeId],
    callback
  );
}

module.exports = {
  saveChatMessage,
  getChatHistory
};
