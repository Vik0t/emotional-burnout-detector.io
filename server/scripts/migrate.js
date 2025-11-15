const db = require('../db/connection');
const { runMigrations } = require('../db/migrations');

runMigrations(db)
  .then(() => {
    console.log('Migrations completed successfully');
  })
  .catch((err) => {
    console.error('Migrations failed:', err);
  })
  .finally(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err.message);
      else console.log('Database connection closed.');
    });
  });
