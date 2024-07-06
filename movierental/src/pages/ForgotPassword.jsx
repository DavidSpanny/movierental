import { useState } from "react";
import './ForgotPassword.css'
import { useNavigate } from "react-router-dom";
import ShowSuccessMessage from "../shared/SuccessMessage";

function ForgotPassword() {

    const [email, setEmail] = useState('')
    const [success, setSuccess] = useState('')

    const navigate = useNavigate()

    const cancelHandler = () => {
        navigate('/')
    }


    const submitHandler = async (e) => {
        e.preventDefault()

        try {
            let resp = await fetch(process.env.REACT_APP_URL + 'user/forgotpassword', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email})
            })

            let data = await resp.json()
            // console.log(data)
            // console.log('Hat geklappt')
            setSuccess(data.msg)

        } catch (err) {
            console.log('Fehler bei finden des Users')
            
        }
    }

    return (<>

    {success !== '' && <ShowSuccessMessage>{success}</ShowSuccessMessage>}


    <div>
        <form onSubmit={submitHandler} className="pwForgotForm">
        <h2>Passwort vergessen</h2>
        <div>
            <label htmlFor="forgotInput">E-Mail eingeben</label>
            <input 
                type="text"
                placeholder="E-Mail eingeben"
                id="forgotInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
            />
        </div>
            
            <button type="submit">Absenden</button>
            <button type='button' id='reset_btn' onClick={cancelHandler}>Abbrechen</button>
        </form>
        
    </div>
    


    </>)
}

export default ForgotPassword;