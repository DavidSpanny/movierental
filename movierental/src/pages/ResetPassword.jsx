import { useState } from "react";
import { useParams } from "react-router-dom";
import './ResetPassword.css'
import ShowSuccessMessage from "../shared/SuccessMessage";


function ResetPassword() {

    const {token} = useParams()
    const [password, setPassword] = useState('')
    const [success, setSuccess] = useState('')
    // const navigate = useNavigate()

    // useEffect(() => {
    //     let res = fetch (`/resetpassword/${token}`)
    //     // console.log(res)
    //     if (res) {
    //         navigate(`/resetpassword/${token}`)

    //     }
    // }, [])
    

    const submitHandler = async (e) => {
        e.preventDefault()

        try {
            let resp = await fetch(process.env.REACT_APP_URL + `user/resetpassword/${token}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({password: password})
            });
            let data = await resp.json();
            // console.log('Hat geklappt')
            setSuccess(data.msg)

        } catch (err) {
            console.log('Fehler bei Link', err)
           
        }
    }

    return (<>

    {success !== '' && <ShowSuccessMessage>{success}</ShowSuccessMessage>}


    <div>
        <form onSubmit={submitHandler} className="pwResetForm">
        <h2>Passwort zurücksetzen</h2>
        <div>
            <label htmlFor="resetForm"></label>
            <input 
                type="text"
                placeholder="Neues Passwort eingeben"
                id="resetForm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
            />
        </div>
            
            <button type="submit">Passwort zurücksetzen</button>
        </form>
     
    </div>
    
    
    
    
    
    </>)
}

export default ResetPassword;