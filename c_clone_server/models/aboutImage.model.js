const mongoose = require('mongoose')

const AboutImageSchema = new mongoose.Schema({
    image: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    active: {
        type: Boolean,
        default: true
    }
})

const AboutImage = mongoose.model('AboutImage', AboutImageSchema)
module.exports = AboutImage;