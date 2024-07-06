import './Favoriten.css';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import FavoritesCard from '../components/FavoritesCard';

function Favoriten (props) {

    const [meineFavoriten, setMeineFavoriten] = useState([])

    

    const getMeineFavoriten = async () => {
        const usertoken = localStorage.getItem('usertoken')

        try {
            let resp = await fetch(process.env.REACT_APP_URL + 'user/meinefavoriten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usertoken: usertoken })
            })
            let data = await resp.json()
            setMeineFavoriten(data.favoriten)
            
            


        } catch (err) {
            console.log('Fehler bei laden aus array', err)
        }
    }

    useEffect(() => {
        getMeineFavoriten()
    }, [])
    

    return (<>
    <Header 
            auth={props.auth} 
            setAuth={props.setAuth} 
            username={props.username} 
        />
    
    <div id="wrapper">
        
    {
        
                meineFavoriten.map((movie, index) => {
                    return <FavoritesCard 
                            key={index}
                            movie={movie}
                            
                    />
                })
            }
        
    </div>

    </>)
}

export default Favoriten;