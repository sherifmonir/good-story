import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

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
        // Fetch details + credits + videos in one call
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
    window.scrollTo(0, 0); // Scroll to top on route change
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Spinner /></div>;
  if (errorMessage) return <p className="text-red-500 text-center mt-10">{errorMessage}</p>;
  if (!movie) return null;

  // Helper formatting functions
  const formatRuntime = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
  const formatCurrency = (amount) => amount ? `$${(amount / 1_000_000).toFixed(1)} million` : 'N/A';
  
  // Find official trailer
  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="min-h-screen text-white p-6 md:p-12 max-w-6xl mx-auto">
      <Link to="/" className="text-cyan-400 hover:underline mb-6 inline-block">
        &larr; Back to Search
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {movie.release_date?.split('-')[0]} &bull; {movie.adult ? 'R' : 'PG-13'} &bull; {formatRuntime(movie.runtime)}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
            <span className="text-slate-400 text-xs">({movie.vote_count})</span>
          </div>
        </div>
      </div>

      {/* Media Grid (Poster & Backdrop/Trailer Preview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <img 
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '/no-movie.png'} 
          alt={movie.title}
          className="rounded-xl shadow-lg w-full object-cover max-h-[450px]" 
        />
        
        <div className="md:col-span-2 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col justify-end min-h-[300px]">
          <img 
            src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}` : '/no-movie.png'} 
            alt="Backdrop"
            className="absolute inset-0 w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="relative z-10 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <p className="italic text-slate-300 text-sm max-w-md">"{movie.tagline}"</p>
            </div>
            {trailer && (
              <a 
                href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
          <span key={genre.id} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm border border-slate-700">
            {genre.name}
          </span>
        ))}
        {movie.homepage && (
          <a 
            href={movie.homepage} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Visit Homepage
          </a>
        )}
      </div>

      {/* Metadata Table / List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Overview</span>
          <span className="sm:col-span-2 text-slate-200 leading-relaxed">{movie.overview}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Release Date</span>
          <span className="sm:col-span-2 text-slate-200">{movie.release_date}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Countries</span>
          <span className="sm:col-span-2 text-slate-200">{movie.production_countries?.map(c => c.name).join(', ') || 'N/A'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Status</span>
          <span className="sm:col-span-2 text-slate-200">{movie.status}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Language</span>
          <span className="sm:col-span-2 text-slate-200">{movie.spoken_languages?.map(l => l.english_name).join(', ') || 'N/A'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Budget</span>
          <span className="sm:col-span-2 text-slate-200">{formatCurrency(movie.budget)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-medium">Revenue</span>
          <span className="sm:col-span-2 text-slate-200">{formatCurrency(movie.revenue)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3">
          <span className="text-slate-400 font-medium">Production Companies</span>
          <span className="sm:col-span-2 text-slate-200">{movie.production_companies?.map(p => p.name).join(', ') || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;