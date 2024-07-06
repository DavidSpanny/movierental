import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MovieList from './pages/MovieList';
import Details from './pages/Details';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './components/Logout'
import AdminPage from './pages/AdminPage';
import { jwtDecode } from 'jwt-decode';
import MeineFilme from './components/MeineFilme';
import ReservierteFilme from './components/ReservierteFilme';
import Favoriten from './pages/Favoriten'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {

  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState('')

  const [username, setUsername] = useState('')

  const [isAdmin, setisAdmin] = useState(false)

  useEffect(() => {
    let localToken = localStorage.getItem('usertoken')
    if (localToken && localToken !== '') {
      fetch(process.env.REACT_APP_URL + 'user/checktoken', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localToken }
      }).then(resp => resp.json()).then(resp => {
        if (resp.status) {
          setToken(localToken)
          setAuth(true)

          const decodedToken = jwtDecode(localToken)

          setUsername(decodedToken.username.charAt(0).toUpperCase())

          if (decodedToken.isAdmin) {
            setisAdmin(true)
          }


        }

      })
    }
  }, [username, auth, token])



  const routesNichtEingeloggt = () => {
    return (
      <Routes>
        <Route path="/" element={<MovieList auth={auth} setAuth={setAuth} />} />
        <Route path='/register' element={<Register />} />

        <Route path='/login' element={<Login
          auth={auth}
          setAuth={setAuth}
          setToken={setToken}
          setUsername={setUsername}
          setisAdmin={setisAdmin} />} />

        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path='/resetpassword/:token' element={<ResetPassword />} />

        <Route path='/details/:id' element={<Details />} />
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    )
  }

  const routesEingeloggt = () => {
    return (
      <Routes>
        <Route path="/" element={isAdmin ? <AdminPage auth={auth} isAdmin={isAdmin} /> :
          <MovieList auth={auth} setAuth={setAuth} username={username} />} />

        <Route path='/details/:id' element={<Details auth={auth} setAuth={setAuth} username={username} />} />
        <Route path='/logout' element={<Logout setAuth={setAuth} setToken={setToken} setUsername={setUsername} />} />

        {/* <Route path="/adminpage" element={<AdminPage isAdmin={isAdmin} />} /> */}

        <Route path='/meinefilme' element={<MeineFilme auth={auth} setAuth={setAuth} username={username} />} />
        <Route path='/ausgeborgtefilme' element={<ReservierteFilme auth={auth} setAuth={setAuth} username={username} />} />
        <Route path='/favoriten' element={<Favoriten auth={auth} setAuth={setAuth} username={username} />} />
        {/* <Route path='/einstellungen' element={<Einstellungen />} /> */}

        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    )

  }

  return (


    <BrowserRouter>
      {auth ? routesEingeloggt() : routesNichtEingeloggt()}
    </BrowserRouter>
  );
}

export default App;
