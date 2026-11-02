import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_LANGUAGE = 'fr-FR';
const DEFAULT_PAGE = '1';
const DEFAULT_REGION = 'FR';

interface TmdbMovieRaw {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;
    if (!tmdbAccessToken) {
      return res
        .status(500)
        .json({ error: 'TMDB_ACCESS_TOKEN is not configured' });
    }

    const {
      year,
      language = DEFAULT_LANGUAGE,
      page = DEFAULT_PAGE,
      region = DEFAULT_REGION,
    } = req.query;

    if (
      !year ||
      typeof year !== 'string' ||
      !/^\d{4}$/.test(year) ||
      parseInt(year, 10) < 1000 ||
      parseInt(year, 10) > 9999
    ) {
      return res.status(400).json({
        error:
          'Le paramètre "year" est obligatoire et doit être une année à 4 chiffres valide.',
      });
    }

    const queryParams = new URLSearchParams();
    queryParams.append('primary_release_year', year);
    queryParams.append('language', String(language));
    queryParams.append('page', String(page));
    queryParams.append('region', String(region));

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${tmdbAccessToken}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      },
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `TMDB API failed with status ${response.status}` });
    }

    const rawData = (await response.json()) as {
      page: number;
      results: TmdbMovieRaw[];
      total_pages: number;
      total_results: number;
    };

    const results = (rawData.results || []).map((movie: TmdbMovieRaw) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
    }));

    return res.status(200).json({
      page: rawData.page,
      results,
      total_pages: rawData.total_pages,
      total_results: rawData.total_results,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to discover movies';
    return res.status(500).json({ error: message });
  }
}
