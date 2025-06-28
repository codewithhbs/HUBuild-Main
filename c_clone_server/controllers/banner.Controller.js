const Banner = require('../models/banner.model');
const { uploadToCloudinary, deleteImageFromCloudinary } = require('../utils/Cloudnary');

exports.createBanner = async (req, res) => {
    try {
        const { view } = req.body;
        if (!view) {
            return res.status(400).json({ message: "Please provide a view." });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image',
            });
        }

        const uploadedImage = await uploadToCloudinary(req.file.buffer);

        const newBanner = new Banner({
            bannerImage: {
                url: uploadedImage.imageUrl,
                public_id: uploadedImage.public_id,
            },
            view: view
        });

        const savedBanner = await newBanner.save();

        return res.status(201).json({
            success: true,
            message: 'Promotional banner created successfully',
            data: savedBanner,
        });
    } catch (error) {
        console.error('Internal server error in creating banner:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.getAllBanner = async (req, res) => {
    try {
        const banners = await Banner.find()
        if (!banners) {
            return res.status(400).json({
                success: false,
                message: 'No banners found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'All banners retrieved successfully',
            data: banners
        })
    } catch (error) {
        console.log("Internal server error in getting all banners", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(400).json({
                success: false,
                message: 'Banner not found',
            })
        }
        if (banner.bannerImage.public_id) {
            deleteImageFromCloudinary(banner.bannerImage.public_id)
        }
        await Banner.findByIdAndDelete(id)
        return res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
        })

    } catch (error) {
        console.log("Internal server error in deleting banner image", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.updateBannerActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { active },
            { new: true }
        );

        if (!updatedBanner){
            return res.status(400).json({
                success: false,
                message: 'Banner not found',
                error: 'Banner not found',
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