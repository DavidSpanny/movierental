import { useEffect, useState } from "react"
import './ReservierteFilme.css'
import {Link} from 'react-router-dom'
import Header from "./Header"

function ReservierteFilme (props) {

    const [meinefilme, setMeineFilme] = useState([])

    useEffect(() => {
        document.body.style.backgroundColor = 'white';
        return () => {
            document.body.style.backgroundColor = '';
        }
    }, [])


    const getReservierteFilme = async () => {

        const usertoken = localStorage.getItem('usertoken')



        try {
            let resp = await fetch(process.env.REACT_APP_URL + 'user/reserviertefilme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usertoken: usertoken })
            })
            let data = await resp.json()
            setMeineFilme(data.reservierteFilme)


        } catch (err) {
            console.log('Fehler bei laden aus array', err)
        }
    }

    useEffect(() => {
        getReservierteFilme()
    }, [])




    return (<>

        <Header auth={props.auth} setAuth={props.setAuth} username={props.username} />

        <h2>Bisher ausgeborgte Filme</h2>
        <div style={{textAlign: "center"}}>
            <Link to="/" className="btn meineFilmeLink">Zurück</Link>
        </div>

        <table className="myMovieTable">
            <thead>
                <tr>
                    <th>Nr.</th>
                    <th>Titel</th>
                    <th>Ausgeborgt am:</th>
                    <th>Ausgeborgt bis:</th>
                </tr>
            </thead>
            <tbody>
                
                    {meinefilme.map((movie, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{movie.title}</td>
                            <td>{movie.rentedAt}</td>
                            <td>{movie.rentedTo}</td>
                            
                        </tr>
                    ))}
                
            </tbody>
        </table>





    </>)
}

export default ReservierteFilme;