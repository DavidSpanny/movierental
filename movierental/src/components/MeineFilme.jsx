import { useEffect, useState } from "react"
import './MeineFilme.css'
import {Link} from 'react-router-dom'
import Header from "./Header"

function MeineFilme(props) {

    const [meinefilme, setMeineFilme] = useState([])

    useEffect(() => {
        document.body.style.backgroundColor = 'white';
        return () => {
            document.body.style.backgroundColor = '';
        }
    }, [])


    const getMeineFilme = async () => {

        const usertoken = localStorage.getItem('usertoken')
        



        try {
            let resp = await fetch(process.env.REACT_APP_URL + 'user/meinefilme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usertoken: usertoken })
            })
            let data = await resp.json()
            setMeineFilme(data.meineFilme)


        } catch (err) {
            console.log('Fehler bei laden aus array', err)
        }
    }

    useEffect(() => {
        getMeineFilme()
    }, [])




    return (<>
        <Header auth={props.auth} setAuth={props.setAuth} username={props.username} />

        <h2>Meine reservierten Filme</h2>
        <div style={{textAlign: "center"}}>
            <Link to="/" className="btn meineFilmeLink">Zurück</Link>
        </div>

        <table className="myMovieTable">
            <thead>
                <tr>
                    <th>Nr.</th>
                    <th>Titel</th>
                    <th>Verfügbarkeit bis:</th>
                </tr>
            </thead>
            <tbody>
                
                    {meinefilme.map((movie, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{movie.title}</td>
                            <td>{movie.rentedTo}</td>
                            <td>
                                <Link to={`/details/${movie.id}`}>Zum Film:</Link>
                            </td>
                        </tr>
                    ))}
                
            </tbody>
        </table>





    </>)
}

export default MeineFilme;