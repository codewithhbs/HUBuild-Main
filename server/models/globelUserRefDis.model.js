const mongoose = require('mongoose')

const globelUserRefDisSchema = new mongoose.Schema({
    discountPercent: { type: Number, default: 10 }
}, { timestamps: true })

const GlobelUserRefDis = mongoose.model('GlobelUserRefDis', globelUserRefDisSchema)
module.exports = GlobelUserRefDis