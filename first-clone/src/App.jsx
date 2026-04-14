
import './App.css'

function Card({title}){
  return (
    <div className='card'>
      <h2>{title}</h2>
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
