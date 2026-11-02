import type { DatabaseSync } from 'node:sqlite';
import { parse } from 'csv-parse/sync';
import { upsertGenres, type Genre } from './genre-repository';

export function parseGenresCsv(csvContent: string): Genre[] {
  // Supprimer l'éventuel BOM UTF-8
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  if (cleanContent === '') {
    return [];
  }

  const records = parse(cleanContent, {
    columns: (headers: string[]) => {
      const lower = headers.map((h) => h.trim().toLowerCase());
      if (
        lower.length !== 2 ||
        !lower.includes('id') ||
        !lower.includes('name')
      ) {
        throw new Error('CSV headers must be exactly "id" and "name"');
      }
      return lower;
    },
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const genres: Genre[] = [];
  for (const record of records) {
    const rawId = record.id;
    const name = record.name;

    if (!rawId || !/^\d+$/.test(rawId)) {
      throw new Error(`Invalid genre id: "${rawId}"`);
    }

    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error(`Invalid genre id integer: "${rawId}"`);
    }

    if (!name || name.trim() === '') {
      throw new Error(`Genre name cannot be empty for id: ${id}`);
    }

    genres.push({ id, name: name.trim() });
  }

  return genres;
}

export function importGenresFromCsv(
  db: DatabaseSync,
  csvContent: string,
): number {
  const genres = parseGenresCsv(csvContent);
  if (genres.length === 0) {
    return 0;
  }
  upsertGenres(db, genres);
  return genres.length;
}

export function cleanUnusedGenres(db: DatabaseSync): number {
  const countBefore = (
    db.prepare('SELECT COUNT(*) as count FROM genres').get() as {
      count: number;
    }
  ).count;

  db.exec('BEGIN TRANSACTION');
  try {
    db.exec(`
      DELETE FROM genres 
      WHERE id NOT IN (SELECT DISTINCT genre_id FROM movie_genres)
    `);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const countAfter = (
    db.prepare('SELECT COUNT(*) as count FROM genres').get() as {
      count: number;
    }
  ).count;

  return countBefore - countAfter;
}
