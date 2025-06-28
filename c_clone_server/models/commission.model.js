const mongoose = require('mongoose')

const CommissionModel = new mongoose.Schema({
    commissionPercent: {
        type: String,
        required: true
    }
})

const Commission = mongoose.model('Commission',CommissionModel)
module.exports = Commission;