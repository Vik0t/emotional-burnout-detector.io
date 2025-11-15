function getEmployeesWithStats(db, callback) {
  db.all(
    `SELECT
      u.employee_id,
      u.first_name,
      u.last_name,
      u.email,
      u.is_admin,
      u.department,
      u.created_at,
      u.last_login,
      COUNT(tr.id) as test_count,
      MAX(tr.created_at) as last_test_date,
      MAX(tr.total_score) as last_score
    FROM users u
    LEFT JOIN test_results tr ON u.employee_id = tr.employee_id
    GROUP BY u.employee_id
    ORDER BY u.created_at DESC`,
    [],
    callback
  );
}

function getRiskDistribution(db, callback) {
  db.all(
    `SELECT
      CASE
        WHEN tr.total_score > 50 THEN 'high'
        WHEN tr.total_score > 30 THEN 'medium'
        ELSE 'low'
      END as risk_level,
      COUNT(*) as count
    FROM (
      SELECT employee_id, MAX(created_at) as latest_test
      FROM test_results
      GROUP BY employee_id
    ) latest_tests
    JOIN test_results tr ON latest_tests.employee_id = tr.employee_id AND latest_tests.latest_test = tr.created_at
    GROUP BY
      CASE
        WHEN tr.total_score > 50 THEN 'high'
        WHEN tr.total_score > 30 THEN 'medium'
        ELSE 'low'
      END`,
    [],
    callback
  );
}

function getDepartmentsStats(db, callback) {
  db.all(
    `SELECT
      COALESCE(u.department, 'Не указано') as name,
      COUNT(u.employee_id) as employees,
      COALESCE(ROUND(AVG(tr.total_score), 1), 0) as avg_score,
      COUNT(CASE WHEN tr.total_score > 50 THEN 1 END) as at_risk
    FROM users u
    LEFT JOIN (
      SELECT employee_id, total_score
      FROM test_results tr1
      WHERE tr1.created_at = (
        SELECT MAX(tr2.created_at)
        FROM test_results tr2
        WHERE tr2.employee_id = tr1.employee_id
      )
    ) tr ON u.employee_id = tr.employee_id
    WHERE u.department IS NOT NULL
    GROUP BY u.department
    ORDER BY avg_score DESC`,
    [],
    callback
  );
}

function getHrStats(db, callback) {
  // Get total employees
  db.get('SELECT COUNT(*) as total_employees FROM users', (err, totalRow) => {
    if (err) return callback(err);
    
    // Get recent tests (last 30 days)
    db.get(
      `SELECT COUNT(DISTINCT employee_id) as recent_tests
       FROM test_results
       WHERE created_at > datetime('now', '-30 days')`,
      (err, testsRow) => {
        if (err) return callback(err);
        
        // Get risk distribution
        getRiskDistribution(db, (err, riskRows) => {
          if (err) return callback(err);
          
          // Convert to the format expected by frontend
          const riskDistribution = {
            high: 0,
            medium: 0,
            low: 0
          };
          
          riskRows.forEach(row => {
            riskDistribution[row.risk_level] = row.count;
          });
          
          const stats = {
            total_employees: totalRow.total_employees,
            recent_tests: testsRow.recent_tests || 0,
            high_risk_count: riskDistribution.high,
            medium_risk_count: riskDistribution.medium,
            low_risk_count: riskDistribution.low
          };
          
          callback(null, stats);
        });
      }
    );
  });
}

module.exports = {
  getEmployeesWithStats,
  getRiskDistribution,
  getDepartmentsStats,
  getHrStats
};
