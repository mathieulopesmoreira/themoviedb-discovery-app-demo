import type { DatabaseSync } from 'node:sqlite';

export interface Country {
  code: string;
  name: string;
}

export function findCountryByCode(
  db: DatabaseSync,
  code: string,
): Country | undefined {
  const stmt = db.prepare('SELECT code, name FROM countries WHERE code = ?');
  const row = stmt.get(code.toUpperCase()) as
    | { code: string; name: string }
    | undefined;
  if (!row) return undefined;
  return { code: row.code, name: row.name };
}

export function findAllCountries(db: DatabaseSync): Country[] {
  const stmt = db.prepare('SELECT code, name FROM countries ORDER BY code ASC');
  const rows = stmt.all() as { code: string; name: string }[];
  return rows.map((r) => ({ code: r.code, name: r.name }));
}

export function upsertCountries(
  db: DatabaseSync,
  countries: Iterable<Country>,
): void {
  const countriesArray = Array.from(countries);
  if (countriesArray.length === 0) return;

  const uniqueMap = new Map<string, string>();
  for (const c of countriesArray) {
    const code = c.code.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) {
      throw new Error(`Invalid country code: "${c.code}"`);
    }
    if (!c.name || c.name.trim() === '') {
      throw new Error(`Invalid country name for code "${code}"`);
    }
    uniqueMap.set(code, c.name.trim());
  }

  db.exec('BEGIN TRANSACTION');
  try {
    const stmt = db.prepare(`
      INSERT INTO countries (code, name)
      VALUES (?, ?)
      ON CONFLICT(code) DO UPDATE SET name = excluded.name
    `);
    for (const [code, name] of uniqueMap.entries()) {
      stmt.run(code, name);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
