
import './App.css'
import { useState, useEffect } from 'react'

function Card({title}){
    const [count, setCount] = useState(0)
    const [hasLiked, setHasLiked] = useState(false)

    useEffect(() => {
      console.log(`${title} has been liked: ${hasLiked}`)
    }, [title,hasLiked]);

  return (
    <div className='card' onClick={() => setCount((prevCount) => prevCount + 1) }>
      <h2>{title} - {count}<br/>  </h2>
      <button onClick={() => setHasLiked(!hasLiked)}>
        {hasLiked ? '❤️' : '🤍'}
      </button>
    </div>
  )
}

function App()  {

  return (
    <div className='card-container'>

    <Card title="Star Wars" />
    <Card title="Avatar" />
    <Card title="The Loin King" />
    </div>
  )
}

export default App
