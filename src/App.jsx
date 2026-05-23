
import './index.css'
import { useEffect, useState } from 'react'

import  Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { updateSearchCount, getTrendingMovies } from './appwrite';
import logo from "./assets/logo.png"
import heroImg from "./assets/hero-img.png"


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
const [movies, setMovies] = useState([])
const [errorMessage, setErrorMessage] = useState('')
const [isLoading, setIsLoading] = useState(false)
const [trendingMovies, setTrendingMovies] = useState([])




  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')

    try {

      const endPoint = query 
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
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

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0])
      }
    } catch(error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Failed to fetch movies. Please try again later. ${error}`)
    }

    finally{
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const trending = await getTrendingMovies()
      setTrendingMovies(trending)

  }catch(error){
  console.error(`Error fetching trending movies: ${error}`);
}
  }


useEffect(() => {
  fetchMovies(searchTerm)
}, [searchTerm])

useEffect(() => {
  loadTrendingMovies()
}, [])

  return (
 <main>
      <div className="pattern" /> 
      <div className="wrapper">

        <header>
          <img  src={logo} alt="Movie discovery application logo" className="size-auto" />
          <h1 className="site-name">GoodStory</h1>
          <img src={heroImg} alt="Hero banner for movie discovery service featuring promotional imagery" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
           <Search searchTerm={searchTerm}  setSearchTerm={setSearchTerm} />
        </header>

        <section className="trending">
              <h2>Trending Movies</h2>
              {trendingMovies.length > 0 && (
                <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={`${movie.title} movie poster, ranked ${index + 1} in trending`} />
                  </li>
                ))}
              </ul>
          )}

  
          </section>

        <section className="all-movies" id="results">
          <h2>All Movies</h2>
          
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movies.length === 0 ? (
            <p className="text-white">No Movies Found</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}



export default App





