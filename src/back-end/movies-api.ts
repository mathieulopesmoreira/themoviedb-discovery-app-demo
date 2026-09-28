import type { Express } from 'express';
import type express from 'express';
import { tmdbAccessToken } from './config';
import { DEFAULT_LANGUAGE, DEFAULT_PAGE, DEFAULT_REGION } from './constants';
import { toSupportedMovie, toSupportedMovieDetails } from './utils';
import type {
  MovieDetails,
  MoviesApiResponse,
  TmdbMovieDetails,
  TmdbMoviesRawResponse,
} from './schemas/MoviesTypes';

export function registerMoviesApi(app: Express): void {
  // Define a route handler for fetching popular movies from TMDB API
  app.get(
    '/api/movies/popular',
    async (_req: express.Request, res: express.Response) => {
      try {
        const queryParams = new URLSearchParams();
        const { language, page, region } = _req.query;

        queryParams.append(
          'language',
          (language as string) || DEFAULT_LANGUAGE,
        );
        queryParams.append('page', (page as string) || DEFAULT_PAGE);
        queryParams.append('region', (region as string) || DEFAULT_REGION);

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

        // Parse the raw response from the TMDB API
        const rawData = (await response.json()) as TmdbMoviesRawResponse;

        // Transform the raw data into the supported format for our application
        const data: MoviesApiResponse = {
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
    },
  );

  // Define a route handler for fetching details of a specific movie from TMDB API
  app.get(
    '/api/movies/:id',
    async (_req: express.Request, res: express.Response) => {
      try {
        const { id } = _req.params;
        const { language } = _req.query;

        const queryParams = new URLSearchParams();
        queryParams.append(
          'language',
          (language as string) || DEFAULT_LANGUAGE,
        );

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

        const rawData = (await response.json()) as TmdbMovieDetails;
        const data: MovieDetails = toSupportedMovieDetails(rawData);

        res.json(data);
      } catch (error) {
        console.error(
          `Error fetching movie details for id ${_req.params.id}:`,
          error,
        );
        res.status(500).json({ error: 'Failed to fetch movie details' });
      }
    },
  );
}
