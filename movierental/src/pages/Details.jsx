import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './Details.css'
import Header from "../components/Header";
import {  Spinner } from 'react-bootstrap';
import SuccessOverlay from "../components/SuccessOverlay";
import ShowErrorMessage from "../shared/ErrorMessage";
import ShowSuccessMessage from "../shared/SuccessMessage";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;
const POSTER = 'http://image.tmdb.org/t/p/w500/';



const Details = (props) => {

    const navigate = useNavigate()

    let { id } = useParams();
    id *= 1;

    // Detailsseite
    const [details, setDetails] = useState({});

    const [loadingspinner, setLoadingspinner] = useState(true);

    // Speichern des Bestellformular
    const [movieReservation, setMovieReservation] = useState(false)

    // Speichern des eigegebeben Datums
    const [reservationDate, setReservationDate] = useState('')

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('')

    // drücken auf Favoriten-hinzufügen
    const [favoriten, setFavoriten] = useState([])

    // lade Filme, die reserviert wurden
    const [isRented, setIsRented] = useState([])

    const loadDetails = async () => {

        <Spinner animation="border" role="status">
            <span className="visually-hidden">Lädt...</span>
        </Spinner>

        try {
            let data = await fetch(`${API_URL}movie/${id}?api_key=${API_KEY}&language=de-DE`)
                .then(resp => resp.json());
            // console.log(data);
            setDetails(data);
        } catch (e) {
            setError('Fehler beim Laden der Details')
        } finally {
            setLoadingspinner(false)
        }
    }

    useEffect(() => {
        loadDetails();
    }, [])

    useEffect(() => {
        checkIfRented()
    }, [details.id])


    useEffect(() => {
        if (details.id) {
            checkIfFavorite();
            
        }
        
    }, [details])


    useEffect(() => {
        document.body.style.backgroundColor = 'white';
        return () => {
            document.body.style.backgroundColor = '';
        }
    }, [])

    const genreNames = details.genres && details.genres.map(genre => genre.name);




    const resObj = {
        id: details.id,
        title: details.title,
        posterPath: details.poster_path,
        rentedTo: reservationDate,
    }


    if (localStorage.getItem('usertoken')) {
        const usertoken = localStorage.getItem('usertoken')

        resObj.usertoken = usertoken
    }
    

    // öffnen des Bestell-Formular für auswahl Tage und Preis
    const reservationClickHandler = () => {
        
        if (isRented.includes(details.id)) {
            navigate(`/watch/${details.id}`)
        } else {
            setMovieReservation(true);
        }
    }





    // zeige ein success-alert bei erfolgreichem Bestellen des Films
    const [successAlert, setSuccessAlert] = useState(false)

    const alertCloseHandler = () => {
        setSuccessAlert(false)
        setReservationDate('')
        setDays(0)
        setPrice(0)
        setSuccess('')
    }







    // Abschicken MIT ausgewählen Tagen und Preise
    const submitHandler = async (e) => {
        e.preventDefault()
        
        

        try {
            let resp = await fetch(process.env.REACT_APP_URL + 'user/savereservation', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(resObj)
            })
            .then(res => res.json())

            if (!resp.status) {
                setError(resp.msg)
            } else {
                setSuccess(resp.msg)
                setSuccessAlert(true)
            }
            
        } catch (err) {
            console.log('Fehler bei senden', err)
        }
        
    }






    const [days, setDays] = useState(0)
    const [price, setPrice] = useState(0)

    // Berechnen der Tage und Preis insgesamt
    const calcPriceAndDays = (date) => {
        const chosedDate = new Date(date)
        const today = new Date()
        const diffInTime = chosedDate.getTime() - today.getTime()
        const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24)) // runde auf ganzen Tag

        setDays(diffInDays)
        setPrice(diffInDays * 3)


    }

    // Anzeigen der Tage und Kosten insgesamt
    const dateChangeHandler = (e) => {
        const chosedDate = e.target.value
        setReservationDate(chosedDate)
        calcPriceAndDays(chosedDate)
    }



    // addOrRemoveFavorit - Funktion mit unterschiedlichen Inhalttext und Method (post oder delete)
    const addOrRemoveFavorit = async () => {

        const usertoken = localStorage.getItem('usertoken')

        try {
            const method = favoriten.includes(id) ? 'DELETE' : 'POST';
            let resp = await fetch(process.env.REACT_APP_URL + 'user/favorite', {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: details.id, posterPath: details.poster_path, usertoken: usertoken})
            })
            let data = await resp.json();
            if (data.status) {
                setFavoriten(method === 'DELETE' ? favoriten.filter(favId => favId !== id) : [...favoriten, id]);
                setSuccess(data.msg)
            } else {
                setError(data.msg)
            }
        } catch(err) {
            console.log('Fehler bei adden oder removen des favorit')
            setError('Fehler bei Hinzufügen oder Löschen des Favorit')
        }
    }


    // überprüfe ob jener film im array als favorit markiert wurde
    const checkIfFavorite = async () => {
        
        let usertoken;
        if (localStorage.getItem('usertoken')) {
            usertoken = localStorage.getItem('usertoken')
        } else {
            usertoken = ''
        }
        
        try {
            setError('');
            let resp = await fetch(process.env.REACT_APP_URL + 'user/checkiffavorite', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: details.id, usertoken: usertoken})
            })
            let data = await resp.json()

            // console.log('das ist mein data', data)

            let f = []
            f.push(data.isFavorit.id)
            setFavoriten(f)

            // console.log('das ist mein favorit', f)

        } catch (err) {
            // console.log('es ist kein favorit mehr!')
            // setError('Fehler bei Überprüfung des Favorit')
        }
    }


    // console.log(favoriten, id, favoriten.includes(id*1))

    const checkIfRented = async () => {
        let usertoken;
        if (localStorage.getItem('usertoken')) {
            usertoken = localStorage.getItem('usertoken')
        } else {
            usertoken = ''
        }

        try {
            setError('')
            let resp = await fetch(process.env.REACT_APP_URL + 'user/meinefilme', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: details.id, usertoken: usertoken})
            })
            let data = await resp.json()
            // console.log('Das sind die filme', data)
            // console.log(data.meineFilme)

            let rentedID = data.meineFilme.map(film => film.id)
            setIsRented(rentedID)
            // console.log(rentedID)


        } catch (err) {
            
        }
    }





    return (<>
        <Header auth={props.auth} setAuth={props.setAuth} username={props.username} />

        {error !== '' && <ShowErrorMessage>{error}</ShowErrorMessage>}

        {success !== '' && <ShowSuccessMessage>{success}</ShowSuccessMessage>}
        

        {loadingspinner ? (
            <div className="loading-spinner">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Laden...</span>
                </Spinner>
            </div>
        ) 
        
        : 

        <div className="displayDetails">

            {!props.auth ? (
                <>
                    {details.title && `Um ${details.title} ansehen zu können, müssen Sie sich zuerst anmelden!`}
                </>
            ) : (
                <>
                    <img src={POSTER + details.backdrop_path} alt="" />
                    <p>{details.title}</p>

                    {/* Favoriten-Button */}
                    <button className="favBtn" onClick={addOrRemoveFavorit}>
                        { id && favoriten.includes(id) ? 'Aus Favoriten löschen' : 'Als Favorit hinzufügen'}
                    </button>


                    <div>
                        <p>{'Genre: ' + genreNames[0]}</p>
                        <p>{'Produktionsdatum: ' + details.release_date}</p>
                        <p>{'Dauer: ' + details.runtime + ' Minuten'}</p>
                    </div>
                    <p className="overview">{details.overview === '' ? 'Keine Beschreibung verfügbar' : details.overview}</p>
                    <button className="rent_btn" 
                        onClick={reservationClickHandler}
                        style={{backgroundColor: isRented.includes(details.id) ? 'blue' : 'green'}}
                        
                    >{isRented.includes(details.id) ? 'Ansehen': 'Reservieren'}
                    </button>
                    

                    {/* Success-Overlay */}
                    {successAlert && <SuccessOverlay onClose={alertCloseHandler} />}

                    {/*Reservierungs-Formular*/}
                    {movieReservation && (
                        <form onSubmit={submitHandler} className="res_form">
                            <label htmlFor="res_date">Dauer der Reservierung:</label>
                            <input 
                                type="date"
                                id="res_date"
                                value={reservationDate}
                                onChange={dateChangeHandler} min={new Date().toISOString().split('T')[0]} required
                            />
                            <p>Ausgewählte Anzahl der Tage: {days}</p>
                            <p>Preis: {price} €</p>
                            <button type="submit">Verpflichtend bestellen</button>
                        </form>
                    )}

                   

                    



                </>
            )}

        </div>}
        
    </>)
}
export default Details;