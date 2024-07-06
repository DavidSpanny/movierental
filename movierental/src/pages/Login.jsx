import './Login.css';
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import ShowErrorMessage from '../shared/ErrorMessage';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

function Login(props) {

    const navigate = useNavigate()

    const [error, setError] = useState('');

    const [userdata, setUserdata] = useState({
        username: '',
        passwort: '',
    });

    const changeHandler = (e) => {
        setUserdata({...userdata, [e.target.name]: e.target.value});
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        // console.log(userdata)

        let resp = await fetch(process.env.REACT_APP_URL + 'user/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: userdata.username,
                passwort: userdata.passwort
            })
        }).then(resp => resp.json())



        if (!resp.status) {
            setError(resp.err)
        } else {
            setError('')
            // console.log('Serverantwort:', resp)
            props.setAuth(true)
            props.setToken(resp.token)
            localStorage.setItem('usertoken', resp.token)

            // console.log(resp.isAdmin)

            const decodedToken = jwtDecode(resp.token)
            if (decodedToken.isAdmin) {
                // console.log('Er ist Admin')
                props.setisAdmin(true)
            } else {
                // console.log('Kein Admin')
                props.setisAdmin(false)
            }
        }
        
    }

    const cancelHandler = () => {
        navigate('/')
    }


    return (<>
        <form action="" className='loginForm' onSubmit={submitHandler}>
        <h1>Einloggen</h1>
            {error !== '' && <ShowErrorMessage>{error}</ShowErrorMessage>}
            <div>
                <label htmlFor="username">Username</label> <br />
                <input type="text" 
                    name='username' 
                    id='username'
                    className='username'
                    value={userdata.username}
                    onChange={changeHandler} />
            </div>
            
            <div>
                <label htmlFor="passwort">Passwort</label> <br />
                <input type="password"
                    name='passwort'
                    id='passwort'
                    className='passwort'
                    value={userdata.passwort}
                    onChange={changeHandler} />
            </div>
            
            <button type='submit' id='register_btn'>Einloggen</button>
            <button type='button' id='reset_btn' onClick={cancelHandler}>Abbrechen</button>
            <Link to="/forgotpassword">Passwort vergessen?</Link>
        </form>
</>)
}

export default Login;