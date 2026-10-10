import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import NoPoster from '../assets/No-Poster.png';
import NoPhoto from '../assets/No-Photo.png';
import { DetailsTable } from '../Constants';


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      try {
        
        const response = await fetch(
          `${API_BASE_URL}/movie/${id}?append_to_response=credits,videos&language=en-US`,
          API_OPTIONS
        );

        if (!response.ok) throw new Error('Failed to fetch movie details.');
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Could not load movie details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
    window.scrollTo(0, 0); 
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Spinner /></div>;
  if (errorMessage) return <p className="text-red-500 text-center mt-10">{errorMessage}</p>;
  if (!movie) return null;

  
  const formatRuntime = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
  
  
  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="movie-details-page">

      <Link to="/" className="Back-to-Search">
        &larr; Back to Search
      </Link>

      
      <div className="movie-main-info">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {movie.release_date?.split('-')[0]} &bull; {movie.adult ? 'R' : 'PG-13'} &bull; {formatRuntime(movie.runtime)}
          </p>
        </div>
        
        <div className="rating">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
            <span className="text-slate-400 text-xs">({movie.vote_count})</span>
          </div>
          <span className="text-slate-400 text-xs border-l border-slate-600 pl-3">TMDB</span>
        </div>
      </div>

      
      <div className="flex justify-between w-full mb-6">
        <img 
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : NoPoster} 
          alt={movie.title}
          onError={(e) => { e.target.src = NoPoster; }}
          className="rounded-xl shadow-lg  object-cover max-h-112.5 w-[40%]" 
        />
        
        <div className="movie-photo">
          <img 
            src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}` : NoPhoto} 
            alt="Backdrop"
            onError={(e) => { e.target.src = NoPhoto; }}
            className="absolute inset-0 w-full h-full object-cover " 
          />
          <div className="  relative inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="relative z-10 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <p className="italic font-semibold text-slate-300 text-sm max-w-md">{movie.tagline}</p>
            </div>
            {trailer && (
              <a 
                href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="watch-trailer-btn"
              >
                ▶ Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-8">
        {movie.genres?.map(genre => (
          <span key={genre.id} className="genre">
            {genre.name}
          </span>
        ))}
        {movie.homepage && (
          <a 
            href={movie.homepage} 
            target="_blank" 
            rel="noopener noreferrer"
            className="visit-homepage-btn"
          >
            Visit Homepage
          </a>
        )}
      </div>

      
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-3xl">
      {DetailsTable.map((item, index) => (
        <div key={index} className="flex  items-start gap-4 mb-4">
          <span className="shrink-0 font-semibold text-slate-300">{item.label}: </span>
          <span className="text-slate-400">{item.value(movie)}</span>
          
        </div>
      ))}
      </div>
    </div>
  );
};

export default MovieDetails;