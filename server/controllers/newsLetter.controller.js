const NewsLetter = require("../models/newsLetter.model");
const sendEmail = require("../utils/SendEmail");

exports.createNewsLetter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }
        const newsLetter = new NewsLetter({
            email: email
        })
        await newsLetter.save();
        res.status(200).json({
            success: true,
            message: "NewsLetter created successfully",
            data: newsLetter
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllNewsLetter = async (req, res) => {
    try {
        const newsLetter = await NewsLetter.find();
        if (!newsLetter) {
            return res.status(400).json({
                success: false,
                message: "No newsLetter found"
            })
        }
        res.status(200).json({
            success: true,
            message: "NewsLetter found successfully",
            data: newsLetter
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getSingleNewsLetter = async (req, res) => {
    try {
        const { id } = req.params;
        const newsLetter = await NewsLetter.findById(id);
        if (!newsLetter) {
            return res.status(400).json({
                success: false,
                message: "No newsLetter found"
            })
        }
        res.status(200).json({
            success: true,
            message: "NewsLetter found successfully",
            data: newsLetter
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.deleteNewsLetter = async (req, res) => {
    try {
        const { id } = req.params;
        const newsLetter = await NewsLetter.findByIdAndDelete(id);
        if (!newsLetter) {
            return res.status(400).json({
                success: false,
                message: "No newsLetter found"
            })
        }
        res.status(200).json({
            success: true,
            message: "NewsLetter deleted successfully",
            data: newsLetter
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.sendNewsLetterMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const allEmail = await NewsLetter.find();
        for (let i = 0; i < allEmail.length; i++) {
            const email = allEmail[i].email;
            console.log(email);
            // Send welcome email
            const emailOptions = {
                email: email,
                subject: "Newsletter",
                message: message,
            }
            await sendEmail(emailOptions);
        }
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}