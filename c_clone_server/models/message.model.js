const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text: {
        type: String
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Message = mongoose.model('Message', messageSchema)