import type { DatabaseSync } from 'node:sqlite';
import { parse } from 'csv-parse/sync';
import { upsertMovies, type MovieRecord } from './movie-repository';

export function parseMoviesCsv(csvContent: string): MovieRecord[] {
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  if (cleanContent === '') {
    return [];
  }

  const records = parse(cleanContent, {
    columns: (headers: string[]) => headers.map((h) => h.trim().toLowerCase()),
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const movies: MovieRecord[] = [];
  for (const record of records) {
    const rawId = record.id;
    const title = record.title;

    if (!rawId || !/^\d+$/.test(rawId)) {
      throw new Error(`Invalid movie id: "${rawId}"`);
    }

    const id = Number(rawId);
    if (!title || title.trim() === '') {
      throw new Error(`Movie title cannot be empty for id: ${id}`);
    }

    const genre_ids = record.genre_ids
      ? record.genre_ids
          .split(/[,;|]/)
          .map((g) => Number(g.trim()))
          .filter((g) => !isNaN(g) && g > 0)
      : [];

    const country_codes = record.country_codes
      ? record.country_codes
          .split(/[,;|]/)
          .map((c) => c.trim().toUpperCase())
          .filter((c) => /^[A-Z]{2}$/.test(c))
      : [];

    movies.push({
      id,
      title: title.trim(),
      original_title: record.original_title
        ? record.original_title.trim()
        : null,
      overview: record.overview ? record.overview.trim() : null,
      release_date: record.release_date ? record.release_date.trim() : null,
      release_year: record.release_year ? Number(record.release_year) : null,
      runtime: record.runtime ? Number(record.runtime) : null,
      budget: record.budget ? Number(record.budget) : null,
      revenue: record.revenue ? Number(record.revenue) : null,
      vote_average: record.vote_average ? Number(record.vote_average) : null,
      vote_count: record.vote_count ? Number(record.vote_count) : null,
      popularity: record.popularity ? Number(record.popularity) : null,
      poster_path: record.poster_path ? record.poster_path.trim() : null,
      backdrop_path: record.backdrop_path ? record.backdrop_path.trim() : null,
      genre_ids,
      country_codes,
    });
  }

  return movies;
}

export function importMoviesFromCsv(
  db: DatabaseSync,
  csvContent: string,
): number {
  const movies = parseMoviesCsv(csvContent);
  if (movies.length === 0) {
    return 0;
  }
  upsertMovies(db, movies);
  return movies.length;
}
