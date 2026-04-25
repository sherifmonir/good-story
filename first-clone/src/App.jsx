
import './index.css'
import { useState, useEffect } from 'react'
import Search from './components/Search';


function Card({title}){
    const [count, setCount] = useState(0)
    const [hasLiked, setHasLiked] = useState(false)

    useEffect(() => {
      console.log(`${title} has been liked: ${hasLiked}`)
    }, [title,hasLiked]);

  return (
    <div className='card' onClick={() => setCount((prevCount) => prevCount + 1) }>
      <h2>{title} - {count} </h2>
      <button onClick={() => setHasLiked(!hasLiked)}>
        {hasLiked ? '❤️' : '🤍'}
      </button>
    </div>
  )
}

function App()  {

const [searchTerm, setSearchTerm] = useState('')

  return (
    <main>
      <div className="pattern">
        <img src="/bg-hero.png" alt="Background" />
      </div>
      <div className="wrapper">
        <header>
          
          <img src="/hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
        </header>

        <Search searchTerm={searchTerm}  setSearchTerm={setSearchTerm} />

      </div>
    </main>
  )
}

export default App
