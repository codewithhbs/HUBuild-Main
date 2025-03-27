const mongoose = require('mongoose');

const expertiseSchema = new mongoose.Schema({
    expertise: {
        type: String,
        required: true
    }
})

const Expertise = mongoose.model('Expertise', expertiseSchema)
module.exports = Expertise