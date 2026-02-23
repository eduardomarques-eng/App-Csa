import Database from "better-sqlite3";

const db = new Database("esquadrias.db");

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    refresh_token TEXT
  );

  CREATE TABLE IF NOT EXISTS catalogs (
    id TEXT PRIMARY KEY,
    manufacturer TEXT,
    name TEXT,
    pdf_url TEXT,
    data JSON
  );
`);

export default db;
