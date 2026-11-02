import type { DatabaseSync } from 'node:sqlite';
import { parse } from 'csv-parse/sync';
import { upsertCountries, type Country } from './country-repository';

export function parseCountriesCsv(csvContent: string): Country[] {
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  if (cleanContent === '') {
    return [];
  }

  const records = parse(cleanContent, {
    columns: (headers: string[]) => {
      const lower = headers.map((h) => h.trim().toLowerCase());
      if (
        lower.length !== 2 ||
        !lower.includes('code') ||
        !lower.includes('name')
      ) {
        throw new Error('CSV headers must be exactly "code" and "name"');
      }
      return lower;
    },
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const countries: Country[] = [];
  for (const record of records) {
    const rawCode = record.code;
    const name = record.name;

    if (!rawCode || !/^[A-Za-z]{2}$/.test(rawCode.trim())) {
      throw new Error(`Invalid country code: "${rawCode}"`);
    }

    const code = rawCode.trim().toUpperCase();

    if (!name || name.trim() === '') {
      throw new Error(`Country name cannot be empty for code: ${code}`);
    }

    countries.push({ code, name: name.trim() });
  }

  return countries;
}

export function importCountriesFromCsv(
  db: DatabaseSync,
  csvContent: string,
): number {
  const countries = parseCountriesCsv(csvContent);
  if (countries.length === 0) {
    return 0;
  }
  upsertCountries(db, countries);
  return countries.length;
}

export function cleanUnusedCountries(db: DatabaseSync): number {
  const countBefore = (
    db.prepare('SELECT COUNT(*) as count FROM countries').get() as {
      count: number;
    }
  ).count;

  db.exec('BEGIN TRANSACTION');
  try {
    db.exec(`
      DELETE FROM countries 
      WHERE code NOT IN (SELECT DISTINCT country_code FROM production_countries)
    `);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const countAfter = (
    db.prepare('SELECT COUNT(*) as count FROM countries').get() as {
      count: number;
    }
  ).count;

  return countBefore - countAfter;
}
