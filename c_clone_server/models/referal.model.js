const mongoose = require('mongoose')

const referalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referralCode: { type: String, unique: true, required: true },
    discountPercent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobelUserRefDis",
    },
}, { timestamps: true })

const Referal = mongoose.model('Referal', referalSchema)
module.exports = Referal