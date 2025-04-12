const Term = require("../models/termAndCondition.model");

exports.createTerm = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Text is required"
            })
        }
        const term = new Term({ text });
        await term.save();
        res.status(200).json({
            success: true,
            message: "Term created successfully",
            data: term
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

exports.getTerm = async (req, res) => {
    try {
        const term = await Term.find().sort({ createdAt: -1 });
        if (!term) {
            return res.status(404).json({
                success: false,
                message: "Term not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Term found successfully",
            data: term
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

exports.updateTerm = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Text is required"
            })
        }

        const term = await Term.findOneAndUpdate({ _id: req.params.id }, { text }, { new: true });
        if (!term) {
            return res.status(404).json({
                success: false,
                message: "Term not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Term updated successfully",
            data: term
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

exports.singleTerm = async (req, res) => {
    try {
        const term = await Term.findById(req.params.id);
        if (!term) {
            return res.status(404).json({
                success: false,
                message: "Term not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Term found successfully",
            data: term
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