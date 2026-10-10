import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Search from '../components/Search';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';
import { updateSearchCount, getTrendingMovies } from '../appwrite';
import logo from "../assets/logo.png";
import heroImg from "../assets/hero-img.png";
import NoPoster from '../assets/No-Poster.png';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('query') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSort = searchParams.get('sort') || 'popularity.desc';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [movies, setMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = {};
    if (searchTerm) params.query = searchTerm;
    if (currentPage > 1) params.page = currentPage;
    if (sortBy !== 'popularity.desc') params.sort = sortBy;
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage, sortBy, setSearchParams]);

  const fetchMovies = async (query = '', pageNum = 1, sortOption = 'popularity.desc') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const tmdbSortMap = {
        'popularity.desc': 'popularity.desc',
        'vote_average.desc': 'vote_average.desc',
        'release_date.desc': 'primary_release_date.desc',
        'title.asc': 'original_title.asc'
      };

      const activeSort = tmdbSortMap[sortOption] || 'popularity.desc';

      const endPoint = query 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=${activeSort}&page=${pageNum}`;
      
      const response = await fetch(endPoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      let results = data.results || [];

      if (query) {
        results.sort((a, b) => {
          if (sortOption === 'popularity.desc') return (b.popularity || 0) - (a.popularity || 0);
          if (sortOption === 'vote_average.desc') return (b.vote_average || 0) - (a.vote_average || 0);
          if (sortOption === 'release_date.desc') return new Date(b.release_date || 0) - new Date(a.release_date || 0);
          if (sortOption === 'title.asc') return (a.title || '').localeCompare(b.title || '');
          return 0;
        });
      }

      setMovies(results);
      setTotalPages(data.total_pages > 500 ? 500 : (data.total_pages || 1));

      if (query && pageNum === 1 && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Failed to fetch movies. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const trending = await getTrendingMovies();
      setTrendingMovies(trending);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchMovies(searchTerm, currentPage, sortBy);
  }, [searchTerm, currentPage, sortBy]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleResetHome = () => {
    setSearchTerm('');
    setSortBy('popularity.desc');
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header>
        
        <div 
          onClick={handleResetHome}
          className="logo-and-name"
        >
          <img src={logo} alt="Movie discovery application logo" className="size-auto" />
          <h1 className="site-name">Good Story</h1>
        </div>

        <img src={heroImg} alt="Hero banner for movie discovery service featuring promotional imagery" />
        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </header>

      <section className="trending">
        <h2>Trending Movies</h2>
        {trendingMovies.length > 0 && (
          <ul>
            {trendingMovies.map((movie, index) => (
              <li 
                key={movie.$id} 
                onClick={() => navigate(`/movie/${movie.movie_id}`)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <p>{index + 1}</p>
                <img 
                  src={movie.poster_url || NoPoster} 
                  alt={`${movie.title} movie poster, ranked ${index + 1} in trending`}
                  onError={(e) => { e.target.src = NoPoster; }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="all-movies" id="results">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2>All Movies</h2>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-slate-400 text-sm">Sort by:</label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="sort-button"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="release_date.desc">Newest Release</option>
              <option value="title.asc">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <Spinner />
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : movies.length === 0 ? (
          <p className="text-white">No Movies Found</p>
        ) : (
          <>
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>

            <div className="pagenation">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                
              >
                &larr; Previous
              </button>

              <span>
                Page <strong className="text-cyan-400">{currentPage}</strong> of <strong className="text-slate-100">{totalPages}</strong>
              </span>

              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                
              >
                Next &rarr;
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default Home;