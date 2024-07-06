import { Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SuccessOverlay(props) {
    const navigate = useNavigate()

    const clickHandler = () => {
        
        navigate("/")
    }


    return (<>

        <div className="success-alert-overlay">
           <Alert variant="success" className="success-alert" onClose={props.onClose} dismissible>
                <Alert.Heading>Film erfolgreich reserviert!</Alert.Heading>
                <p>Danke für das Reservieren des Films</p>
                <hr />
                <div className="d-flex justify-content-end">
                    <Button onClick={clickHandler} variant="outline-success">
                        OK
                    </Button>
                </div>

           </Alert>
        </div>

    </>)
}

export default SuccessOverlay;