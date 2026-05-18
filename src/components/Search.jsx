import React from 'react'
import searchIcon from "./assets/search.svg"


const Search = ({searchTerm,setSearchTerm}) => {
return (
    <div className='search'>
            <img src={searchIcon} alt="Magnifying glass icon for searching movies" />

            <input
            type="text" 
            placeholder='Search for a movie...' 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
)
}

export default Search