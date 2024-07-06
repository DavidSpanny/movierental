# Movierental - Videoverleihapp


## Startseite
Die Startseite besteht aus einem Header mit Logo und Buttons

User angemeldet? Buttons Logout und Konto des Users (Kreis mit Buchstabe)
User NICHT angemeldet? Buttons Register und Login

Der Body besteht aus Kacheln mit den einzelnen Filmen.
Beim Klick auf die Kachel sind in den Details zu sehen: Backdrop, Titel Genre, Releasedate und Länge. Darunter
    die Summary und der Button 'ausborgen'
Ist der User nicht angemeldet, sind die Details LEER und User wird aufgefordert zum register/login

Wenn der User die Startseite besucht, hat er die Möglichkeit zum register oder login

### ausborgen
Unten erscheint ein Form mit Eingabe der Zahlungsoptionen (Kreditkarte oder Überweisung) (radio)
Dann weiter unten 2 Inputs Date von wann bis wann. Daneben wird in einem <> Element der Preis festgesetzt.
Standardpreis pro Film und Tag = 3€

Kreditkarte: Inputs erscheinen mit Name(2 Wörter mit SPACE getrennt), KartenNr (16 Zahlen) und CCV (3 Zahlen)
Überweisung: keine zusätzlichen Inputs
Nur wenn ein radio ausgewählt wurde kann abgeschickt werden

Danach: node-mailer (Feedback: erfolgeich ausgeborgt)
    inkl. Fake-Paypal


### register
Formular mit username (6 Zeichen), email (gültige Mail) und passwort (min 6 Zeichen auch Sonderzeichen).
    Validierung!!!

Senden einer Bestätigungsmail mit token (wie bei PW vergessen)

Speicherung in DB Coll 'users' insertOne und setzen von express-session


### login
Input username und pw. Mit findOne wird überprüft ob username existiert und mit passwort übereinstimmt.
Danach express-session

### Admin-Seite???
der admin (user.admin = true ? '' : '')
hat eine simple li-Liste mit Checkbox, Titel und Erscheinungsjahr. Er wählt Filme die er anbieten will und (sendet die Film.IDs dem MovieList.jsx??????????)

### passwort vergessen
Ein input Feld mit eingabe der email wird erscheinen. Und der User gibt ein. Mit npm modul CRYPTO wird ein
    token kreirt und mit Timestamp in der DB Coll 'users' im gleichen User-Dokument gespeichert(Gültigkeit 10min)
    der Token wird dem User als query param mitgegeben und eine email geschickt. Klickt der User auf den
    Link in der Mail wird der token aus dem querystring ausgelesen und überprüft ob er derselbe ist der
    in der Datenbank erzeugt wurde. Dann wird er zu einem passwort-wiederherstellen Formular geleitet
    wo man ein neues PW erzeugen kann. Mit updateOne wird das dann aktualiesiert.

### Merkliste
Jede Card hat bei den MovieDetails einen Stern/Herz/Symbol wo man sich den FIlm speichern/ablegen kann.
Neues DB-Array (favoriten) und im userIcon weiteres Feld (Favoriten) (wie meinefilme & ausgeborgte filme)

### nach klick auf den btn ausborgen:
Annahme: Zahloptionen wurden eingegeben und User hat die Best. mit email bekommen

In der DB gibt es zu jedem User (Dokument) 2 weitere Arrays (meinefilme und ausgeborgte filme)

Der ausgeborgte Film erscheint im DB-Array 'ausgeborgte Filme' und in User-Settings im Reiter
    ausgeborgte Filme als Liste mit Cover un Titel. Das dient als Historie über die bisher gesehenen Filme

Der ausgeborgte Film wird auch im anderen DB-Array 'meinefilme' gespeichert und in den User-Settings im Reiter
    meine Filme als Liste mit Cover, Titel und Endzeitraum. Das dient die Filme anzuzeigen, die gerade nutzbar sind

    Im user-DB-Array meinefilme wird zu jedem Film neben seiner id auch ein value Enddatum festgesetzt

    Existiert der Titel im Array meinefilme ist der Button ausborgen auf Moviedetails disabled und es steht unter dem ausborgen-Button bis wann der Film gültig ist

    Zum Überprüfen ob die Leihdauer abgelaufen ist, wird cronJob verwendet.
    Falls ja, wird der Film mit deleteOne() aus dem Array meinefilme entfernt und auch aus den User-Settings.

## User-Settings
Linke Seite (da wo register und login waren) ein Button Logout
    Ziel: session beenden

Rechte Seite des Headers ==>
Runder Kreis mit ??Anfangsbuchstaben des Usernames?? wie bei Google,...
Nur sichtbar wenn User eingeloggt

Platz für User-Foto (input type file)??
Welches "Format" soll der runde Button haben (jetzt ist er ein span)

Favoriten-Schaltfläche

MeineFilme Schaltfläche
AusgeborgteFIlme Schaltfläche

- optionen
Ändere ändere passwort, lösche Konto

Ändere PW: altes PW (korrekt?) neues PW + wiederholen (altes PW != neues PW)
    updateOne()

Lösche Konto: inklusive Rückfragen (sind sie sicher?)
    -> deleteOne(gesamtes DB-Dok mit user)