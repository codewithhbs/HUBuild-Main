const mongoose = require('mongoose')

const TestimonialSchema = new mongoose.Schema({
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
    },
    name: {
        type: String,
    },
    destination: {
        type: String
    },
    testimonial: {
        type: String
    }
})

const Testimonial = mongoose.model('Testimonial', TestimonialSchema)
module.exports = Testimonial;