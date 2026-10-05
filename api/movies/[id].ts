import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_LANGUAGE = 'fr-FR';

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbMovieDetailsRaw {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: TmdbGenre[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;
    if (!tmdbAccessToken) {
      return res
        .status(500)
        .json({ error: 'TMDB_ACCESS_TOKEN is not configured' });
    }

    const { id, language = DEFAULT_LANGUAGE } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    const queryParams = new URLSearchParams();
    queryParams.append('language', String(language));

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?${queryParams.toString()}`,
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

    const rawData = (await response.json()) as TmdbMovieDetailsRaw;

    const data = {
      id: rawData.id,
      title: rawData.title,
      tagline: rawData.tagline,
      overview: rawData.overview,
      poster_path: rawData.poster_path,
      backdrop_path: rawData.backdrop_path,
      release_date: rawData.release_date,
      runtime: rawData.runtime,
      vote_average: rawData.vote_average,
      vote_count: rawData.vote_count,
      genres: (rawData.genres || []).map((genre) => ({
        id: genre.id,
        name: genre.name,
      })),
    };

    return res.status(200).json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch movie details';
    return res.status(500).json({ error: message });
  }
}
