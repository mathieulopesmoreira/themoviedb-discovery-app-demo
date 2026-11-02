import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  const fallbackStats = {
    filmsCount: 1000,
    minYear: 2023,
    maxYear: 2027,
    averageRuntime: 107,
    averageRating: 6.78,
    topCountry: {
      code: 'US',
      name: 'United States of America',
      count: 725,
    },
    bestRatedMovie: {
      id: 100001,
      title: 'Batman Knightfall - Partie 1',
      release_year: 2026,
      vote_average: 9.1,
      poster_path: '/dFwseuSlDUNiwMuElDb3OAOQ8En.jpg',
    },
    mostPopularMovie: {
      id: 100002,
      title: 'Spider-Man : Brand New Day',
      release_year: 2026,
      popularity: 1036.49,
      poster_path: '/6DQkNOhW7p9PwxWTDuZy8tnXozK.jpg',
    },
    mostProfitableMovie: {
      id: 100003,
      title: 'Obsession',
      release_year: 2026,
      roi: 69667.36,
      poster_path: '/mDCR1frpUvGfIKksuM440VLb7X9.jpg',
    },
    leastProfitableMovie: {
      id: 100004,
      title: "Mémoires d'un escargot",
      release_year: 2025,
      roi: -100,
      poster_path: '/yZINaQysj32K2DS2EW4Iy1bK4Bm.jpg',
    },
    genresCount: 19,
    dominantGenre: {
      id: 18,
      name: 'Drame',
      count: 322,
    },
    bestRatedGenre: {
      id: 16,
      name: 'Animation',
      average_rating: 7.41,
    },
    bestWeightedGenre: {
      id: 16,
      name: 'Animation',
      weighted_rating: 7.68,
    },
  };

  try {
    const { getDatabase } = await import('../../src/back-end/database/schema');
    const { getDashboardStats } = await import(
      '../../src/back-end/database/movie-repository'
    );
    const db = getDatabase();
    try {
      const stats = getDashboardStats(db);
      if (stats.filmsCount > 0) {
        return res.status(200).json(stats);
      }
    } finally {
      db.close();
    }
  } catch {
    // Return fallback stats when running in Vercel serverless without local SQLite
  }

  return res.status(200).json(fallbackStats);
}
