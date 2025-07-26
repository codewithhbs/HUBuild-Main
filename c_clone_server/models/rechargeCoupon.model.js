const mongoose = require('mongoose')

const rechargeCouponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true },
    discount: { type: Number, required: true, default:0 },
})

const RechargeCoupon = mongoose.model('RechargeCoupon',rechargeCouponSchema)
module.exports = RechargeCoupon;