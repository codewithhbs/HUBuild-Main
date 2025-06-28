const mongoose = require('mongoose')

const reviewModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5, 
    },
    review: {
        type: String,
        required: true,
        trim: true,
    },
    averageRating: {
        type: Number,
        default: 0,
    }
    
},{timestamps:true})

module.exports = mongoose.model('Review', reviewModel);