const mongoose = require('mongoose')

const BlogCommentShema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},{timestamps:true})

const BlogComment = mongoose.model('BlogComment', BlogCommentShema)
module.exports = BlogComment