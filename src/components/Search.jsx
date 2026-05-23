import { useState } from 'react'
import searchIcon from "../assets/search.svg"

const Search = ({setSearchTerm}) => {

    const [inputValue, setInputValue] = useState('')
    const handleInputValue = () =>
        {
        setSearchTerm(inputValue.trim())
        document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" })
        }

    return (
        <div className='search'>
            <img src={searchIcon} alt="search-icon" onClick={handleInputValue} className="cursor-pointer"/>
            <input
            type="text" 
            placeholder='Search for a movie...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInputValue()}
            />

        </div>
        )

}


export default Search