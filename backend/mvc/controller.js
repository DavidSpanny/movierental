import User from "./schemas/User.js";
import Movies from "./schemas/Movies.js";
import { resolveMx} from 'dns/promises';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {jwtDecode} from 'jwt-decode'
import cron from 'node-cron'
import moment from 'moment'
import nodemailer from 'nodemailer'
import fs from 'fs'


let checkUsername = /^[a-zA-Z0-9_]{4,}$/;
let checkPasswort = /^(?=.*[A-Za-z])(?=.*[\d@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
let checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const checkEmailDNS = async (email) => {
    try {
        const domain = email.split('@')[1];
        await resolveMx(domain);
    } catch (err) {
        return {status: false, err: 'Diese Domain scheint nicht zu existieren'}
    }
}

// Funktion zum entschlüsseln des Client-Token
const decryptedUsertoken = (token) => {
    const decodedToken = jwtDecode(token)
    const username = decodedToken.username
    return username;
}




// Registrieren
export const register = async (req, res) => {

    let dns = await checkEmailDNS(req.body.email);


    if (req.body.username &&
        req.body.username.match(checkUsername) &&
        req.body.passwort &&
        req.body.passwort.match(checkPasswort) &&
        req.body.email &&
        req.body.email.match(checkEmail)) {

        User.create({
            username: req.body.username,
            passwort: req.body.passwort,
            email: req.body.email

        }).then(() => {
            res.status(200).send({status: true});

        }).catch((err) => {
            console.log('Fehler', err);
            res.status(200).send({status: false, err: 'User schon vorhanden'});
        });

    } else if (!checkUsername.test(req.body.username)) {
        // console.log('Username zu kurz');
        res.status(200).send({status: false, err: 'Der Username muss mindestens 4 Buchstaben oder Zahlen enthalten'})
    } 
    else if (!checkPasswort.test(req.body.passwort)) {
        // console.log('Passwort Buchstab Zahl, Sonderzei.');
        res.status(200).send({status: false, err: 'Passwort muss mindestens haben: 6 Zeichen und 1 Zahl'})
    } 
    else if (!checkEmail.test(req.body.email)) {
        console.log('Mail Regex NOK');
        res.status(200).send({status: false, err: 'Email ist nicht korrekt'})
    }
    else if (dns.status === false) {
        // console.log(dns.status)
    }

}


const JWT_SECRET = process.env.JWT_SECRET;

// Einloggen
export const login = async (req, res) => {
   let username = req.body.username;
   let passwort = req.body.passwort;


    User.findOne({
        username
    }).then(async (user) => {
        // console.log(user)
        if (user) {
            let passOK = await bcrypt.compare(passwort, user.passwort);
            if (passOK) {
                let isAdmin = user.admin || false;
                // console.log(user.admin)
                const token = jwt.sign(
                    {username: username, isAdmin: isAdmin},
                    JWT_SECRET,
                    {expiresIn: '1h'}
                )

                res.status(200).send({status: true, token: token, isAdmin: isAdmin})
                
            } else {
                res.status(200).send({status: false, err: 'Username oder Passwort falsch'})
            }
            
        } else {
            return res.status(200).send({status:false, err: 'Username oder Passwort falsch'})
        }
            
        }).catch((err) => {
            console.log(err);
            res.status(200).send({status: false, err: 'findOne Error'})
        })
    }

// Überprüfe ob ein Token vorhanden ist und gültig
export const checktoken = (req, res) => {
    if (req.headers['authorization']) {
        const token = req.headers['authorization'].replace('Bearer ', '')
        try {
            const payload = jwt.verify(token, JWT_SECRET)
            res.status(200).send({status: true})
        } catch (e) {
            res.status(200).send({status: false})
        }
    } else {
        res.status(200).send({status: false})
    }
}

// Admin-Funktion, speichert ausgewählte Filme
export const saveSelected = (req, res) => {

    const detailedMoviesData = req.body;

    // Durchlaufe jedes Objekt im Array und erstelle einen Eintrag in der Datenbank
    Promise.all(detailedMoviesData.map(movieData => {
        return Movies.updateMany({
            id: movieData.id},
            {$set: {
            poster_path: movieData.poster_path,
            backdrop_path: movieData.backdrop_path,
            title: movieData.title,
            genre: movieData.genre,
            release_date: movieData.release_date,
            runtime: movieData.runtime,
            summary: movieData.summary
        }}, {upsert: true});
    }))
    .then(() => {
        res.status(200).send({status: true})

    }).catch((err) => {
        console.log('Fehler bei speichern', err)
        res.status(200).send({status: false})
    })
}

// Admin-Funktion, löscht ausgewählte Filme wieder
export const removeSelected = (req, res) => {
    const movieIds = req.body.movieIds;

    Movies.deleteMany({
        id: {$in: movieIds}
    })
    .then(() => {
        res.status(200).send({status: true, msg: 'Erfolg beim Löschen'})
    })
    .catch((err) => {
        console.log('Fehler beim Löschen', err)
        res.status(200).send({status: false, msg: 'Fehler beim Löschen'})
    })
}


// Anzeigen aller Filme auf der Startseite
export const displayMovies = async (req, res) => {

    const movies = await Movies.find()
    // console.log('Function called')
    // console.log(movies)
    res.send(movies)
}










// Film reservieren/ausborgen
export const saveReservation = async (req, res) => {
    const id = req.body.id
    const title = req.body.title;
    const posterPath = req.body.posterPath;
    const rentedTo = req.body.rentedTo;
    const token = req.body.usertoken
    const username = decryptedUsertoken(token)

    const rentedToDate = new Date(rentedTo)
    const rentedToFormatiert = rentedToDate.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})
    
    const timestamp = new Date().toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})

    const rentedToMS = rentedToDate.getTime()
    
    try {
        const update = await User.findOneAndUpdate(
            {username: username},
            {$push: 
                {meineFilme: {id: id, title: title, posterPath: posterPath, rentedTo: rentedToFormatiert, rentedMS: rentedToMS},
                reservierteFilme: {id: id, title: title, posterPath: posterPath, rentedAt: timestamp, rentedTo: rentedToFormatiert}
                }
            },
            {new: true}
        )

        if (update) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {user: process.env.SENDER_EMAIL, pass: process.env.SENDER_MAIL_PWD}
            })

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: update.email,
                subject: 'Bestätigung der Reservierung',
                text: `Guten Tag ${username}, der Film ${title} wurde erfolgreich reserviert.\n\n
                    Die Reservierung geht bis ${rentedToFormatiert} \n\n
                    Vielen Dank! \n\n
                    Mit freundlichen Grüßen,\n
                    Das Movierental-Team.`
            }

        

            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    console.log('Fehler beim senden der mail', err)
                } else {
                    console.log('Mail versandt')
                }
            })
        }

        // console.log('Aktualisiert:', update)

        res.status(200).send({status: true, msg: 'Dein Film wurde erfolgreich reserviert!'})

    } catch (err) {
        console.log('Fehler update', err)
        res.status(200).send({status: false, msg: 'Fehler bei update'})
    }
}











// Anzeigen der reservierten Filme beim User
export const getMeineFilme = async (req, res) => {
    const token = req.body.usertoken

    let username;
    if (token) {
        username = decryptedUsertoken(token)
    }

    
    try {
        let userDok = await User.findOne({username})
        res.status(200).send({status: true, meineFilme: userDok.meineFilme})

    } catch (err) {
        // console.log('Fehler bei finden des array', err)
        res.status(200).send({status: false, msg: 'Fehler bei finden des arr', err})
    }
}

// Anzeigen der vom User gesetzten Favoriten
export const getMeineFavoriten = async (req, res) => {
    const token = req.body.usertoken

    let username;
    if (token) {
        username = decryptedUsertoken(token)
    }
    try {
        let userDok = await User.findOne({username})
        res.status(200).send({status: true, favoriten: userDok.favoriten})
    } catch (err) {
        res.status(200).send({status: false, msg: 'Fehler bei finden der Favoriten', err})
    }
}


// Anzeigen, der insgesamt bisher reservierten Filme beim User
export const getReservierteFilme = async (req, res) => {
    const token = req.body.usertoken
    const username = decryptedUsertoken(token)
    try {
        let userDok = await User.findOne({username})
        res.status(200).send({status: true, reservierteFilme: userDok.reservierteFilme})
    } catch (err) {
        res.status(200).send({status: false, msg: 'Fehler bei finden des arr', err})
    }
}

// Favoriten hinzufügen

export const addFavorite = async (req, res) => {
    const token = req.body.usertoken
    const username = decryptedUsertoken(token)
    const id = req.body.id
    const posterPath = req.body.posterPath
    try {
        let userDok = await User.findOneAndUpdate(
            {username: username},
            {$addToSet: 
                {favoriten: {id: id, posterPath: posterPath}}
            },
            {new: true}
        )
        res.status(200).send({status: true, msg: 'Favorit hinzugefügt'})
    } catch (err) {
        console.log('Fehler beim adden des Favorit')
        res.status(200).send({status: false, msg: 'Fehler beim Hinzufügen des Favoriten'})
    }
}




// Favorit löschen

export const deleteFavorite = async (req, res) => {
    const token = req.body.usertoken
    const username = decryptedUsertoken(token)
    const id = req.body.id
    try {
        let userDok = await User.findOneAndUpdate(
            {username: username},
            {$pull: {favoriten: {id}}},
            {new: true}
        )
        res.status(200).send({status: true, msg: 'Favorit entfernt'})
    } catch (err) {
        console.log('Fehler bei favorit löschen')
        res.status(200).send({status: false, msg: 'Fehler beim Löschen des Favoriten'})
    }

}

// überprüfe das array ob es true ist, dass der favorit dort ist,
// um entsprechend die Liste anzuzeigen
export const checkIfFavorite = async (req, res) => {
    const token = req.body.usertoken
    let username;
    if (token) {
       username = decryptedUsertoken(token) 
    }
    
    const id = req.body.id
    try {
        let user = await User.findOne({username})
        let isFavorit = user.favoriten.find(favorit => favorit.id == id)
        if (isFavorit) {
            res.status(200).send({status: true, isFavorit})
        // console.log('Favorit wurde im Array gefunden!', isFavorit, user.favoriten, id)
        } else {
            console.log('Favorit wurde im array nicht gefunden oder problem', err)
            res.status(200).send({status: false, msg: 'Favorit nicht gefunden'})
        }
        
    } catch (err) {
        console.log('Favorit wurde im array nicht gefunden oder problem', err)
        res.status(200).send({status: false, msg: 'Favorit nicht gefunden'})
    }

}


// Cron-Job

cron.schedule('0 0 * * *', async () => {
    // console.log('Cron Job')

    const heute = moment().startOf('day').toDate()

    try {

    
    let userDok = await User.find({'meineFilme.rentedMS': {$lte: Date.now()}})
    // console.log(`User: ${userDok}`)

    for (const user of userDok) {
        // let expired = user.meineFilme.filter(film => moment(film.rentedTo, 'DD.MM.YYYY').startOf('day').toDate() < heute)

        let notExpired = user.meineFilme.filter(film => film.rentedMS >= Date.now())

        // console.log('Not Expired:' + notExpired)

        user.meineFilme = notExpired
    
        await user.save()
        
    }

    // console.log(`Job done ${userDok.length}`)
    
    
    } catch (err) {
        console.log('Fehler bei löschen mit cron', err)
    }
})

// nachschauen ob der User einen Avatar hochgeladen hat in der DB

export const getAvatar = async (req, res) => {
    const token = req.body.usertoken;
    let username;
    if (token) {
       username = decryptedUsertoken(token) 
    }

    try {
       const user = await User.findOne({username: username})
        if (user && user.avatar) {


        // hol den Pfad des Bilds
        fs.readFile(`${user.avatar}`, (err, data) => {
            if (err) {
                console.log('Fehler beim holem von bild', err)
                res.status(200).send({status: false, msg: 'Fehler beim Holen des Bilds'})
            } else {

                res.status(200).send({status: true, msg: 'erfolgreich geholt', data: user.avatar.replace('./mvc/uploads', 'http://localhost:8080')})

            }
        })


        } else {
        res.status(200).send({status: false, msg: 'Kein Avatar vorhanden'})
        } 
    } catch (err) {
        console.log('Fehler bei finden von avatar', err)
    }
    
}


// lade das Bild hoch und speichere Pfad

export const uploadAvatar = async (req, res) => {
    const token = req.body.usertoken;
    let username;
    if (token) {
       username = decryptedUsertoken(token) 
    }

    // console.log(req.files)

    if (!req.files) {
        res.status(200).send({status: false, msg: 'Kein Avatar hochgeladen'})
        return
    }

    const avatar = req.files.avatar;
    // console.log('Diese Daten bekomme ich:' , req.files)
    const name = avatar.name
    // console.log('Das ist mein Name der Datei:', name)
    

    // Avatar im Ordner uploads speichern

    avatar.mv(`./mvc/uploads/${name}`, async (err) => {
        if (err) {
            console.log('Fehler bei Speichern in Ordner', err)
            res.status(200).send({status: false, msg:'Fehler bei Speichern in Ordner'})
        }

        try {
            let userDok = await User.findOneAndUpdate(
                {username: username},
                {$set: 
                    {avatar: `./mvc/uploads/${name}`}
                },
                {new: true}
            )

        if (!userDok) {
            res.status(200).send({status: false, msg: 'Benutzer nicht gefunden'})
        } else {
            res.status(200).send({status: true, avatar: `./mvc/uploads/${avatar.name}`})
        }

        

        } catch (err) {
            console.log('Fehler bei Speichern in die DB', err)
            res.status(200).send({status: false, msg: 'Fehler bei speichern in die DB'})
        }

    })
}

// sende dem User eine Mail mit dem Bestätigungslink + Token

export const forgotPassword = async (req, res) => {
    const email = req.body.email;

    try {
        let userDok = await User.findOne({email});
        if (!userDok) {
            res.status(200).send({status: false, msg: 'Benutzer wurde nicht gefunden'})
        } else {
            const token = jwt.sign({id: userDok._id}, 'secret', {expiresIn: '30min'})
        const linkURL = `http://localhost:8080/resetpassword/${token}`

        const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {user: process.env.SENDER_EMAIL, pass: process.env.SENDER_MAIL_PWD}
            })

            
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: 'Passwort zurücksetzen',
                text: `Bitte klicken Sie auf diesen Link, um Ihr Passwort zurückzusetzen.
                        Diese Mail ist nur eine Halbe Stunde lang gültig!:
                        ${linkURL}`
            }

            await transporter.sendMail(mailOptions);

            res.status(200).send({status: true, msg: 'Link gesendet'})
            console.log(mailOptions)
        }

        
        
    } catch (err) {
        res.status(200).send({status: false, msg: 'Fehler bei Linkzustellung'})
    }
}


// überprüfe den Token und ändere das PW

export const resetPassword = async (req, res) => {
    const token = req.params.token;
    const password = req.body.password

    try {
        let decodedToken = jwt.verify(token, 'secret')
        let userDok = await User.findById(decodedToken.id)

        if (!userDok) {
            console.log('Benutzer anhand der Id nicht gefunden')
            res.status(200).send({status: false, msg: 'Benutzer nicht gefunden'})
        }

        let hashedPW = await bcrypt.hash(password, 10)
        userDok.passwort = hashedPW
        await userDok.save()

        res.status(200).send({status: true, msg: 'Passwort zurückgesetzt'})
    } catch (err) {
        console.log('Fehler bei Zurücksetzen', err)
        res.status(200).send({status: false, msg: 'Fehler bei Zurücksetzen'})
    }
}

export const resetPWForm = (req, res) => {
    console.log('Ready')
    res.send({status: true, msg:'ok'})
}