import Header from "../components/Header";
import './AdminPage.css';
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";


const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

// console.log(process.env)


function AdminPage(props) {

    const {id} = useParams()
    const [movies, setMovies] = useState([])

    const [page, setPage] = useState(1);

    const [selectedMovies, setSelectedMovies] = useState([])

    const [query, setQuery] = useState('')


    async function loadAllMovies(pageNr) {
        // console.log('AdminPage:', API_KEY)
        let data = await fetch(`${API_URL}discover/movie?api_key=${API_KEY}&include_adult=false&language=de-DE&page=${pageNr}`)
        
            .then(resp => resp.json())

        setMovies(data.results)
    }

    async function getData() {
        let data = await fetch(process.env.REACT_APP_URL + 'user/')
        .then (resp => resp.json())

        let selected = data.map(el => {
            return el.id
        });
        // console.log(selected)
        setSelectedMovies(selected)

    }

    useEffect(() => {
        loadAllMovies(page, selectedMovies)
    }, [page, selectedMovies])

    useEffect(() => {
        getData()
    }, [])




    const nextPage = () => {
        setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };


    const checkboxHandler = (id) => {
        let movies = [...selectedMovies] // Kopie
        let index = movies.indexOf(id) // finde die Id, ist die Id nicht in, ist es -1

        if (typeof id === 'number' && index !== -1) { // !== -1 => Id wurde gefunden
            movies.splice(index, 1) // das erste Vorkommen dieser Id
        } else if (typeof id === 'number') {
            movies.push(id) // hinzufügen
        }

        setSelectedMovies(movies)
    }


    const saveMovies = async (e) => {
        e.preventDefault();


    const selectedMovieIds = selectedMovies;

    // jeder Film im Array sendet ein Request und holt Infos ab für JEDEN
    const detailedMoviesData = await Promise.all(selectedMovieIds.map(async (id) => {

        // für jede Id werden die passenden Infos abgerufen
        const response = await fetch(`${API_URL}movie/${id}?api_key=${API_KEY}&language=de-DE`);
        const movieData = await response.json();

        // Film hat mehrere Genres im Array, ich will das erste haben
        let oneGenre = movieData.genres && movieData.genres.map(genre => genre.name)
        
        return {
            id: (movieData.id) * 1,
            poster_path: movieData.poster_path,
            backdrop_path: movieData.backdrop_path,
            title: movieData.title,
            genre: oneGenre[0],
            release_date: movieData.release_date,
            runtime: movieData.runtime * 1,
            summary: movieData.overview
        };
    }));

        await fetch(process.env.REACT_APP_URL + 'user/saveselected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detailedMoviesData)
        }).then(resp => resp.json())
        // console.log(detailedMoviesData[0])

        // entferne aus dem movie-array alle IDs, die nicht Teil des selectedMovies-Array sind
        // selectedMovies sind die Filme, die auf Startseite angezeigt werden
        // von den gefilterten movie-array-nicht-enthaltenen Filme wird ein Array gebildet
        // und die ID von jedem herausgefunden
        const removedMovieIDs = movies.filter(movie => !selectedMovies.includes(movie.id)).map(movie => movie.id)

        // nur wenn Filme entfernt wurden. Nix entfernt? Dann ist die Länge nicht größer als 0
        if (removedMovieIDs && removedMovieIDs.length > 0) {
            await fetch(process.env.REACT_APP_URL + 'user/removeselected', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({movieIds: removedMovieIDs})
            })
            .then(resp => resp.json())
        }



        setSelectedMovies([])
    }


    const searchMovies = async () => {
        let data = await fetch(`${API_URL}search/movie?api_key=${API_KEY}&query=${query}&language=de-DE`)
        .then (resp => resp.json())
        // console.log(data.results)
        setMovies(data.results)
    }

    const resetSearchMovies = () => {
        setQuery('')
        loadAllMovies(page)
    }



    return (<>
        <Header auth={props.auth} isAdmin={props.isAdmin} />

        <div className="searchBar">
            <input 
                type="text"
                placeholder="Suche..."
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
            />
            <button className="searchBtn" onClick={searchMovies}>Suchen</button>
            <button className="resetSearchBtn" onClick={resetSearchMovies}>Zurücksetzen</button>
        </div>

        <table className="admin_table">
            <thead>
                <tr>
                    <th>Ausgewählt</th>
                    <th>Poster</th>
                    <th>Titel</th>
                    <th>Datum</th>
                </tr>
            </thead>
            <tbody>
                {/* erzeuge für jeden Film der API */}
                {movies.map(movie => (
                    <tr key={movie.id}>
                        <td><input
                            type="checkbox"
                            checked={selectedMovies.includes(movie.id)}
                            onChange={() => checkboxHandler(movie.id)} /></td>
                        <td><img src={`http://image.tmdb.org/t/p/w200/${movie.poster_path}`} alt={movie.title} /></td>
                        <td>{movie.title}</td>
                        <td>{movie.release_date}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="pag_buttons">
            <button onClick={prevPage}>Vorherige Seite</button>
            <button onClick={nextPage}>Nächste Seite</button>
        </div>
        <button onClick={saveMovies} className="addMoviesBtn">Hinzufügen</button>



    </>)
}

export default AdminPage;