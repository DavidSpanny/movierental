import { Router } from "express";
import {register, login, checktoken, saveSelected, displayMovies, saveReservation, getMeineFilme,
    getReservierteFilme, addFavorite, deleteFavorite, checkIfFavorite, removeSelected, getMeineFavoriten,
    uploadAvatar, getAvatar, forgotPassword, resetPassword, resetPWForm
} from './controller.js';


const r = Router();

// Registrierung
r.post('/register', register);

// Login
r.post('/login', login);

// Überprüfe Korrektheit von Token
r.post('/checktoken', checktoken);

// Admin - speichere ausgewählte
r.post('/saveselected', saveSelected)

// Admin - lösche ausgewählte
r.post('/removeselected', removeSelected)

// füge bestellten Film zu User-Settings
r.post('/savereservation', saveReservation)

// zeige die bestellten Filme
r.post('/meinefilme', getMeineFilme)

// zeige die insgesamt bestellten Filme
r.post('/reserviertefilme', getReservierteFilme)

// zeige die als Favorit markierte
r.post('/meinefavoriten', getMeineFavoriten)

// füge Favorit hinzu
r.post('/favorite', addFavorite)

// lösche Favorit
r.delete('/favorite', deleteFavorite)

// zeige alle durch Admin gewählten Filme auf der Startseite
r.get('/', displayMovies)

// überprüfe ob es ein Favorit ist (dann ist der Button anders)
r.post('/checkiffavorite', checkIfFavorite)

// Upload eines User-Bilds
r.post('/uploadavatar', uploadAvatar)

// Überprüfe ob der User ein Bild hochgeladen hat und zeig es
r.post('/getavatar', getAvatar)

// Passwort vergessen-Form + Mail
r.post('/forgotpassword', forgotPassword)

// Passwort wiederherstellen, nachdem Klick auf Link
r.post('/resetpassword/:token', resetPassword)


r.get('/resetpassword/:token', resetPWForm)

export default r;