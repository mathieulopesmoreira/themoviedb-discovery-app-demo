// api/index.ts
import express from 'express';

// src/back-end/health-api.ts
function registerHealthApi(app2) {
  app2.get('/api/health', (_req, res) => {
    const response = { status: 'ok' };
    res.json(response);
  });
}

// src/back-end/config.ts
import dotenv from 'dotenv';
dotenv.config();
var tmdbAccessToken = process.env.TMDB_ACCESS_TOKEN;
if (!tmdbAccessToken) {
  throw new Error(
    'TMDB_ACCESS_TOKEN is not defined in the environment variables.',
  );
}

// src/back-end/constants.ts
var DEFAULT_LANGUAGE = 'fr-FR';
var DEFAULT_PAGE = '1';
var DEFAULT_REGION = 'FR';

// src/back-end/utils.ts
var toSupportedMovie = (movie) => {
  return {
    backdrop_path: movie.backdrop_path,
    genre_ids: movie.genre_ids,
    id: movie.id,
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: movie.title,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
  };
};
var toSupportedMovieDetails = (movie) => {
  return {
    backdrop_path: movie.backdrop_path,
    genres: movie.genres,
    id: movie.id,
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    tagline: movie.tagline,
    title: movie.title,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
  };
};

// src/back-end/movies-api.ts
function registerMoviesApi(app2) {
  app2.get('/api/movies/popular', async (_req, res) => {
    try {
      const queryParams = new URLSearchParams();
      const { language, page, region } = _req.query;
      queryParams.append('language', language || DEFAULT_LANGUAGE);
      queryParams.append('page', page || DEFAULT_PAGE);
      queryParams.append('region', region || DEFAULT_REGION);
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${tmdbAccessToken}`,
            'Content-Type': 'application/json;charset=utf-8',
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `TMDB API request failed with status ${response.status}`,
        );
      }
      const rawData = await response.json();
      const data = {
        page: rawData.page,
        results: rawData.results.map(toSupportedMovie),
        total_pages: rawData.total_pages,
        total_results: rawData.total_results,
      };
      res.json(data);
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
  });
  app2.get('/api/movies/:id', async (_req, res) => {
    try {
      const { id } = _req.params;
      const { language } = _req.query;
      const queryParams = new URLSearchParams();
      queryParams.append('language', language || DEFAULT_LANGUAGE);
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
        throw new Error(
          `TMDB API request failed with status ${response.status}`,
        );
      }
      const rawData = await response.json();
      const data = toSupportedMovieDetails(rawData);
      res.json(data);
    } catch (error) {
      console.error(
        `Error fetching movie details for id ${_req.params.id}:`,
        error,
      );
      res.status(500).json({ error: 'Failed to fetch movie details' });
    }
  });
}

// api/index.ts
var app = express();
registerHealthApi(app);
registerMoviesApi(app);
var index_default = app;
export { index_default as default };
