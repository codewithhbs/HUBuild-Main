const mongoose = require('mongoose')

const AdminCouponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true },
    discount: { type: Number, required: true, default:0 },
})

const AdminCoupon = mongoose.model('AdminCoupon',AdminCouponSchema)
module.exports = AdminCoupon;