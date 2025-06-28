const Testimonial = require('../models/testimonial.model');
const { uploadToCloudinary, deleteImageFromCloudinary } = require('../utils/Cloudnary');

exports.createTestimonial = async (req, res) => {
    try {
        const { name, destination, testimonial } = req.body;

        const emptyField = []
        if (!name) emptyField.push('Name')
        if (!destination) emptyField.push('Destination')
        if (!testimonial) emptyField.push('Testimonial')

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file"
            })
        }
        const { imageUrl, public_id } = await uploadToCloudinary(req.file.buffer)
        const testimonialData = new Testimonial({
            name,
            destination,
            testimonial,
            image: {
                url: imageUrl,
                public_id: public_id
            }
        })

        await testimonialData.save()
        res.status(201).json({
            success: true,
            message: "Testimonial created successfully",
            data: testimonialData
        })

    } catch (error) {
        console.log("Internal server error in creating testimonial", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getAllTestimonial = async (req, res) => {
    try {
        const allTestimonial = await Testimonial.find();
        if (!allTestimonial) {
            return res.status(400).json({
                success: false,
                message: "No testimonial found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Testimonials found successfully",
            data: allTestimonial
        })
    } catch (error) {
        console.log("Internal server error in getting all testimonial", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getsingleTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            return res.status(400).json({
                success: false,
                message: 'Testimonial not found'
            })
        }
        res.status(200).json({
            success: true,
            message: "Testimonial found successfully",
            data: testimonial
        })
    } catch (error) {
        console.log("Internal server error in getting testimonial", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByIdAndDelete(id);
        if (!testimonial) {
            return res.status(400).json({
                success: false,
                message: 'Testimonial not found'
            })
        }
        if (testimonial?.image?.url) {
            await deleteImageFromCloudinary(testimonial.image.url)
        }
        res.status(200).json({
            success: true,
            message: "Testimonial deleted successfully",
        })
    } catch (error) {
        console.log("Internal server error in deleting testimonial", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const existingTestimonial = await Testimonial.findById(id)
        if (!existingTestimonial) {
            return res.status(400).json({
                success: false,
                message: 'Testimonial not found'
            })
        }
        const { name, destination, testimonial } = req.body;
        if (req.file) {
            await deleteImageFromCloudinary(existingTestimonial?.image?.public_id)
            const { imageUrl, public_id } = await uploadToCloudinary(req.file.buffer)
            existingTestimonial.image = {
                url: imageUrl,
                public_id: public_id
            }
        }
        if (name) existingTestimonial.name = name
        if (destination) existingTestimonial.destination = destination
        if (testimonial) existingTestimonial.testimonial = testimonial

        await existingTestimonial.save()
        res.status(200).json({
            success: true,
            message: "Testimonial updated successfully",
            data: existingTestimonial
        })
    } catch (error) {
        console.log("Internal server error in updating testimonial", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.updateTestimonialActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const updatedBanner = await Testimonial.findByIdAndUpdate(
            id,
            { active },
            { new: true }
        );

        if(!updatedBanner){
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found',
                error: 'Testimonial not found',
            })
        }

        res.status(200).json({
            success: true,
            message: "Testimonial active status updated successfully",
            data: updatedBanner,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update Testimonial status' });
    }
}