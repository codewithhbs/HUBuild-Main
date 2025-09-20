const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CallHistorySchema = new Schema({
    callerId: {
        type: String,
        required: true
    },
    from_number: {
        type: String,
    },
    to_number: {
        type: String,
    },
    status: {
        type: String
    },
    recording_url: {
        type: String,
    },

    start_time: {
        type: Number,
        default: 0
    },
    end_time: {
        type: Number,
        default: 0
    },
    TalkTime: {
        type: Number,
        default: 0
    },
    providerId: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    UserWallet: {
        type: Number,
        default: 0
    },
    max_duration_allowed: {
        type: Number,
    },
    cost_of_call: {
        type: Number,
        default: 0
    },
    cancel_reason: {
        type: String,
        default: null
    },
    money_deducetation_amount: {
        type: Number,
        default: 0
    },
    from_number_status: {
        type: String
    },
    to_number_status: {
        type: String
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('CallHistory', CallHistorySchema);