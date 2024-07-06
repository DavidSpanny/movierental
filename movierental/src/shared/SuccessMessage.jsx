import { useState } from "react";
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

function ShowSuccessMessage(props) {

    const [show, setShow] = useState(true);

    return (
        <>
        <Alert show={show} variant="success">
            <Alert.Heading>Erfolg!</Alert.Heading>
            <p>
                {props.children}
            </p>
            <hr />
            <div className="d-flex justify-content-end">
                <Button onClick={() => setShow(false)} variant="outline-success">
                    Schließen
                </Button>
            </div>
        </Alert>
        </>
    )
}

export default ShowSuccessMessage;