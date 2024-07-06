import mongoose from "mongoose";

const Schema = mongoose.Schema;

const selectedMovies = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    poster_path: {
        type: String,
        required: true
    },
    backdrop_path: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
    },
    release_date: {
        type: String,
        required: true
    },
    runtime: {
        type: Number,
        required: true
    },
    summary: {
        type: String
    }
})


export default mongoose.model('Movies', selectedMovies, 'selectedMovies')