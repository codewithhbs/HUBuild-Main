const mongoose = require('mongoose')

const DescribeWorkSchema = new mongoose.Schema({
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    active: {
        type: Boolean,
        default: true
    }
})

const DescribeWork = mongoose.model('DescribeWork', DescribeWorkSchema)
module.exports = DescribeWork;