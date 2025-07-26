const mongoose = require('mongoose')

const ChatAndPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        // required: true
    },
    providerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
    room: { 
        type: String, 
        // required: true, 
        index: true 
    },
    amount: {
        type: Number
    },
    service: {
        type: String
    },
    time: {
        type: String
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
    newChat: {
        type: Boolean,
        default: true
    },
    isChatStarted: {
        type: Boolean,
        default: false
    },
   messages: [
      {
        sender: { type: String, required: true },
        text: { type: String },
        file: {
          name: { type: String },
          type: { type: String },
          content: { type: String },
        },
        // Enhanced sender information storage
        senderName: { type: String }, // Store sender's display name
        senderRole: { type: String }, // Store sender's role (user/provider)
        // Enhanced reply support with complete sender info
        replyTo: {
          messageId: { type: String }, // Reference to original message
          text: { type: String }, // Original message text
          senderName: { type: String }, // Original sender name
          senderRole: { type: String }, // Original sender role
          isFile: { type: Boolean, default: false }, // Whether original was a file
          timestamp: { type: Date }, // Original message timestamp
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    deleteByUser: {
        type: Boolean,
        default: false
    },
    deletedDateByUser: {
        type: Date
    },
    deleteByProvider: {
        type: Boolean,
        default: false
    },
    deletedDateByProvider: {
        type: Date
    },
    isManualChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String
    },
    isGroupChatEnded: {
        type: Boolean,
        default: false
    },
    userChatTempDeleted: {
        type: Boolean,
        default: false
    },
    providerChatTempDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

const ChatAndPayment = mongoose.model('ChatAndPayment', ChatAndPaymentSchema)
module.exports = ChatAndPayment