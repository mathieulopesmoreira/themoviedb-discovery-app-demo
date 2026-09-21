import { useEffect, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../back-end/constants';
import type { Movie } from '../back-end/schemas/MoviesTypes';
import MovieItem from './components/MovieItem';

export default function App() {
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
    <div>
      <h1>Films populaires</h1>
      {movies ? (
        <ul>
          {movies.map((movie) => (
            <MovieItem key={movie.id} movie={movie} />
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
