import type { DatabaseSync } from 'node:sqlite';

export interface Genre {
  id: number;
  name: string;
}

export function findGenreById(db: DatabaseSync, id: number): Genre | undefined {
  const stmt = db.prepare('SELECT id, name FROM genres WHERE id = ?');
  const row = stmt.get(id) as { id: number; name: string } | undefined;
  if (!row) return undefined;
  return { id: row.id, name: row.name };
}

export function findAllGenres(db: DatabaseSync): Genre[] {
  const stmt = db.prepare('SELECT id, name FROM genres ORDER BY id ASC');
  const rows = stmt.all() as { id: number; name: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export function upsertGenres(db: DatabaseSync, genres: Iterable<Genre>): void {
  const genresArray = Array.from(genres);
  if (genresArray.length === 0) return;

  // Si un identifiant apparaît plusieurs fois, le dernier libellé fourni est conservé
  const uniqueMap = new Map<number, string>();
  for (const g of genresArray) {
    if (!g.name || g.name.trim() === '') {
      throw new Error(`Invalid genre name for id ${g.id}`);
    }
    uniqueMap.set(g.id, g.name.trim());
  }

  db.exec('BEGIN TRANSACTION');
  try {
    const stmt = db.prepare(`
      INSERT INTO genres (id, name)
      VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name
    `);
    for (const [id, name] of uniqueMap.entries()) {
      stmt.run(id, name);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
