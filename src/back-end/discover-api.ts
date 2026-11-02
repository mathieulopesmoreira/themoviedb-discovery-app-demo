import type { Express } from 'express';
import type express from 'express';
import { tmdbAccessToken } from './config';
import { DEFAULT_LANGUAGE, DEFAULT_PAGE, DEFAULT_REGION } from './constants';
import { toSupportedMovie } from './utils';
import type {
  MoviesApiResponse,
  TmdbMoviesRawResponse,
} from './schemas/MoviesTypes';

export function registerDiscoverApi(app: Express): void {
  app.get(
    '/api/discover/movies',
    async (req: express.Request, res: express.Response) => {
      try {
        const { year, language, page, region } = req.query;

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
        queryParams.append(
          'language',
          typeof language === 'string' && language.trim() !== ''
            ? language.trim()
            : DEFAULT_LANGUAGE,
        );
        queryParams.append(
          'page',
          typeof page === 'string' && page.trim() !== ''
            ? page.trim()
            : DEFAULT_PAGE,
        );
        queryParams.append(
          'region',
          typeof region === 'string' && region.trim() !== ''
            ? region.trim()
            : DEFAULT_REGION,
        );

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
          throw new Error(
            `TMDB discover failed with status ${response.status}`,
          );
        }

        const rawData = (await response.json()) as TmdbMoviesRawResponse;

        const data: MoviesApiResponse = {
          page: rawData.page,
          results: (rawData.results || []).map(toSupportedMovie),
          total_pages: rawData.total_pages,
          total_results: rawData.total_results,
        };

        return res.status(200).json(data);
      } catch (error) {
        console.error('Error discovering movies:', error);
        return res.status(500).json({ error: 'Failed to discover movies' });
      }
    },
  );
}
