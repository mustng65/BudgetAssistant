import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

import logger from '../logging/logger.js';

const DEFAULT_SQLITE_DB_PATH = path.resolve(process.cwd(), 'data', 'budgetassistant.db');

let database = null;

export const getSqliteDbPath = () => process.env.SQLITE_DB_PATH || DEFAULT_SQLITE_DB_PATH;

export const initializeDatabase = () => {
  if (database) {
    return database;
  }

  const dbPath = getSqliteDbPath();
  const dbDirectory = path.dirname(dbPath);

  if (!fs.existsSync(dbDirectory)) {
    logger.info(`Creating SQLite directory '${dbDirectory}'...`);
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  database = new Database(dbPath);
  database.pragma('journal_mode = WAL');

  database.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budget_snapshots (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  logger.info('SQLite database initialized.', { path: dbPath });
  return database;
};

export const getDatabase = () => {
  if (!database) {
    return initializeDatabase();
  }

  return database;
};

export const closeDatabase = () => {
  if (database) {
    database.close();
    database = null;
    logger.info('SQLite database closed.');
  }
};

export const getAllSettings = () => {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
};

export const getSetting = (key, fallback = null) => {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
};

export const setSetting = (key, value) => {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, String(value));
};

export const saveBudgetSnapshot = (month, payload) => {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO budget_snapshots (id, month, payload, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(month) DO UPDATE SET
      payload = excluded.payload,
      updated_at = CURRENT_TIMESTAMP
  `).run(`${month}-${Date.now()}`, month, JSON.stringify(payload));
};

export const getBudgetSnapshot = (month) => {
  const db = getDatabase();
  const row = db.prepare('SELECT payload FROM budget_snapshots WHERE month = ?').get(month);

  if (!row) {
    return null;
  }

  return JSON.parse(row.payload);
};
