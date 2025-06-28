const mongoose = require('mongoose');
const ChatSchema = new mongoose.Schema({
    room: { type: String, required: true, index: true }, // Format: userId_astrologerId
    messages: [
        {
            senderId: { type: String, required: true },
            text: { type: String },
            file: {
                name: { type: String },
                type: { type: String },
                content: { type: String },
            },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});
module.exports = mongoose.model('Chat', ChatSchema);