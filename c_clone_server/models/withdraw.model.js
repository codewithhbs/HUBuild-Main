const mongoose = require('mongoose')

const WithdrawSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status:{
        type:String,
        default: 'Pending',
        enum: ['Pending','Approved','Rejected'],
        required: true
    },
    commission: {
        type:String,
        required:true
    },
    finalAmount: {
        type: Number,
        required:true
    },
    providerWalletAmount :{
        type: Number,
        required:true
    },
    commissionPercent: {
        type: Number,
        required: true
    }
})

const Withdraw = mongoose.model('Withdraw', WithdrawSchema)
module.exports = Withdraw;