const PlanJourneyImage = require('../models/planJourneyImage.model');
const { uploadToCloudinary } = require('../utils/Cloudnary');

exports.createplanJourneyImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image',
            });
        }

        const uploadImage = await uploadToCloudinary(req.file.buffer)

        const planJourneyImage = new PlanJourneyImage({
            image: {
                url: uploadImage.imageUrl,
                public_id: uploadImage.public_id
            }
        })

        await planJourneyImage.save()

        res.status(200).json({
            success: true,
            message: 'Plan Journey Image created successfully',
            data: planJourneyImage
        })

    } catch (error) {
        console.log("Internal server error in creating plan journey image", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in creating plan journey image",
            error: error.message
        })
    }
}

exports.getAllJourneyImage = async (req, res) => {
    try {
        const planJourneyImages = await PlanJourneyImage.find();
        if (!planJourneyImages) {
            return res.status(404).json({
                success: false,
                message: 'No plan journey images found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Plan Journey Images retrieved successfully',
            data: planJourneyImages
        })
    } catch (error) {
        console.log("internal server error in getting all journey images", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in getting all journey images",
            error: error.message
        })
    }
}

exports.deleteJourneyImage = async (req, res) => {
    try {
        const { id } = req.params;
        const planJourneyImage = await PlanJourneyImage.findByIdAndDelete(id);
        if (!planJourneyImage) {
            return res.status(404).json({
                success: false,
                message: ' Plan Journey Image not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Plan Journey Image deleted successfully',
        })
    } catch (error) {
        console.log("Internal server error in deleting journey image", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in deleting journey image",
            error: error.message
        })
    }
}

exports.updatePlanActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const updatedBanner = await PlanJourneyImage.findByIdAndUpdate(
            id,
            { active },
            { new: true }
        );

        if(!updatedBanner){
            return res.status(404).json({
                success: false,
                message: 'Describe work not found',
                error: 'Describe work not found',
            })
        }

        res.status(200).json({
            success: true,
            data: updatedBanner,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update banner status' });
    }
}