const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    PhoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true,
    },
    cPassword: {
        type: String,
        // required: true,
    },
    newPassword: {
        type: String
    },
    ProfileImage: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    HowManyHit: {
        type: String,
    },
    otp: {
        type: String,
    },
    expiresAt: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "user",
        enum: ['user', 'admin']
    },
    resetPasswordOtp: {
        type: String,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    newPassword: {
        type: String
    },
    about: {
        type: String
    },
    roomId: {
        type: String
    },
    walletAmount: {
        type: Number,
        default: 0
    },
    rechargeHistory: [
        {
            baseAmount: { type: Number }, // actual paid
            bonusAmount: { type: Number }, // from coupon
            totalCredited: { type: Number }, // base + bonus
            time: { type: String }, // timestamp
            transactionId: { type: String },
            paymentStatus: { type: String, default: 'pending' },
            paymentMethod: { type: String },
            couponCode: { type: String, default: null },
            couponDiscount: { type: Number, default: 0 }, // percentage
        },
    ],
    razorpayOrderId: {
        type: String
    },
    chatTransition: [{
        startChatTime: { type: String },
        endingChatTime: { type: String },
        startingChatAmount: { type: Number },
        endingChatAmount: { type: Number },
        providerPricePerMin: { type: Number },
        chatTimingRemaining: { type: Number },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider'
        },
        deductionAmount: { type: Number },
        Date: { type: Date, default: Date.now },
    }],
    lastChatTransitionId: {
        type: String
    },
    loginStatus: {
        type: Boolean,
        default: true
    },
    rechargeCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RechargeCoupon'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    chatRoomIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatAndPayment' }]
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('Password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.Password = await bcrypt.hash(this.Password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.Password);
}

const User = mongoose.model('User', userSchema);
module.exports = User;
