const db = require('../db/connection');
const { initializeDatabase } = require('../db/init');

initializeDatabase(db)
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  })
  .finally(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err.message);
      else console.log('Database connection closed.');
    });
  });
