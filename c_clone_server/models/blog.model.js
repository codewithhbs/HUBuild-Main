const mongoose = require('mongoose')

const BlogSchema = new mongoose.Schema({
    image: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    largeImage: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    smallDesc: {
        type: String,
        required: true
    },
    writer: {
        type: String,
        default: "Admin"
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
}, { timestamps: true })

const Blog = mongoose.model('Blog', BlogSchema)
module.exports = Blog;