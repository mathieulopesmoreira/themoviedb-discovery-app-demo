import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { DEFAULT_LANGUAGE } from '../../back-end/constants';
import type { MovieDetails } from '../../back-end/schemas/MoviesTypes';
import MovieDetailCard from '../components/MovieDetailCard';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);

  useEffect(() => {
    if (!id) return;
    const searchParams = new URLSearchParams(window.location.search);
    const language = searchParams.get('language') || DEFAULT_LANGUAGE;

    searchParams.set('language', language);

    fetch(`/api/movies/${id}?${searchParams.toString()}`)
      .then((response) => response.json())
      .then((data: MovieDetails) => {
        setMovie(data);
      });
  }, [id]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Détails du film</h1>
        <p>
          <Link to="/movies">← Retour vers les films populaires</Link>
        </p>
      </header>
      <section>
        {movie ? (
          <MovieDetailCard movie={movie} />
        ) : (
          <p className="status-message">Loading...</p>
        )}
      </section>
    </main>
  );
}
