import type { DatabaseSync } from 'node:sqlite';

export interface MovieRecord {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  release_date?: string | null;
  release_year?: number | null;
  runtime?: number | null;
  budget?: number | null;
  revenue?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
  popularity?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  country_codes?: string[];
}

export interface DashboardStats {
  filmsCount: number;
  minYear: number | null;
  maxYear: number | null;
  averageRuntime: number | null;
  averageRating: number | null;
  topCountry: { code: string; name: string; count: number } | null;
  bestRatedMovie: {
    id: number;
    title: string;
    release_year: number | null;
    vote_average: number;
    poster_path: string | null;
  } | null;
  mostPopularMovie: {
    id: number;
    title: string;
    release_year: number | null;
    popularity: number;
    poster_path: string | null;
  } | null;
  mostProfitableMovie: {
    id: number;
    title: string;
    release_year: number | null;
    roi: number;
    poster_path: string | null;
  } | null;
  leastProfitableMovie: {
    id: number;
    title: string;
    release_year: number | null;
    roi: number;
    poster_path: string | null;
  } | null;
  genresCount: number;
  dominantGenre: { id: number; name: string; count: number } | null;
  bestRatedGenre: { id: number; name: string; average_rating: number } | null;
  bestWeightedGenre: {
    id: number;
    name: string;
    weighted_rating: number;
  } | null;
}

export function findMovieById(
  db: DatabaseSync,
  id: number,
): MovieRecord | undefined {
  const stmt = db.prepare('SELECT * FROM movies WHERE id = ?');
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;

  const genreStmt = db.prepare(
    'SELECT genre_id FROM movie_genres WHERE movie_id = ? ORDER BY genre_id ASC',
  );
  const genreRows = genreStmt.all(id) as { genre_id: number }[];

  const countryStmt = db.prepare(
    'SELECT country_code FROM production_countries WHERE movie_id = ? ORDER BY country_code ASC',
  );
  const countryRows = countryStmt.all(id) as { country_code: string }[];

  return {
    id: row.id as number,
    title: row.title as string,
    original_title: (row.original_title as string) || null,
    overview: (row.overview as string) || null,
    release_date: (row.release_date as string) || null,
    release_year: (row.release_year as number) || null,
    runtime: (row.runtime as number) || null,
    budget: (row.budget as number) || null,
    revenue: (row.revenue as number) || null,
    vote_average: (row.vote_average as number) || null,
    vote_count: (row.vote_count as number) || null,
    popularity: (row.popularity as number) || null,
    poster_path: (row.poster_path as string) || null,
    backdrop_path: (row.backdrop_path as string) || null,
    genre_ids: genreRows.map((g) => g.genre_id),
    country_codes: countryRows.map((c) => c.country_code),
  };
}

export function findAllMovies(db: DatabaseSync): MovieRecord[] {
  const stmt = db.prepare('SELECT id FROM movies ORDER BY id ASC');
  const rows = stmt.all() as { id: number }[];
  return rows.map((r) => findMovieById(db, r.id)!);
}

export function upsertMovies(
  db: DatabaseSync,
  movies: Iterable<MovieRecord>,
): void {
  const moviesArray = Array.from(movies);
  if (moviesArray.length === 0) return;

  db.exec('BEGIN TRANSACTION');
  try {
    const movieStmt = db.prepare(`
      INSERT INTO movies (
        id, title, original_title, overview, release_date, release_year,
        runtime, budget, revenue, vote_average, vote_count, popularity,
        poster_path, backdrop_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        original_title = excluded.original_title,
        overview = excluded.overview,
        release_date = excluded.release_date,
        release_year = excluded.release_year,
        runtime = excluded.runtime,
        budget = excluded.budget,
        revenue = excluded.revenue,
        vote_average = excluded.vote_average,
        vote_count = excluded.vote_count,
        popularity = excluded.popularity,
        poster_path = excluded.poster_path,
        backdrop_path = excluded.backdrop_path
    `);

    const delGenresStmt = db.prepare(
      'DELETE FROM movie_genres WHERE movie_id = ?',
    );
    const insGenreStmt = db.prepare(
      'INSERT OR IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
    );

    const delCountriesStmt = db.prepare(
      'DELETE FROM production_countries WHERE movie_id = ?',
    );
    const insCountryStmt = db.prepare(
      'INSERT OR IGNORE INTO production_countries (movie_id, country_code) VALUES (?, ?)',
    );

    for (const m of moviesArray) {
      if (!m.id || !m.title) {
        throw new Error('Movie must have id and title');
      }

      let year: number | null = null;
      if (m.release_date && /^\d{4}/.test(m.release_date)) {
        year = parseInt(m.release_date.slice(0, 4), 10);
      } else if (m.release_year) {
        year = m.release_year;
      }

      const validRuntime = m.runtime && m.runtime > 0 ? m.runtime : null;
      const validBudget = m.budget && m.budget > 0 ? m.budget : null;
      const validRevenue = m.revenue && m.revenue > 0 ? m.revenue : null;

      movieStmt.run(
        m.id,
        m.title.trim(),
        m.original_title ? m.original_title.trim() : null,
        m.overview ? m.overview.trim() : null,
        m.release_date || null,
        year,
        validRuntime,
        validBudget,
        validRevenue,
        m.vote_average ?? null,
        m.vote_count ?? null,
        m.popularity ?? null,
        m.poster_path || null,
        m.backdrop_path || null,
      );

      if (m.genre_ids) {
        delGenresStmt.run(m.id);
        for (const gid of m.genre_ids) {
          insGenreStmt.run(m.id, gid);
        }
      }

      if (m.country_codes) {
        delCountriesStmt.run(m.id);
        for (const code of m.country_codes) {
          insCountryStmt.run(m.id, code.toUpperCase());
        }
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function getDashboardStats(db: DatabaseSync): DashboardStats {
  const countRow = db
    .prepare(
      'SELECT COUNT(*) as count, MIN(release_year) as min_year, MAX(release_year) as max_year FROM movies',
    )
    .get() as {
    count: number;
    min_year: number | null;
    max_year: number | null;
  };

  const runtimeRow = db
    .prepare(
      'SELECT AVG(runtime) as avg_runtime FROM movies WHERE runtime IS NOT NULL AND runtime > 0',
    )
    .get() as { avg_runtime: number | null };

  const ratingRow = db
    .prepare(
      'SELECT AVG(vote_average) as avg_rating FROM movies WHERE vote_average IS NOT NULL',
    )
    .get() as { avg_rating: number | null };

  const topCountryRow = db
    .prepare(
      `SELECT c.code, c.name, COUNT(pc.movie_id) as count
       FROM countries c
       JOIN production_countries pc ON c.code = pc.country_code
       GROUP BY c.code, c.name
       ORDER BY count DESC
       LIMIT 1`,
    )
    .get() as { code: string; name: string; count: number } | undefined;

  const bestRatedMovieRow = db
    .prepare(
      `SELECT id, title, release_year, vote_average, poster_path
       FROM movies
       WHERE vote_average IS NOT NULL
       ORDER BY vote_average DESC, vote_count DESC
       LIMIT 1`,
    )
    .get() as
    | {
        id: number;
        title: string;
        release_year: number | null;
        vote_average: number;
        poster_path: string | null;
      }
    | undefined;

  const mostPopularMovieRow = db
    .prepare(
      `SELECT id, title, release_year, popularity, poster_path
       FROM movies
       WHERE popularity IS NOT NULL
       ORDER BY popularity DESC
       LIMIT 1`,
    )
    .get() as
    | {
        id: number;
        title: string;
        release_year: number | null;
        popularity: number;
        poster_path: string | null;
      }
    | undefined;

  // ROI = ((revenue - budget) / budget) * 100
  const mostProfitableRow = db
    .prepare(
      `SELECT id, title, release_year,
              ROUND(((revenue - budget) * 100.0 / budget), 2) as roi,
              poster_path
       FROM movies
       WHERE budget > 0 AND revenue > 0
       ORDER BY roi DESC
       LIMIT 1`,
    )
    .get() as
    | {
        id: number;
        title: string;
        release_year: number | null;
        roi: number;
        poster_path: string | null;
      }
    | undefined;

  const leastProfitableRow = db
    .prepare(
      `SELECT id, title, release_year,
              ROUND(((revenue - budget) * 100.0 / budget), 2) as roi,
              poster_path
       FROM movies
       WHERE budget > 0 AND revenue > 0
       ORDER BY roi ASC
       LIMIT 1`,
    )
    .get() as
    | {
        id: number;
        title: string;
        release_year: number | null;
        roi: number;
        poster_path: string | null;
      }
    | undefined;

  const genresCountRow = db
    .prepare('SELECT COUNT(*) as count FROM genres')
    .get() as { count: number };

  const dominantGenreRow = db
    .prepare(
      `SELECT g.id, g.name, COUNT(mg.movie_id) as count
       FROM genres g
       JOIN movie_genres mg ON g.id = mg.genre_id
       GROUP BY g.id, g.name
       ORDER BY count DESC
       LIMIT 1`,
    )
    .get() as { id: number; name: string; count: number } | undefined;

  const bestRatedGenreRow = db
    .prepare(
      `SELECT g.id, g.name, ROUND(AVG(m.vote_average), 2) as average_rating
       FROM genres g
       JOIN movie_genres mg ON g.id = mg.genre_id
       JOIN movies m ON mg.movie_id = m.id
       WHERE m.vote_average IS NOT NULL
       GROUP BY g.id, g.name
       HAVING COUNT(m.id) >= 2
       ORDER BY average_rating DESC
       LIMIT 1`,
    )
    .get() as { id: number; name: string; average_rating: number } | undefined;

  // Weighted rating: R = sum(v * score) / sum(v)
  const bestWeightedGenreRow = db
    .prepare(
      `SELECT g.id, g.name,
              ROUND(SUM(m.vote_average * COALESCE(m.vote_count, 1)) / SUM(COALESCE(m.vote_count, 1)), 2) as weighted_rating
       FROM genres g
       JOIN movie_genres mg ON g.id = mg.genre_id
       JOIN movies m ON mg.movie_id = m.id
       WHERE m.vote_average IS NOT NULL
       GROUP BY g.id, g.name
       HAVING COUNT(m.id) >= 2
       ORDER BY weighted_rating DESC
       LIMIT 1`,
    )
    .get() as { id: number; name: string; weighted_rating: number } | undefined;

  return {
    filmsCount: countRow.count,
    minYear: countRow.min_year,
    maxYear: countRow.max_year,
    averageRuntime: runtimeRow.avg_runtime
      ? Math.round(runtimeRow.avg_runtime)
      : null,
    averageRating: ratingRow.avg_rating
      ? Math.round(ratingRow.avg_rating * 100) / 100
      : null,
    topCountry: topCountryRow || null,
    bestRatedMovie: bestRatedMovieRow || null,
    mostPopularMovie: mostPopularMovieRow || null,
    mostProfitableMovie: mostProfitableRow || null,
    leastProfitableMovie: leastProfitableRow || null,
    genresCount: genresCountRow.count,
    dominantGenre: dominantGenreRow || null,
    bestRatedGenre: bestRatedGenreRow || null,
    bestWeightedGenre: bestWeightedGenreRow || null,
  };
}
