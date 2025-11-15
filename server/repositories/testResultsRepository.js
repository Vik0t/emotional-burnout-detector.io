function saveTestResults(db, data, callback) {
  const {
    employeeId,
    emotionalExhaustion,
    depersonalization,
    personalAccomplishment,
    totalScore,
    answers
  } = data;

  const answersJson = JSON.stringify(answers || []);

  db.run(
    `INSERT INTO test_results (
      employee_id,
      emotional_exhaustion,
      depersonalization,
      personal_accomplishment,
      total_score,
      answers
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      employeeId,
      emotionalExhaustion,
      depersonalization,
      personalAccomplishment,
      totalScore,
      answersJson
    ],
    function (err) {
      if (err) return callback(err);
      callback(null, this.lastID);
    }
  );
}

function getLatestTestResults(db, employeeId, callback) {
  db.get(
    `SELECT * FROM test_results
     WHERE employee_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [employeeId],
    callback
  );
}

function getTestHistory(db, employeeId, callback) {
  db.all(
    `SELECT * FROM test_results
     WHERE employee_id = ?
     ORDER BY created_at DESC`,
    [employeeId],
    callback
  );
}

module.exports = {
  saveTestResults,
  getLatestTestResults,
  getTestHistory
};
