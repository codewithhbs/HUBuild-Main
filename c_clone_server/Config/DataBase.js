const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async (req, res) => {
    try {
        const MONOGO_LINK = process.env.MONGO_LINK;

        // Connect to MongoDB
        await mongoose.connect(MONOGO_LINK);
        console.log('MongoDB Connected...');
        console.log("MongoDB URI:", process.env.MONGO_LINK);
        // ✅ Log the database name you're connected to
        const dbName = mongoose.connection.name;
        console.log('Connected to database:', dbName);

    } catch (error) {
        console.log(error);
        if (res) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
}

module.exports = connectDB;
