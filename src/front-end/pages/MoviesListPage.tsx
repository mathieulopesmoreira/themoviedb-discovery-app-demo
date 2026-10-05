import { useEffect, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../../back-end/constants';
import type { Movie } from '../../back-end/schemas/MoviesTypes';
import MovieItem from '../components/MovieItem';

export default function MoviesListPage() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    const searchParams = new URLSearchParams(window.location.search);
    const language = searchParams.get('language') || DEFAULT_LANGUAGE;
    const page = searchParams.get('page') || DEFAULT_PAGE;
    const region = searchParams.get('region') || DEFAULT_REGION;

    searchParams.set('language', language);
    searchParams.set('page', page);
    searchParams.set('region', region);

    fetch(`/api/movies/popular?${searchParams.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setMovies(data.results);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error
              ? err.message
              : 'Impossible de charger les films';
          setError(message);
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadIndex]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Films populaires</h1>
        <h2>
          Films tendances en France, d&apos;après les données de{' '}
          <b>The Movie Database</b>
        </h2>
      </header>
      <section>
        {error ? (
          <div className="status-message">
            <p>Une erreur est survenue : {error}</p>
            <button
              type="button"
              onClick={() => {
                setMovies(null);
                setError(null);
                setReloadIndex((idx) => idx + 1);
              }}
            >
              Réessayer
            </button>
          </div>
        ) : movies ? (
          movies.length > 0 ? (
            <ul className="movie-grid">
              {movies.map((movie) => (
                <li key={movie.id}>
                  <article aria-label={`Film ${movie.title}`}>
                    <MovieItem movie={movie} />
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="status-message">Aucun film trouvé.</p>
          )
        ) : (
          <p className="status-message">Loading...</p>
        )}
      </section>
    </main>
  );
}
