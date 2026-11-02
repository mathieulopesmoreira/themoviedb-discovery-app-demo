import type { ReactNode } from 'react';
import './WidgetCards.css';

// Base Stat Widget Card
export interface StatWidgetProps {
  title: string;
  value?: string | number | null;
  unit?: string;
  subtitle?: string | ReactNode;
  badge?: string;
  loading?: boolean;
  error?: string | null;
}

export function StatWidget({
  title,
  value,
  unit,
  subtitle,
  badge,
  loading,
  error,
}: StatWidgetProps) {
  if (loading) {
    return (
      <div className="widget-card widget-stat-card widget-loading">
        <p className="widget-label">{title}</p>
        <div className="widget-skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-card widget-stat-card widget-error">
        <p className="widget-label">{title}</p>
        <p className="widget-error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="widget-card widget-stat-card">
      <p className="widget-label">{title}</p>
      <div className="widget-stat-main">
        {subtitle && typeof subtitle === 'string' && (
          <p className="widget-subhead">{subtitle}</p>
        )}
        <div className="widget-value-row">
          <span className="widget-value">{value ?? '—'}</span>
          {unit && <span className="widget-unit">{unit}</span>}
        </div>
        {subtitle && typeof subtitle !== 'string' && (
          <div className="widget-subhead">{subtitle}</div>
        )}
        {badge && <div className="widget-pill-badge">{badge}</div>}
      </div>
    </div>
  );
}

// Movie Highlight Card (Horizontal)
export interface MovieHighlightProps {
  label: string;
  movie?: {
    id: number;
    title: string;
    release_year?: number | null;
    poster_path?: string | null;
  } | null;
  valueHighlight?: ReactNode;
  loading?: boolean;
  error?: string | null;
}

export function MovieHighlightCard({
  label,
  movie,
  valueHighlight,
  loading,
  error,
}: MovieHighlightProps) {
  if (loading) {
    return (
      <div className="widget-card widget-movie-card widget-loading">
        <div className="widget-movie-poster widget-skeleton" />
        <div className="widget-movie-info">
          <div className="widget-skeleton-line short" />
          <div className="widget-skeleton-line" />
          <div className="widget-skeleton-line medium" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="widget-card widget-movie-card">
        <div className="widget-movie-poster widget-poster-placeholder">
          <span>🎬</span>
        </div>
        <div className="widget-movie-info">
          <p className="widget-label">{label}</p>
          <p className="widget-movie-empty">
            {error || 'Aucun film correspondant'}
          </p>
        </div>
      </div>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
    : null;

  return (
    <div className="widget-card widget-movie-card">
      <div className="widget-movie-poster">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="widget-poster-placeholder">
            <span>🎬</span>
          </div>
        )}
      </div>
      <div className="widget-movie-info">
        <p className="widget-label">{label}</p>
        <h3 className="widget-movie-title">{movie.title}</h3>
        {movie.release_year && (
          <p className="widget-movie-year">{movie.release_year}</p>
        )}
        {valueHighlight && (
          <div className="widget-movie-highlight">{valueHighlight}</div>
        )}
      </div>
    </div>
  );
}

// DASHBOARD-13: Films en base
export function FilmsCountWidget({
  count,
  minYear,
  maxYear,
  loading,
  error,
}: {
  count?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  loading?: boolean;
  error?: string | null;
}) {
  const badge =
    minYear && maxYear
      ? `${minYear} - ${maxYear}`
      : minYear
        ? `${minYear}`
        : undefined;

  const formattedCount =
    count != null ? count.toLocaleString('fr-FR') : undefined;

  return (
    <StatWidget
      title="Films en base"
      value={formattedCount}
      unit="films"
      badge={badge}
      loading={loading}
      error={error}
    />
  );
}

// DASHBOARD-14: Durée moyenne
export function AverageDurationWidget({
  runtime,
  loading,
  error,
}: {
  runtime?: number | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <StatWidget
      title="Durée moyenne"
      value={runtime != null ? runtime : undefined}
      unit="min"
      loading={loading}
      error={error}
    />
  );
}

// DASHBOARD-15: Note moyenne
export function AverageRatingWidget({
  rating,
  loading,
  error,
}: {
  rating?: number | null;
  loading?: boolean;
  error?: string | null;
}) {
  const formatted =
    rating != null
      ? rating.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : undefined;

  return (
    <StatWidget
      title="Note moyenne"
      value={formatted}
      unit="/ 10"
      loading={loading}
      error={error}
    />
  );
}

// DASHBOARD-16: Pays le plus représenté
export function TopCountryWidget({
  country,
  loading,
  error,
}: {
  country?: { name: string; count: number } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="widget-card widget-stat-card">
      <p className="widget-label">Pays le plus représenté</p>
      {loading ? (
        <div className="widget-skeleton" />
      ) : error ? (
        <p className="widget-error-text">{error}</p>
      ) : country ? (
        <div className="widget-stat-main">
          <p className="widget-value-heading">{country.name}</p>
          <p className="widget-subhead-count">
            <strong>{country.count.toLocaleString('fr-FR')}</strong> films
          </p>
        </div>
      ) : (
        <p className="widget-subhead-count">—</p>
      )}
    </div>
  );
}

// DASHBOARD-17: Film le mieux noté
export function BestRatedMovieWidget({
  movie,
  loading,
  error,
}: {
  movie?: {
    id: number;
    title: string;
    release_year?: number | null;
    vote_average: number;
    poster_path?: string | null;
  } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <MovieHighlightCard
      label="Film le mieux noté"
      movie={movie}
      loading={loading}
      error={error}
      valueHighlight={
        movie ? (
          <span className="highlight-score">
            <strong>
              {movie.vote_average.toLocaleString('fr-FR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </strong>{' '}
            / 10
          </span>
        ) : null
      }
    />
  );
}

// DASHBOARD-18: Film le plus populaire
export function MostPopularMovieWidget({
  movie,
  loading,
  error,
}: {
  movie?: {
    id: number;
    title: string;
    release_year?: number | null;
    popularity: number;
    poster_path?: string | null;
  } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <MovieHighlightCard
      label="Film le plus populaire"
      movie={movie}
      loading={loading}
      error={error}
      valueHighlight={
        movie ? (
          <span className="highlight-pop">
            <strong>
              {movie.popularity.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>{' '}
            popularité
          </span>
        ) : null
      }
    />
  );
}

// DASHBOARD-19: Film le plus rentable
export function MostProfitableMovieWidget({
  movie,
  loading,
  error,
}: {
  movie?: {
    id: number;
    title: string;
    release_year?: number | null;
    roi: number;
    poster_path?: string | null;
  } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <MovieHighlightCard
      label="Film le plus rentable"
      movie={movie}
      loading={loading}
      error={error}
      valueHighlight={
        movie ? (
          <span className="highlight-roi positive">
            <strong>
              {movie.roi.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>{' '}
            % ROI
          </span>
        ) : null
      }
    />
  );
}

// DASHBOARD-20: Film le moins rentable
export function LeastProfitableMovieWidget({
  movie,
  loading,
  error,
}: {
  movie?: {
    id: number;
    title: string;
    release_year?: number | null;
    roi: number;
    poster_path?: string | null;
  } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <MovieHighlightCard
      label="Film le moins rentable"
      movie={movie}
      loading={loading}
      error={error}
      valueHighlight={
        movie ? (
          <span className="highlight-roi negative">
            <strong>
              {movie.roi.toLocaleString('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </strong>{' '}
            % ROI
          </span>
        ) : null
      }
    />
  );
}

// DASHBOARD-21: Genres représentés
export function GenresCountWidget({
  count,
  loading,
  error,
}: {
  count?: number | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="widget-card widget-stat-card">
      <p className="widget-label">Genres représentés</p>
      {loading ? (
        <div className="widget-skeleton" />
      ) : error ? (
        <p className="widget-error-text">{error}</p>
      ) : (
        <div className="widget-stat-main">
          <p className="widget-subhead">Diversité du catalogue</p>
          <div className="widget-value-row">
            <span className="widget-value">{count ?? '—'}</span>
            <span className="widget-unit">genres</span>
          </div>
        </div>
      )}
    </div>
  );
}

// DASHBOARD-22: Genre dominant
export function DominantGenreWidget({
  genre,
  loading,
  error,
}: {
  genre?: { name: string; count: number } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="widget-card widget-stat-card">
      <p className="widget-label">Genre dominant</p>
      {loading ? (
        <div className="widget-skeleton" />
      ) : error ? (
        <p className="widget-error-text">{error}</p>
      ) : genre ? (
        <div className="widget-stat-main">
          <p className="widget-value-heading">{genre.name}</p>
          <p className="widget-subhead-count">
            <strong>{genre.count.toLocaleString('fr-FR')}</strong> films
          </p>
        </div>
      ) : (
        <p className="widget-subhead-count">—</p>
      )}
    </div>
  );
}

// DASHBOARD-23: Meilleure note par genre
export function BestRatedGenreWidget({
  genre,
  loading,
  error,
}: {
  genre?: { name: string; average_rating: number } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="widget-card widget-stat-card">
      <p className="widget-label">Meilleure note</p>
      {loading ? (
        <div className="widget-skeleton" />
      ) : error ? (
        <p className="widget-error-text">{error}</p>
      ) : genre ? (
        <div className="widget-stat-main">
          <p className="widget-value-heading">{genre.name}</p>
          <div className="widget-value-row">
            <span className="widget-value">
              {genre.average_rating.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="widget-unit">/ 10</span>
          </div>
        </div>
      ) : (
        <p className="widget-subhead-count">—</p>
      )}
    </div>
  );
}

// DASHBOARD-24: Meilleure note pondérée par genre
export function BestWeightedGenreWidget({
  genre,
  loading,
  error,
}: {
  genre?: { name: string; weighted_rating: number } | null;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="widget-card widget-stat-card">
      <p className="widget-label">Meilleure note pondérée</p>
      {loading ? (
        <div className="widget-skeleton" />
      ) : error ? (
        <p className="widget-error-text">{error}</p>
      ) : genre ? (
        <div className="widget-stat-main">
          <p className="widget-value-heading">{genre.name}</p>
          <div className="widget-value-row">
            <span className="widget-value">
              {genre.weighted_rating.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="widget-unit">/ 10</span>
          </div>
        </div>
      ) : (
        <p className="widget-subhead-count">—</p>
      )}
    </div>
  );
}
