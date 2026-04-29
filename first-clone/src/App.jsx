
import './index.css'
import { useState, useEffect } from 'react'
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';

const   API_BASE_URL = 'https://api.themoviedb.org/3'
const   API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App()  {

const [searchTerm, setSearchTerm] = useState('')
const [errorMessage, setErrorMessage] = useState('')
const [movies, setMovies] = useState([])
const [isLoading, setIsLoading] = useState(false)


useEffect(() => {
  const fetchMovies = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const endPoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endPoint, API_OPTIONS)

      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`)
               

      }
      const data = await response.json()
      if(data.response === 'False'){
        setErrorMessage(data.error || 'failed to fetch movies')
        setMovies([])
        return
      }
      setMovies(data.results || [])
    }

    catch(error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Failed to fetch movies. Please try again later. ${error}`)
    }

    finally{
      setIsLoading(false)
    }
  }

  fetchMovies()
},[]);

  return (
    <main>
      <div className="pattern">
        <img src="/bg-hero.png" alt="Background" />
      </div>
      <div className="wrapper">
        <header>
          
          <img src="/hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
           <Search searchTerm={searchTerm}  setSearchTerm={setSearchTerm} />
        </header>

       
        <section className="all-movies">
          <h2 className="mt-5">All Movies</h2>
          

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          )  : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )
          }
        </section>
      </div>
    </main>
  )
}



export default App





