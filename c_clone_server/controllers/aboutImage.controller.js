const AboutImage = require('../models/aboutImage.model')
const { uploadToCloudinary, deleteImageFromCloudinary } = require('../utils/Cloudnary')

exports.createAboutImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image',
            });
        }
        // console.log("file",req.file)
        const { imageUrl, public_id } = await uploadToCloudinary(req.file.buffer)
        const aboutImage = new AboutImage({
            image: {
                url: imageUrl,
                public_id: public_id
            }
        })
        await aboutImage.save()
        res.status(201).json({
            success: true,
            message: "About Image created successfully",
            data: aboutImage
        })
    } catch (error) {
        console.log("Internal server error in creating about image", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllAboutImage = async (req, res) => {
    try {
        const aboutimage = await AboutImage.find()
        if (!aboutimage) {
            return res.status(404).json({
                success: false,
                message: 'No describe work found',
            })
        }
        res.status(200).json({
            success: true,
            message: ' About Image retrieved successfully',
            data: aboutimage
        })
    } catch (error) {
        console.log("Internal server error in getting all About Image", error)
        res.status(500).json({
            success: false,
            message: "Internal server error in getting all About Image",
            error: error.message
        })
    }
}

exports.deleteAboutImage = async (req, res) => {
    try {
        const { id } = req.params;
        const aboutimage = await AboutImage.findByIdAndDelete(id)
        if (!aboutimage) {
            return res.status(404).json({
                success: false
            })
        }
        if(aboutimage?.image?.public_id){
            deleteImageFromCloudinary(aboutimage.image.public_id)
        }
        res.status(200).json({
            success: true,
            message: 'About Image deleted successfully',
        })

    } catch (error) {
        console.log("Internal server error in deleting About Image", error)
        res.status(500).json({
            success: false,
            message: ' Internal server error in deleting About Image',
            error: error.message
        })
    }
}

exports.updateAboutActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const updatedBanner = await AboutImage.findByIdAndUpdate(
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