const GlobelUserRefDis = require("../models/globelUserRefDis.model");

exports.createGlobelUserRefDis = async (req, res) => {
    try {
        const { discountPercent } = req.body;
        if (!discountPercent) {
            return res.status(400).json({
                success: false,
                message: "Discount percent is required."
            });
        }
        const globelUserRefDis = new GlobelUserRefDis({
            discountPercent
        });
        await globelUserRefDis.save();
        return res.status(201).json({
            success: true,
            message: "Globel User Referral Discount created successfully.",
            data: globelUserRefDis
        });
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllGlobelUserRefDis = async (req, res) => {
    try {
        const allRefDis = await GlobelUserRefDis.find().sort({ createdAt: -1 });
        if (!allRefDis) {
            return res.status(404).json({
                success: false,
                message: "No Globel User Referral Discounts found."
            })
        }
        return res.status(200).json({
            success: true,
            message: "All Globel User Referral Discounts found.",
            data: allRefDis
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getSingleGlobelUserRef = async (req, res) => {
    try {
        const { id } = req.params;
        const singleRefDis = await GlobelUserRefDis.findById(id);
        if (!singleRefDis) {
            return res.status(400).json({
                success: false,
                message: "Globel User Referral Discount not found."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Globel User Referral Discount found.",
            data: singleRefDis
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.updateGlobelUserRef = async (req, res) => {
    try {
        const { id } = req.params;
        const { discountPercent } = req.body;

        const existingData = await GlobelUserRefDis.findById(id);
        if (!existingData) {
            return res.status(400).json({
                success: false,
                message: "Globel User Referral Discount not found."
            })
        }
        if (discountPercent) existingData.discountPercent = discountPercent;
        existingData.save();
        return res.status(200).json({
            success: true,
            message: "Globel User Referral Discount updated successfully.",
            data: existingData
        })

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.deleteGlobelUserRef = async (req, res) => {
    try {
        const { id } = req.params;
        const existingData = await GlobelUserRefDis.findByIdAndDelete(id);
        if (!existingData) {
            return res.status(400).json({
                success: false,
                message: "Globel User Referral Discount not found."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Globel User Referral Discount deleted successfully.",
            data: existingData
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}