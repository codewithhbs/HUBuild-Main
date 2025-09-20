const Cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');

Cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    cloud_name: process.env.CLOUD_NAME,
    folder: process.env.CLOUDINARY_FOLDER_NAME,
});

const uploadSingleImage = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = Cloudinary.uploader.upload_stream(
            { folder: process.env.CLOUDINARY_FOLDER_NAME },
            (error, result) => {
                if (result) {
                    resolve({ public_id: result.public_id, imageUrl: result.secure_url });
                } else {
                    reject(error || new Error("Failed to upload image"));
                }
            }
        );
        stream.end(fileBuffer);
    });
};

const uploadImage = async (filePath) => {
    try {
        console.log('Attempting to upload file at:', filePath);

        // Ensure file exists before upload
        if (await fs.access(filePath).then(() => true).catch(() => false)) {
            const result = await Cloudinary.uploader.upload(filePath, {
                folder: process.env.CLOUDINARY_FOLDER_NAME
            });
            console.log('Upload successful:', result.secure_url);
            return { image: result.secure_url, public_id: result.public_id };
        } else {
            console.error('File not found at:', filePath);
            throw new Error('File does not exist for upload');
        }
    } catch (error) {
        console.error('Error during image upload:', error);
        throw new Error('Failed to upload Image');
    }
};

const deleteImageFromCloudinary = async (public_id) => {
    try {
        await Cloudinary.uploader.destroy(public_id);
        console.log("Image Deleted");
    } catch (error) {
        console.error("Error deleting Image from Cloudinary", error);
        throw new Error('Failed to delete Image from Cloudinary');
    }
};

const UploadSingleImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const fileBuffer = req.file.buffer;
        const uploadResult = await uploadSingleImage(fileBuffer);

        res.status(200).json({
            success: true,
            data: uploadResult,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred while uploading the image",
        });
    }
};
const UploaViaFeildNameImages = async (req, res, next) => {
    try {
        // Check if files are uploaded
        if (!req.files || !req.files.DocumentOne || !req.files.DocumentTwo) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded for DocumentOne or DocumentTwo",
            });
        }

        // Destructure files from req.files
        const { DocumentTwo, DocumentOne } = req.files;

        // Process DocumentOne files (assuming it's an array)
        const documentOnePromises = DocumentOne.map(file => uploadSingleImage(file.buffer));
        const documentOneResults = await Promise.all(documentOnePromises);

        // Process DocumentTwo files (assuming it's an array)
        const documentTwoPromises = DocumentTwo.map(file => uploadSingleImage(file.buffer));
        const documentTwoResults = await Promise.all(documentTwoPromises);

        // Combine results for both documents
        const uploadResults = {
            DocumentOne: documentOneResults,
            DocumentTwo: documentTwoResults
        };

        // Respond with success and uploaded file data
        return { uploadResults: uploadResults }
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred while uploading images",
        });
    }
};



const UploadMultipleImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
        }

        const fileBuffers = req.files.map(file => file.buffer);
        const uploadPromises = fileBuffers.map(fileBuffer => uploadSingleImage(fileBuffer));
        const uploadResults = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            data: uploadResults,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred while uploading images",
        });
    }
};

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = Cloudinary.uploader.upload_stream(
            { folder: process.env.CLOUDINARY_FOLDER_NAME, resource_type: 'auto' },
            (error, result) => {
                if (result) {
                    resolve({ public_id: result.public_id, imageUrl: result.secure_url });
                } else {
                    console.error('Cloudinary upload error:', error);
                    reject(error || new Error("Failed to upload image"));
                }
            }
        );
        stream.end(fileBuffer);
    });
};

module.exports = {
    UploaViaFeildNameImages,
    UploadSingleImage,
    UploadMultipleImages,
    uploadImage,
    deleteImageFromCloudinary,
    uploadToCloudinary
};
