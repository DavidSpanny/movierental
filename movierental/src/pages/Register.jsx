import './Register.css';
import { useState } from 'react';
import { Navigate, useNavigate} from 'react-router-dom';
import ShowErrorMessage from '../shared/ErrorMessage';
import ShowSuccessMessage from '../shared/SuccessMessage';

function Register(props) {

    const navigate = useNavigate()

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [userdata, setUserdata] = useState({
        username: '',
        email: '',
        passwort: '',
        passwort2: ''
    });

    const changeHandler = (e) => {
        setUserdata({...userdata, [e.target.name]: e.target.value});
    }

    const submitHandler = async (e) => {
        e.preventDefault();

        if (userdata.passwort !== userdata.passwort2) {
            setError('Passwort stimmt nicht überein')
        } else {
            setError('')
            let resp = await fetch(process.env.REACT_APP_URL + 'user/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: userdata.username,
                    email: userdata.email,
                    passwort: userdata.passwort
                })
            }).then(resp => resp.json())

            if (!resp.status) {
                setError(resp.err)
            } else {
                setSuccess('Registrierung war OK')
            }
        }
    }

    const cancelHandler = () => {
        navigate('/')
    }


    return (<>
        
        {success !== '' && <ShowSuccessMessage>{success}</ShowSuccessMessage>}
        {success !== '' ?
            <Navigate to="/login" />

            :


        <form action="" className='loginForm' onSubmit={submitHandler}>
        <h1>Registrieren</h1>
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
                <label htmlFor="email">E-Mail</label> <br />
                <input type="text"
                    name='email'
                    id='email'
                    className='email'
                    value={userdata.email}
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
            <div>
                <label htmlFor="passwort2">Passwort wiederholen</label> <br />
                <input type="password"
                    name='passwort2'
                    id='passwort2'
                    className='passwort2'
                    value={userdata.passwort2}
                    onChange={changeHandler} />
            </div>
            <button type='submit' id='register_btn'>Registrieren</button>
            <button type='button' id='reset_btn' onClick={cancelHandler}>Abbrechen</button>
        </form>}
</>)
}

export default Register;