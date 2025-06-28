const mongoose = require('mongoose')

const planJourneyImageSchema = new mongoose.Schema({
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

const PlanJourneyImage = mongoose.model('PlanJourneyImage',planJourneyImageSchema)
module.exports = PlanJourneyImage;