const mongoose = require('mongoose');

//models
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneno: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    block: {
        
    }
})

const User = new mongoose.model("evuser",userSchema);
//routes

module.exports = User;