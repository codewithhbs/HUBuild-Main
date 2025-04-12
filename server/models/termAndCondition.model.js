const mongoose = require('mongoose')

const termAndConditionSchema = new mongoose.Schema({
    text: {
        type: String
    }
})

const TermAndCondition = mongoose.model('TermAndCondition', termAndConditionSchema)
module.exports = TermAndCondition