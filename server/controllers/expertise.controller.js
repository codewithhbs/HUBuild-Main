const Expertise = require("../models/expertise.model");

exports.createExpertise = async (req, res) => {
    try {
        const { expertise } = req.body;
        if(!expertise) {
            return res.status(400).json({
                success: false,
                message: "Please provide expertise"
                });
        }
        const newExpertise = new Expertise({ expertise });
        await newExpertise.save();
        return res.status(200).json({
            success: true,
            message: 'Expertise created successfully.',
            data: newExpertise
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

exports.getAllExpertise = async (req, res) => {
    try {
        const expertise = await Expertise.find();
        return res.status(200).json({
            success: true,
            message: 'Expertise retrieved successfully.',
            data: expertise
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

exports.deleteExpertise = async (req, res) => {
    try {
        const { id } = req.params;
        const expertise = await Expertise.findByIdAndDelete(id);
        if (!expertise) {
            return res.status(404).json({ success: false, message: "Expertise not found" });
        }
        return res.status(200).json({ success: true, message: "Expertise deleted successfully" });
    } catch (error) {
        console.error("Error deleting expertise:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the expertise" });
    }
};

exports.getSingleExpertise = async (req, res) => {
    try {
        const { id } = req.params;
        const expertise = await Expertise.findById(id);
        if (!expertise) {
            return res.status(404).json({ success: false, message: "Expertise not found" });
        }
        return res.status(200).json({ success: true, data: expertise });
    } catch (error) {
        console.error("Error fetching expertise by ID:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving the expertise." });
    }
};

exports.updateExpertise = async (req, res) => {
    try {
        const { id } = req.params;
        const { expertise } = req.body;
        const updatedExpertise = await Expertise.findByIdAndUpdate(id, { expertise }, { new: true });
        if (!updatedExpertise) {
            return res.status(404).json({ success: false, message: "Expertise not found" });
        }
        return res.status(200).json({ success: true, message: "Expertise updated successfully", data: updatedExpertise });
    } catch (error) {
        console.error("Error updating expertise:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the expertise" });
    }
};