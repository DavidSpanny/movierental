import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './mvc/index.js';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import path from 'path'

try {
    await mongoose.connect(`mongodb+srv://${process.env.MONGODBUSER}:${process.env.MONGODBPWD}@${process.env.MONGODBURL}/${process.env.MONGODB}?retryWrites=true&w=majority&appName=AtlasCluster`)
    console.log('MongoDB connected')
} catch (err) {
    console.log('MongoDB Error', err)
}

const app = express();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {console.log(`http://localhost:${PORT}`)});


app.use(cors());

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'http://image.tmdb.org', 'https://image.tmdb.org', 'http://localhost:8080/'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", 'https://api.themoviedb.org'],
            fontSrc: ["'self'", 'https:', 'http:', 'data:']
        }
    }
}));
const __dirname = path.resolve()

const wwwPath = path.join(__dirname, 'www')

app.use(express.static(wwwPath));

app.use(fileUpload())

app.use(express.static('mvc/uploads'))
app.use(express.json());

app.use('/user', userRoutes);


app.get('*', (req, res) => {
    res.sendFile('index.html', {root: wwwPath})
})

