import { useState } from "react";
import Alert from 'react-bootstrap/Alert';

function ShowErrorMessage(props) {

    const [show, setShow] = useState(true);

    if (show) {
        return (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <Alert.Heading>Achtung!</Alert.Heading>
                <p>
                    {props.children}
                </p>
            </Alert>
        )
    }
} 

export default ShowErrorMessage;