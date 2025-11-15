function getEmployeesWithStats(db, callback) {
  db.all(
    `SELECT
      u.employee_id,
      u.first_name,
      u.last_name,
      u.email,
      u.is_admin,
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

module.exports = {
  getEmployeesWithStats,
  // + остальные функции по аналогии
};
