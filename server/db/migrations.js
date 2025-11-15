const migrations = [
  {
    id: 1,
    name: 'add_password_to_users',
    up: (db) => new Promise((resolve, reject) => {
      db.run('ALTER TABLE users ADD COLUMN password_hash TEXT', (err) => {
        if (err) return reject(err);
        resolve();
      });
    })
  },
  {
    id: 2,
    name: 'add_department_to_users',
    up: (db) => new Promise((resolve, reject) => {
      db.run('ALTER TABLE users ADD COLUMN department TEXT', (err) => {
        if (err) return reject(err);
        resolve();
      });
    })
  },
  {
    id: 3,
    name: 'add_gamification_columns_to_users',
    up: (db) => new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0', (err) => {
          if (err) return reject(err);
        });
        
        db.run('ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0', (err) => {
          if (err) return reject(err);
        });
        
        db.run('ALTER TABLE users ADD COLUMN last_streak_date TEXT', (err) => {
          if (err) return reject(err);
        });
        
        db.run('ALTER TABLE users ADD COLUMN badges TEXT DEFAULT "[]"', (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    })
  }
];

function ensureMigrationsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        run_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });
}

function getAppliedMigrations(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT id FROM migrations', [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((r) => r.id));
    });
  });
}

function markMigrationApplied(db, id, name) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO migrations (id, name) VALUES (?, ?)',
      [id, name],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

async function runMigrations(db) {
  await ensureMigrationsTable(db);
  const applied = await getAppliedMigrations(db);

  for (const m of migrations) {
    if (!applied.includes(m.id)) {
      console.log(`Applying migration #${m.id}: ${m.name}`);
      await m.up(db);
      await markMigrationApplied(db, m.id, m.name);
    }
  }

  console.log('All migrations applied');
}

module.exports = { runMigrations };
