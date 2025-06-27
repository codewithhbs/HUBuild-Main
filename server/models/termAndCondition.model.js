const mongoose = require('mongoose')

const termAndConditionSchema = new mongoose.Schema({
    type: {
        type: String
    },
    text: {
        type: String
    }
})

const TermAndCondition = mongoose.model('TermAndCondition', termAndConditionSchema)
module.exports = TermAndCondition