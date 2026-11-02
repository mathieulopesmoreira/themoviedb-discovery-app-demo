import type { Express } from 'express';
import type express from 'express';
import { getDatabase } from './database/schema';
import { getDashboardStats } from './database/movie-repository';

export function registerDashboardApi(app: Express): void {
  app.get(
    '/api/dashboard/stats',
    (_req: express.Request, res: express.Response) => {
      try {
        const db = getDatabase();
        try {
          const stats = getDashboardStats(db);
          return res.status(200).json(stats);
        } finally {
          db.close();
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res
          .status(500)
          .json({ error: 'Failed to fetch dashboard stats' });
      }
    },
  );
}
