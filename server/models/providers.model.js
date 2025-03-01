const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ProviderProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
        trim: true
    },
    email: {
        type: String,
        // required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    newPassword: {
        type: String
    },
    photo: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    age: {
        type: Number,
        min: 0
    },
    DOB: {
        type: Date
    },
    language: {
        type: [String],
        default: []
    },
    mobileNumber: {
        type: String,
        unique: true
    },
    adhaarCard: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    panCard: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    gstDetails: {
        type: String,
        default: null
    },
    coaNumber: {
        type: String
    },
    qualificationProof: {
        imageUrl: {
            type: String
        },
        public_id: String
    },
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio'
    },
    expertiseSpecialization: {
        type: [String],
        default: []
    },
    gallery: [
        {
            imageUrl: {
                type: String
            },
            public_id: String
        }
    ],
    location: {
        type: String
    },
    role: {
        type: String,
        default: 'provider'
    },
    type: {
        type: String,
        enum: ["Architect", "Interior", "Vastu"],
        required: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: {
        type: String,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    averageRating: {
        type: Number
    },
    pricePerMin: {
        type: Number,
        default: 0
    },
    roomId: {
        type: String
    },
    bio: {
        type: String
    },
    yearOfExperience: {
        type: Number
    },
    chatStatus: {
        type: Boolean,
        default: true
    },
    callStatus: {
        type: Boolean,
        default: false
    },
    meetStatus: {
        type: Boolean,
        default: false
    },
    walletAmount: {
        type: Number,
        default: 0
    },
    lastChatTransitionId: {
        type: String
    },
    chatTransition: [{
        startChatTime: { type: String },
        endingChatTime: { type: String },
        startingChatAmount: { type: Number },
        providerPricePerMin: { type: Number },
        chatTimingRemaining: { type: Number },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deductionAmount: { type: Number },
        Date: { type: Date, default: Date.now },
    },],
    bankDetail: {
        accountHolderName: {
            type: String,
        },
        bankName: {
            type: String,
        },
        accountNumber: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\d{9,18}$/.test(v); // Ensures the account number is numeric and 9–18 digits long
                },
                message: props => `${props.value} is not a valid account number!`,
            },
        },
        ifscCode: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v); // Standard IFSC code format
                },
                message: props => `${props.value} is not a valid IFSC code!`,
            },
        },
        branchName: {
            type: String,
        },
        panCardNumber: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(v); // Standard PAN card format
                },
                message: props => `${props.value} is not a valid PAN card number!`,
            },
        }
    },
    service: [
        {
            name: {
                type: String,
            },
            price: {
                type: Number,
            }
        }
    ],
    accountVerified: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Verified', 'Rejected']
    },
    verificationRejectReason: {
        type: String,
    },
    is_on_call: {
        type: Boolean,
        default: false
    },
    is_on_meet: {
        type: Boolean,
        default: false
    },
    is_on_chat: {
        type: Boolean,
        default: false
    },
    couponCode: {
        type: String
    },
    discount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobelUserRefDis",
    },
    referralIsActive: {
        type: Boolean,
        default: true
    },
    isMember: {
        type: Boolean,
        default: false
    },
    memberShip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MemberShip",
    },


    razorpayOrderId: {
        type: String
    },
    transactionId: {
        type: String
    },
    PaymentStatus: {
        type: String,
        default: 'pending'
    },
    paymentMethod: {
        type: String
    },
    updateOtp:{
        type: String
    },
    updateOtpExpiresAt: {
        type: Date
    }
});

// Password hashing
ProviderProfileSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to check password validity
ProviderProfileSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Provider', ProviderProfileSchema);
