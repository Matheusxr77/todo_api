const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('Alta', 'Média', 'Baixa')) NOT NULL,
    status TEXT DEFAULT 'pendente',
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
});

module.exports = db;