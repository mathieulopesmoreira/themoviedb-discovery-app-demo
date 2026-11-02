import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const DEFAULT_DB_PATH = './data/movies.sqlite';

export function getDatabase(dbPath: string = DEFAULT_DB_PATH): DatabaseSync {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export function initDatabaseSchema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS countries (
      code TEXT PRIMARY KEY CHECK (length(code) = 2),
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      original_title TEXT,
      overview TEXT,
      release_date TEXT,
      release_year INTEGER,
      runtime INTEGER CHECK (runtime IS NULL OR runtime > 0),
      budget INTEGER CHECK (budget IS NULL OR budget > 0),
      revenue INTEGER CHECK (revenue IS NULL OR revenue > 0),
      vote_average REAL,
      vote_count INTEGER,
      popularity REAL,
      poster_path TEXT,
      backdrop_path TEXT
    );

    CREATE TABLE IF NOT EXISTS movie_genres (
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY (movie_id, genre_id)
    );

    CREATE TABLE IF NOT EXISTS production_countries (
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
      PRIMARY KEY (movie_id, country_code)
    );
  `);
}

export function createAndInitDatabase(
  dbPath: string = DEFAULT_DB_PATH,
): DatabaseSync {
  const db = getDatabase(dbPath);
  initDatabaseSchema(db);
  return db;
}
