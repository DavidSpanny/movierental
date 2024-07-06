import { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link, NavLink, useLocation } from 'react-router-dom';
import  Button  from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas'


function Header(props) {

        const location = useLocation();

    
        const [show, setShow] = useState(false)

        const [avatar, setAvatar] = useState(null)


        const [showInteractions, setShowInteractions] = useState(false)
       

        const fileUpload = useRef(null)

    

        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);

        const showIntButtons = () => {
            setShowInteractions(!showInteractions)
        }


    const getAvatar = async () => {

        try {
            const usertoken = localStorage.getItem('usertoken')
            let resp = await fetch(process.env.REACT_APP_URL + 'user/getavatar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usertoken: usertoken})
            })

            let data = await resp.json()
            if (data.status === true) {
                setAvatar(data)
                // console.log(avatar)

            } else {
                setAvatar(null)
                // console.log('Avatar nicht gesetzt')
            }
        } catch (err) {
            console.log('Fehler bei getAvatar', err)
        }
        
    }

    useEffect(() => {
        getAvatar()
    }, [])
    


    const handleChange = () => {
        const file = fileUpload.current.files[0]
        const formData = new FormData()
        formData.append('avatar', file)
        formData.append('usertoken', localStorage.getItem('usertoken'))

        // console.log(file, formData)

        fetch(process.env.REACT_APP_URL + 'user/uploadavatar', {
            method: 'POST',
            // headers: {'Content-Type': 'multipart/form-data'},
            body: formData
        })
        .then (resp => resp.json())
        .then (data => {
            if (!data.status) {
                console.log('Fehler bei Speichern des Avatar', data.msg)
            }
        })
        .catch (err => {
            console.log('fehler bei upload', err)
        }) 
    }




    return (<>
        <div id="header">
            <Link to="/" id="logo">Movie Rental</Link>
            {props.auth ? 
                <>
                    <NavLink to="/logout" className='logout_btn'>Logout</NavLink>
                    {!props.isAdmin && <Button className='userIcon' onClick={handleShow}>
                        
                        {avatar ? <img src={avatar.data} className='avatar' alt='' /> : props.username}
                        
                        </Button>}

                    

                    {/* Suchleiste */}
                    {!props.isAdmin && location.pathname === '/' &&
                    <div className='searchBar'>
                        <input 
                            type="text"
                            placeholder='Suche...'
                            value={props.suchbegriff}
                            onChange={props.searchChanger} 
                        />
                        <button className='searchBtn' onClick={props.search}>Suchen</button>
                        <button className='resetSearchBtn' onClick={props.resetSearch}>Zurücksetzen</button>
                    </div>}
                    

                    <Offcanvas
                        scroll={true} 
                        show={show} 
                        onHide={handleClose} 
                        placement='end'
                        >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title style={{fontSize: 36}}>Mein Konto
                        
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className='offcanvas-body'>
                            <Link to="/meinefilme" className='offcanvas-link'>Meine Filme</Link>
                            <Link to="/ausgeborgtefilme" className='offcanvas-link'>Ausgeborgte Filme</Link>
                            <Link to="/favoriten" className='offcanvas-link'>Favoriten</Link>
                            <Button to="/einstellungen" className='offcanvas-link' onClick={showIntButtons}>Einstellungen</Button>

                            {showInteractions && (
                                <div className='intButtons'>
                               <label htmlFor="avatar">Profilbild hochladen</label>
                                <input 
                                type="file"
                                name='avatar'
                                className='fileInput'
                                ref={fileUpload}
                                
                                onChange={handleChange} 
                                />
                                <Button style={{backgroundColor: 'red'}}>User löschen</Button>
                            </div>
                            )}
                            
                            
                        
                         
                        </Offcanvas.Body>
                    </Offcanvas>



                </>
             : 
                <>
                    <NavLink to="/register" className='register_btn'>Registrieren</NavLink>
                    <NavLink to="/login" className='login_btn'>Login</NavLink>
                </>
            }


        </div>
    </>)
}

export default Header;