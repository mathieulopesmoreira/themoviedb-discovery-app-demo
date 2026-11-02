import { describe, expect, it } from 'vitest';
import { getDatabase, initDatabaseSchema } from './database/schema';
import {
  findGenreById,
  findAllGenres,
  upsertGenres,
} from './database/genre-repository';
import {
  findCountryByCode,
  findAllCountries,
  upsertCountries,
} from './database/country-repository';
import {
  findMovieById,
  findAllMovies,
  upsertMovies,
  getDashboardStats,
} from './database/movie-repository';
import {
  parseGenresCsv,
  importGenresFromCsv,
  cleanUnusedGenres,
} from './database/genre-csv';
import {
  parseCountriesCsv,
  importCountriesFromCsv,
  cleanUnusedCountries,
} from './database/country-csv';

describe('SQLite Database & Repositories', () => {
  it('creates schema and executes without errors', () => {
    const db = getDatabase(':memory:');
    initDatabaseSchema(db);
    expect(db).toBeDefined();
    db.close();
  });

  describe('Genre Repository & CSV', () => {
    it('manages genres lifecycle and upserts', () => {
      const db = getDatabase(':memory:');
      initDatabaseSchema(db);

      // Search absent
      expect(findGenreById(db, 28)).toBeUndefined();
      expect(findAllGenres(db)).toEqual([]);

      // Upsert
      upsertGenres(db, [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 28, name: 'Action & Explosions' }, // Duplicate, last wins
      ]);

      expect(findAllGenres(db)).toHaveLength(2);
      expect(findGenreById(db, 28)?.name).toBe('Action & Explosions');

      // Empty iterable does nothing
      upsertGenres(db, []);
      expect(findAllGenres(db)).toHaveLength(2);

      // CSV Import
      const csv = `id,name\n16,Animation\n35,Comedy\n`;
      const imported = importGenresFromCsv(db, csv);
      expect(imported).toBe(2);
      expect(findAllGenres(db)).toHaveLength(4);

      // Clean unused genres
      const cleaned = cleanUnusedGenres(db);
      expect(cleaned).toBe(4);
      expect(findAllGenres(db)).toHaveLength(0);

      db.close();
    });

    it('validates CSV headers and content', () => {
      expect(parseGenresCsv('')).toEqual([]);
      expect(() => parseGenresCsv('code,name\n28,Action')).toThrow();
      expect(() => parseGenresCsv('id,name\ninvalid,Action')).toThrow();
      expect(() => parseGenresCsv('id,name\n28, ')).toThrow();
    });
  });

  describe('Country Repository & CSV', () => {
    it('manages countries lifecycle and upserts', () => {
      const db = getDatabase(':memory:');
      initDatabaseSchema(db);

      expect(findCountryByCode(db, 'FR')).toBeUndefined();
      expect(findAllCountries(db)).toEqual([]);

      upsertCountries(db, [
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
        { code: 'FR', name: 'République Française' },
      ]);

      expect(findAllCountries(db)).toHaveLength(2);
      expect(findCountryByCode(db, 'fr')?.name).toBe('République Française');

      upsertCountries(db, []);
      expect(findAllCountries(db)).toHaveLength(2);

      const csv = `code,name\nGB,United Kingdom\nCA,Canada\n`;
      const imported = importCountriesFromCsv(db, csv);
      expect(imported).toBe(2);
      expect(findAllCountries(db)).toHaveLength(4);

      const cleaned = cleanUnusedCountries(db);
      expect(cleaned).toBe(4);
      expect(findAllCountries(db)).toHaveLength(0);

      db.close();
    });

    it('validates Country CSV headers and content', () => {
      expect(parseCountriesCsv('')).toEqual([]);
      expect(() => parseCountriesCsv('id,name\nFR,France')).toThrow();
      expect(() => parseCountriesCsv('code,name\nF,France')).toThrow();
      expect(() => parseCountriesCsv('code,name\nFR, ')).toThrow();
    });
  });

  describe('Movie Repository & Dashboard Stats', () => {
    it('stores movies, relations and computes dashboard stats', () => {
      const db = getDatabase(':memory:');
      initDatabaseSchema(db);

      // Seed genres and countries
      upsertGenres(db, [
        { id: 28, name: 'Action' },
        { id: 18, name: 'Drame' },
      ]);
      upsertCountries(db, [
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States of America' },
      ]);

      // Seed movies
      upsertMovies(db, [
        {
          id: 1,
          title: 'Movie Alpha',
          release_date: '2024-05-10',
          runtime: 120,
          budget: 1000000,
          revenue: 3000000,
          vote_average: 8.5,
          vote_count: 500,
          popularity: 250.5,
          genre_ids: [28],
          country_codes: ['US'],
        },
        {
          id: 2,
          title: 'Movie Beta',
          release_date: '2025-08-20',
          runtime: 90,
          budget: 2000000,
          revenue: 1000000,
          vote_average: 6.5,
          vote_count: 200,
          popularity: 150.0,
          genre_ids: [18],
          country_codes: ['FR'],
        },
      ]);

      expect(findAllMovies(db)).toHaveLength(2);
      const m1 = findMovieById(db, 1);
      expect(m1?.title).toBe('Movie Alpha');
      expect(m1?.release_year).toBe(2024);
      expect(m1?.genre_ids).toEqual([28]);
      expect(m1?.country_codes).toEqual(['US']);

      const stats = getDashboardStats(db);
      expect(stats.filmsCount).toBe(2);
      expect(stats.minYear).toBe(2024);
      expect(stats.maxYear).toBe(2025);
      expect(stats.averageRuntime).toBe(105);
      expect(stats.averageRating).toBe(7.5);
      expect(stats.bestRatedMovie?.id).toBe(1);
      expect(stats.mostPopularMovie?.id).toBe(1);
      expect(stats.mostProfitableMovie?.id).toBe(1);
      expect(stats.leastProfitableMovie?.id).toBe(2);
      expect(stats.genresCount).toBe(2);

      db.close();
    });
  });
});
