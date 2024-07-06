import { useState, useEffect } from "react";
import './MovieList.css';
import MovieCard from '../components/MovieCard'
import Header from "../components/Header";

// const API_URL = process.env.API_URL;
// const API_KEY = process.env.API_KEY;

function MovieList(props) {

    const [movies, setMovies] = useState([])
    const [movieFilter, setMovieFilter] = useState([])
    const [suchbegriff, setSuchbegriff] = useState('')

    async function getData() {
        let data = await fetch(process.env.REACT_APP_URL + 'user/')
        .then (resp => resp.json())
        setMovies(data)
        setMovieFilter(data)
    }

    useEffect(() => {
        getData()
    }, [])

    const searchChanger = (e) => {
        setSuchbegriff(e.target.value)
    }

    const searchHandler = () => {
        const lowerCase = suchbegriff.toLowerCase()
        const gefiltert = movies.filter(film =>
            film.title.toLowerCase().includes(lowerCase)
        )
        setMovieFilter(gefiltert)
    }

    const searchResetHandler = () => {
        setSuchbegriff('')
        setMovieFilter(movies)
    }


    return (<>
        <Header 
            auth={props.auth} 
            setAuth={props.setAuth} 
            username={props.username} 
            suchbegriff = {suchbegriff}
            searchChanger={searchChanger}
            search={searchHandler}
            resetSearch={searchResetHandler}
        />
        <div id="wrapper">
            {
                movieFilter.map((movie, index) => {
                    return <MovieCard 
                            key={index}
                            movie={movie}
                            
                    />
                })
            }
        </div>
    </>)
}

export default MovieList;