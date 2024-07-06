import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwort: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String
    },
    meineFilme: {
        type: [{
            id: Number,
            title: String,
            posterPath: String,
            rentedTo: String,
            rentedMS: Number
        }],
        default: []
    },
    reservierteFilme: {
        type: [{
            title: String,
            posterPath: String,
            rentedAt: String,
            rentedTo: String
        }],
        default: []
    },
    favoriten: {
        type: [{
            id: Number,
            posterPath: String
        }],
        default: []
    },
    admin: {
        type: Boolean,
        default: false
    }
})

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isNew) {
        user.passwort = await bcrypt.hash(user.passwort, 10);
    }
    next();
})


export default mongoose.model('User', UserSchema, 'users');