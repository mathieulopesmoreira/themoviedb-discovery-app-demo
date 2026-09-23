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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const language = searchParams.get('language') || DEFAULT_LANGUAGE;
    const page = searchParams.get('page') || DEFAULT_PAGE;
    const region = searchParams.get('region') || DEFAULT_REGION;

    searchParams.set('language', language);
    searchParams.set('page', page);
    searchParams.set('region', region);

    fetch(`/api/movies/popular?${searchParams.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setMovies(data.results);
      });
  }, []);

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
        {movies ? (
          <ul className="movie-grid">
            {movies.map((movie) => (
              <li key={movie.id}>
                <article>
                  <MovieItem movie={movie} />
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="status-message">Loading...</p>
        )}
      </section>
    </main>
  );
}
