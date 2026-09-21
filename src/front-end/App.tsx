import { useEffect, useState } from 'react';
import type { Movie } from '../back-end/schemas/MoviesTypes';
import MovieItem from './components/MovieItem';

export default function App() {
  const [movies, setMovies] = useState<Movie[] | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryParams = new URLSearchParams();

    for (const parameter of ['language', 'page', 'region']) {
      const value = searchParams.get(parameter);

      if (value) {
        queryParams.set(parameter, value);
      }
    }

    const query = queryParams.toString();
    const url = query ? `/api/movies/popular?${query}` : '/api/movies/popular';

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setMovies(data.results);
      });
  }, []);

  return (
    <div>
      <h1>Popular Movies</h1>
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
