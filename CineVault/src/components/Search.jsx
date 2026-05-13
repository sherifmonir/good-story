import React from 'react'

const Search = ({searchTerm,setSearchTerm}) => {
return (
    <div className='search'>
            <img src="/search.svg" alt="Magnifying glass icon for searching movies" />

            <input
            type="text" 
            placeholder='Search for a movie...' 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
)
}

export default Search