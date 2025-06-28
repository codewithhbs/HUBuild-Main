const mongoose = require('mongoose')

const memberShipSchema = new mongoose.Schema({
    planPrice: {
        type: Number
    },
})

const MemberShip = mongoose.model('MemberShip', memberShipSchema)
module.exports = MemberShip