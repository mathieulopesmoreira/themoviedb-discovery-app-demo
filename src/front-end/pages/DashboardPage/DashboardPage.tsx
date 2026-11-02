import { useEffect, useState } from 'react';
import type { DashboardStats } from '../../../back-end/database/movie-repository';
import {
  FilmsCountWidget,
  AverageDurationWidget,
  AverageRatingWidget,
  TopCountryWidget,
  BestRatedMovieWidget,
  MostPopularMovieWidget,
  MostProfitableMovieWidget,
  LeastProfitableMovieWidget,
  GenresCountWidget,
  DominantGenreWidget,
  BestRatedGenreWidget,
  BestWeightedGenreWidget,
} from '../../components/widgets/WidgetCards';
import './DashboardPage.css';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch('/api/dashboard/stats')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP (${res.status})`);
        }
        return res.json();
      })
      .then((data: DashboardStats) => {
        if (!ignore) {
          setStats(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Impossible de charger les statistiques';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* SECTION 1: FILMS */}
        <section
          className="dashboard-section"
          aria-labelledby="section-films-title"
        >
          <header className="dashboard-section-header">
            <div className="dashboard-icon-badge film-badge" aria-hidden="true">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="2.18"
                  ry="2.18"
                ></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
            </div>
            <div>
              <h2 id="section-films-title" className="dashboard-section-title">
                Films
              </h2>
              <p className="dashboard-section-subtitle">
                Les films qui se distinguent dans votre catalogue
              </p>
            </div>
          </header>

          <div className="dashboard-grid-4">
            <FilmsCountWidget
              count={stats?.filmsCount}
              minYear={stats?.minYear}
              maxYear={stats?.maxYear}
              loading={loading}
              error={error}
            />
            <AverageDurationWidget
              runtime={stats?.averageRuntime}
              loading={loading}
              error={error}
            />
            <AverageRatingWidget
              rating={stats?.averageRating}
              loading={loading}
              error={error}
            />
            <TopCountryWidget
              country={stats?.topCountry}
              loading={loading}
              error={error}
            />
          </div>

          <div className="dashboard-grid-2">
            <BestRatedMovieWidget
              movie={stats?.bestRatedMovie}
              loading={loading}
              error={error}
            />
            <MostPopularMovieWidget
              movie={stats?.mostPopularMovie}
              loading={loading}
              error={error}
            />
            <MostProfitableMovieWidget
              movie={stats?.mostProfitableMovie}
              loading={loading}
              error={error}
            />
            <LeastProfitableMovieWidget
              movie={stats?.leastProfitableMovie}
              loading={loading}
              error={error}
            />
          </div>
        </section>

        {/* SECTION 2: GENRES */}
        <section
          className="dashboard-section"
          aria-labelledby="section-genres-title"
        >
          <header className="dashboard-section-header">
            <div
              className="dashboard-icon-badge genre-badge"
              aria-hidden="true"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <h2 id="section-genres-title" className="dashboard-section-title">
                Genres
              </h2>
              <p className="dashboard-section-subtitle">
                Les tendances de votre catalogue
              </p>
            </div>
          </header>

          <div className="dashboard-grid-4">
            <GenresCountWidget
              count={stats?.genresCount}
              loading={loading}
              error={error}
            />
            <DominantGenreWidget
              genre={stats?.dominantGenre}
              loading={loading}
              error={error}
            />
            <BestRatedGenreWidget
              genre={stats?.bestRatedGenre}
              loading={loading}
              error={error}
            />
            <BestWeightedGenreWidget
              genre={stats?.bestWeightedGenre}
              loading={loading}
              error={error}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
