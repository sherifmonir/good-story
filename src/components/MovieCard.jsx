import NoPoster from "../assets/No-Poster.png"
import Star from "../assets/Star.svg"
import { Link } from 'react-router-dom';

const MovieCard = ({movie:
    {id,title,vote_average, poster_path, release_date, original_language}}) => {
  return (
    <li>
      <Link to={`/movie/${id}`} className="movie-card block">
        <img
         src={poster_path ? `https://image.tmdb.org/t/p/w342${poster_path}` : NoPoster}
         alt={title}
         width="342"
         height="513"
         loading="lazy"
         decoding="async"
        />
        <div className="mt-4">
            <h3>{title}</h3>
            <div className="content">
                <div className="rating">
                    <img src={Star} alt="Star Icon" />
                    <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
                </div>
                <span>•</span>
                <p className="lang">{original_language}</p>
                <span>•</span>
                <p className="year">{release_date ? release_date.split('-')[0] : "N/A"}</p>

            </div>
        </div>
      </Link>
    </li>
  )
}

export default MovieCard