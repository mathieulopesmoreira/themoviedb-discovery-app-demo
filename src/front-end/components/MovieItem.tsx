import type { Movie } from '../../back-end/schemas/MoviesTypes';
import { Link } from 'react-router';

type MovieItemProps = {
  movie: Movie;
};

export default function MovieItem({ movie }: MovieItemProps) {
  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : 'Date inconnue';
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
    : null;
  const rating =
    movie.vote_count > 0 ? `Note ${movie.vote_average.toFixed(1)}` : 'Non noté';

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="movie-card-link"
      aria-label={`Voir les détails du film ${movie.title}`}
    >
      <div className="movie-card">
        {posterUrl ? (
          <img
            className="movie-poster"
            src={posterUrl}
            alt={`Affiche de ${movie.title}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="movie-poster" aria-hidden="true" />
        )}
        <div className="movie-card__content">
          <h2>{movie.title}</h2>
          <p>
            {releaseYear} · {rating}
          </p>
        </div>
      </div>
    </Link>
  );
}
