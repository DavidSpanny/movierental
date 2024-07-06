
import { useEffect } from "react";

function Logout(props) {

    useEffect(() => {
        props.setAuth(false);
        props.setToken('')
        localStorage.removeItem('usertoken')
        props.setUsername('')
    }, [])

    // props.setAuth(false)

    return (<>

        {/* {<Navigate to="/" />} */}
    </>)
}

export default Logout;