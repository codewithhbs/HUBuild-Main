const PortfolioModel = require("../models/Portfolio.model");
const providersModel = require("../models/providers.model");
const { deleteImageFromCloudinary } = require("../utils/Cloudnary");
const sendToken = require("../utils/SendToken");
const SendWhatsapp = require("../utils/SendWhatsapp");
const GlobelUserRefDis = require("../models/globelUserRefDis.model");
const generateOtp = require("../utils/GenreateOtp");
const ChatAndPayment = require("../models/chatAndPayment.Model");
const Cloudinary = require('cloudinary').v2;
require('dotenv').config();

Cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    cloud_name: process.env.CLOUD_NAME,
});

const generateReferralCode = (providerId) => {
    return `REF${providerId.toString().slice(-5)}${Math.floor(1000 + Math.random() * 9000)}`;
};

exports.CreateProvider = async (req, res) => {
    try {
        console.log("req.body", req.body);
        const { type, name, email, password, DOB, age, language, mobileNumber, gstDetails, coaNumber, expertiseSpecialization, location, termAndCondition, nda } = req.body;
        
        // Debug: Log the exact values
        console.log("termAndCondition value:", termAndCondition, "type:", typeof termAndCondition);
        console.log("nda value:", nda, "type:", typeof nda);
        
        const existingMobile = await providersModel.findOne({ mobileNumber });
        const existingEmail = await providersModel.findOne({ email });
        
        // Fixed validation for boolean fields
        if (nda !== true) {
            return res.status(400).json({
                success: false,
                message: "NDA acceptance is required"
            });
        }
        
        if (termAndCondition !== true) {
            return res.status(400).json({
                success: false,
                message: "Terms and conditions acceptance is required"
            });
        }

        if (existingEmail) {
            if (existingEmail.PaymentStatus === 'pending') {
                return res.status(400).json({
                    success: true,
                    message: "Email already exists, but payment is pending",
                    data: existingEmail?._id
                })
            }
            return res.status(403).json({
                message: 'Email is already exists with another account'
            })
        }
        
        if (existingMobile) {
            if (existingMobile.PaymentStatus === 'pending') {
                return res.status(400).json({
                    success: true,
                    message: "Mobile Number already exists, but payment is pending",
                    data: existingMobile?._id
                })
            }
            return res.status(403).json({
                success: false,
                message: 'Mobile Number already exists with another account'
            })
        }

        // Create the provider object - be explicit about boolean values
        const providerData = {
            DOB,
            type,
            name,
            email,
            password: password,
            age,
            mobileNumber,
            gstDetails,
            coaNumber,
            location: {
                state: location?.state,
                city: location?.city,
                formatted_address: location?.formatted_address,
                pincode: location?.pincode
            },
            termAndCondition: Boolean(termAndCondition), // Ensure it's a boolean
            nda: Boolean(nda), // Ensure it's a boolean
        };

        // Debug: Log the data being saved
        console.log("Provider data before save:", JSON.stringify(providerData, null, 2));

        const newProvider = new providersModel(providerData);

        const couponDiscount = await GlobelUserRefDis.find();
        if (!couponDiscount || couponDiscount.length === 0) {
            newProvider.discount = 10;
        } else {
            const firstDis = couponDiscount[0];
            newProvider.discount = firstDis._id;
        }
        
        newProvider.couponCode = generateReferralCode(newProvider._id);

        // Debug: Log the final object before save
        console.log("Final provider object before save:", JSON.stringify(newProvider.toObject(), null, 2));

        // Save the provider
        await newProvider.save();

        // Debug: Log the saved object
        console.log("Saved provider:", JSON.stringify(newProvider.toObject(), null, 2));

        const providerNumber = newProvider.mobileNumber;
        const message = `Hello,  
        Welcome to HelpUBuild! 🎉 We're excited to have you on board.`;
        await SendWhatsapp(providerNumber, message);
        
        // Send token for authentication
        sendToken(newProvider, res, 201, "Account Created successfully");

    } catch (error) {
        console.error("Error creating provider:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the provider. Please try again later.",
            error: error.message
        });
    }
};

exports.GetMyProfile = async (req, res) => {
    try {
        console.log(req.user)
        const userId = req.user.id._id;
        console.log(req.user.id)
        if (!userId) {
            return res.status(401).json({ message: 'Please login To Access Your Dashboard ' });
        }
        const provider = await providersModel.findById(userId)
            .populate('portfolio')
            .populate('chatTransition.user');

        // console.log(provider)
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        return res.status(200).json({
            message: 'Profile fetched successfully',
            provider: provider
        });
    } catch (error) {
        console.error(error);
        // Handle any errors that occur
        return res.status(500).json({
            message: 'Something went wrong while fetching the profile',
            error: error.message || 'Internal server error'
        });
    }
};

exports.addPortfolio = async (req, res) => {
    try {
        const ProviderId = req.user.id._id
        const { TextWhichYouShow, type } = req.query;



        // Check if the provider exists
        const checkProviderId = await providersModel.findById(ProviderId);
        if (!checkProviderId) {
            return res.status(404).json({
                success: false,
                message: "Provider not found. Please check the ID and try again."
            });
        }

        let PortfolioLink = {};
        let GalleryImages = [];
        let isGalleryUploaded = false;


        let existingPortfolio = await PortfolioModel.findOne({ ProviderId });


        if (type === 'Portfolio') {
            if (req.files && req.files.PortfolioLink) {
                const fileBuffer = req.files.PortfolioLink[0].buffer;


                const uploadResult = await uploadToCloudinary(fileBuffer);
                PortfolioLink = {
                    url: uploadResult.imageUrl,
                    cloudinary_id: uploadResult.public_id
                };

                if (existingPortfolio) {

                    existingPortfolio.PortfolioLink = PortfolioLink;
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded for PortfolioLink."
                });
            }
        }
        else if (type === 'Gallery') {
            if (req.files && req.files.GalleryImages) {
                for (let i = 0; i < req.files.GalleryImages.length; i++) {
                    const fileBuffer = req.files.GalleryImages[i].buffer;


                    const uploadResult = await uploadToCloudinary(fileBuffer);
                    GalleryImages.push({
                        url: uploadResult.imageUrl,
                        cloudinary_id: uploadResult.public_id
                    });
                }

                if (GalleryImages.length > 0) {
                    isGalleryUploaded = true;
                }

                if (existingPortfolio) {
                    // Update the existing portfolio if it exists
                    existingPortfolio.GalleryImages = GalleryImages;
                    existingPortfolio.isGalleryUploaded = isGalleryUploaded;
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No files uploaded for GalleryImages."
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid type provided. Must be 'Portfolio' or 'Gallery'."
            });
        }

        // If no existing portfolio, create a new one
        if (!existingPortfolio) {
            existingPortfolio = new PortfolioModel({
                TextWhichYouShow,
                PortfolioLink,
                GalleryImages,
                isGalleryUploaded,
                ProviderId
            });
        }

        // Save the portfolio (either new or updated)
        await existingPortfolio.save();

        // Associate the portfolio with the provider
        checkProviderId.portfolio = existingPortfolio._id;
        await checkProviderId.save();

        // Send a success response
        return res.status(201).json({
            success: true,
            message: "Portfolio updated successfully",
            data: existingPortfolio
        });

    } catch (error) {
        console.error("Error adding portfolio:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while adding or updating the portfolio."
        });
    }
};

exports.getAllProvider = async (req, res) => {
    try {
        const providers = await providersModel.find().populate('providerService').populate('portfolio').exec();
        if (!providers) {
            return res.status(404).json({
                success: false,
                message: "No providers found."
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Provider founded successfully',
            data: providers
        });
    } catch (error) {
        console.log("Internal server error in getAllProvider");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.getSingleProvider = async (req, res) => {
    try {
        const providerId = req.params._id;
        const provider = await providersModel
            .findById(providerId)
            .populate('portfolio')
            .populate({
                path: 'chatTransition',
                populate: {
                    path: 'user', // Field inside chatTransition to populate
                    model: 'User', // Replace with your user model name if different
                },
            })
            .exec();
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found."
            });
        }
        res.status(200).json({
            success: true,
            message: 'Provider founded successfully',
            data: provider
        })
    } catch (error) {
        console.log("Internal server error in getting provider", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error in getting provider',
            error: error.message
        })
    }
}

exports.updateProvider = async (req, res) => {
    // console.log("i am hit")
    try {
        const providerId = req.params._id;
        const {
            name,
            email,
            DOB,
            language,
            mobileNumber,
            coaNumber,
            location,
            pricePerMin,
            bio,
            expertiseSpecialization,
            yearOfExperience,
            service
        } = req.body;

        const provider = await providersModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found."
            });
        }

        // Update only provided fields
        if (name) provider.name = name;
        if (email) provider.email = email;
        if (DOB) provider.DOB = DOB;
        if (language) provider.language =
            typeof language === 'string'
                ? language.split(', ')
                : language;
        if (mobileNumber) provider.mobileNumber = mobileNumber;
        if (coaNumber) provider.coaNumber = coaNumber;
        if (location) {
            provider.location = {
                ...provider.location,
                ...(location.state && { state: location.state }),
                ...(location.city && { city: location.city }),
                ...(location.pincode && { pincode: location.pincode }),
                ...(location.formatted_address && { formatted_address: location.formatted_address })
            };
        }

        if (pricePerMin) provider.pricePerMin = pricePerMin;
        if (bio) provider.bio = bio;
        if (expertiseSpecialization) {
            provider.expertiseSpecialization =
                typeof expertiseSpecialization === 'string'
                    ? expertiseSpecialization.split(', ')
                    : expertiseSpecialization;
        }

        // Update services if provided
        if (service && Array.isArray(service)) {
            provider.service = service; // Replace the existing services with the new ones
        }

        // Calculate age if DOB is updated
        if (DOB) {
            const birthDate = new Date(DOB);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            provider.age = age;
        }
        if (yearOfExperience) provider.yearOfExperience = yearOfExperience

        await provider.save();

        res.status(200).json({
            success: true,
            message: "Provider updated successfully.",
            provider
        });
    } catch (error) {
        console.log("Internal server error in update provider", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error in update provider',
            error: error.message
        });
    }
};

exports.updateDocuments = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const existingData = await providersModel.findById(providerId)
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
                error: "Provider not found"
            });
        }
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.',
                error: 'No file uploaded.'
            })
        }
        if (req.files) {
            const { adhaarCard, panCard, qualificationProof, photo } = req.files;
            if (adhaarCard) {
                if (existingData?.adhaarCard?.public_id) {
                    await deleteImageFromCloudinary(existingData.adhaarCard.public_id)
                }
                const adhaarCardUrl = await uploadToCloudinary(adhaarCard[0].buffer);
                const { imageUrl, public_id } = adhaarCardUrl
                existingData.adhaarCard = { public_id, imageUrl: imageUrl }
            }

            if (panCard) {
                if (existingData?.panCard?.public_id) {
                    await deleteImageFromCloudinary(existingData.panCard.public_id)
                }
                const panCardUrl = await uploadToCloudinary(panCard[0].buffer);
                const { imageUrl, public_id } = panCardUrl
                existingData.panCard = { public_id, imageUrl: imageUrl }
            }

            if (qualificationProof) {
                if (existingData?.qualificationProof?.public_id) {
                    await deleteImageFromCloudinary(existingData.qualificationProof.public_id)
                }
                const qualificationProofUrl = await uploadToCloudinary(qualificationProof[0].buffer);
                const { imageUrl, public_id } = qualificationProofUrl
                existingData.qualificationProof = { public_id, imageUrl: imageUrl }
            }

            if (photo) {
                if (existingData?.photo?.public_id) {
                    await deleteImageFromCloudinary(existingData.photo.public_id)
                }
                const photoUrl = await uploadToCloudinary(photo[0].buffer);
                const { imageUrl, public_id } = photoUrl
                existingData.photo = { public_id, imageUrl: imageUrl }
            }
        }
        await existingData.save();
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: existingData
        })
    } catch (error) {
        console.log("Internal server error in updating documents", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error in updating documents',
            error: error.message
        });
    }
}

exports.updateProfileImage = async (req, res) => {
    try {
        const { id } = req.params;
        const existingData = await providersModel.findById(id);
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
                error: "Provider not found"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.',
                error: 'No file uploaded.'
            })
        }
        if (req.file) {
            // const { photo } = req.file;
            if (existingData?.photo?.public_id) {
                await deleteImageFromCloudinary(existingData.photo.public_id)
            }
            const imgUrl = await uploadToCloudinary(req.file.buffer);
            const { imageUrl, public_id } = imgUrl
            existingData.photo = { public_id, imageUrl: imageUrl }
            await existingData.save();
            return res.status(200).json({
                success: true,
                message: 'Profile image updated successfully.',
                data: existingData
            })
        }
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { password, newPassword } = req.body;
        // const excitedData = await providerId.({ providerId });
        const existingData = await providersModel.findById(providerId);
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found'
            });
        }
        const isMatch = await existingData.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please Enter Correct Password." });
        }
        existingData.password = newPassword;
        await existingData.save();
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully.',
            data: existingData
        })

    } catch (error) {
        console.log("Internal server error in updating password", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error in updating password',
            error: error.message
        })
    }
}

exports.updateAvailable = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { chatStatus, callStatus, meetStatus } = req.body;

        // console.log("body", req.body);

        const existingData = await providersModel.findById(providerId);
        if (!existingData) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            });
        }

        // Update statuses only if they are explicitly defined in the request body
        if (typeof chatStatus !== 'undefined') existingData.chatStatus = chatStatus;
        if (typeof callStatus !== 'undefined') existingData.callStatus = callStatus;
        if (typeof meetStatus !== 'undefined') existingData.meetStatus = meetStatus;

        await existingData.save();

        return res.status(200).json({
            success: true,
            message: 'Provider status updated successfully.',
            data: existingData,
        });
    } catch (error) {
        console.log('Internal server error in updating', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.updateBankDetail = async (req, res) => {
    try {
        const { providerId } = req.params;
        const {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
            panCardNumber
        } = req.body;

        // Validate input
        if (!accountHolderName || !bankName || !accountNumber || !ifscCode || !branchName || !panCardNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Find the provider
        const provider = await providersModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }

        // Check if bank details already exist
        if (provider.bankDetail && Object.keys(provider.bankDetail).length > 0) {
            // Update only the provided fields
            provider.bankDetail.accountHolderName = accountHolderName;
            provider.bankDetail.bankName = bankName;
            provider.bankDetail.accountNumber = accountNumber;
            provider.bankDetail.ifscCode = ifscCode;
            provider.bankDetail.branchName = branchName;
            provider.bankDetail.panCardNumber = panCardNumber;
        } else {
            // Create new bank details
            provider.bankDetail = {
                accountHolderName,
                bankName,
                accountNumber,
                ifscCode,
                branchName,
                panCardNumber,
            };
        }

        // Save the updated provider
        await provider.save();

        res.status(200).json({
            success: true,
            message: 'Bank details updated successfully',
            bankDetail: provider.bankDetail,
        });
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.updateIsBanned = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const isBanned = req.body.isBanned;
        const provider = await providersModel.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            });
        }
        provider.isBanned = isBanned;
        await provider.save();
        res.status(200).json({
            success: true,
            message: 'Provider banned status updated successfully',
            isBanned: provider.isBanned,
        });

    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}

exports.deleteprovider = async (req, res) => {
    // console.log("i am hit")
    try {
        const { id } = req.params;
        const findProvider = await providersModel.findByIdAndDelete(id)
        if (!findProvider) {
            return res.status(500).json({
                success: false,
                message: "Provider not founded",
                error: "Provider not founded"
            })
        }

        const providerChat = await ChatAndPayment.deleteMany({ providerId: id });
        res.status(200).json({
            success: true,
            message: "Provider deleted successfully",
        })
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}

exports.accountVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationRejectReason, accountVerified } = req.body;

        if (!accountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account verified not found",
                error: "Account verified not found"
            })
        }

        const findProvider = await providersModel.findById(id);
        if (!findProvider) {
            return res.status(500).json({
                success: false,
                message: "Provider not founded",
                error: "Provider not founded"
            })
        }

        if (accountVerified === 'Rejected') {
            findProvider.accountVerified = accountVerified;
            findProvider.verificationRejectReason = verificationRejectReason;

            const providerNumber = findProvider?.mobileNumber;
            SendWhatsapp(providerNumber, verificationRejectReason)

            await findProvider.save();
            return res.status(200).json({
                success: true,
                message: "Account rejected successfully",
            })
        }

        findProvider.accountVerified = accountVerified;
        findProvider.verificationRejectReason = '';
        findProvider.isProfileComplete = true;
        const message = `Your account has been verified successfully.`;
        const providerNumber = findProvider?.mobileNumber;
        SendWhatsapp(providerNumber, message)
        await findProvider.save();
        return res.status(200).json({
            success: true,
            message: "Account verified successfully",
        })
    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}

const uploadToCloudinary = (fileBuffer) => {
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

exports.getProviderStatus = async (req, res) => {
    try {
        const { provider_id } = req.params;

        // Validate provider ID
        if (!provider_id) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required.',
            });
        }

        // Fetch provider from database
        const provider = await providersModel.findById(provider_id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found.',
            });
        }

        // Check provider status
        if (provider.is_on_chat) {
            return res.status(403).json({
                success: false,
                message: 'Consultant is currently on chat.',
            });
        }

        if (provider.is_on_call) {
            return res.status(403).json({
                success: false,
                message: 'Consultant is currently on a call.',
            });
        }

        // If provider is available
        return res.status(200).json({
            success: true,
            message: 'Consultant is available.',
        });

    } catch (error) {
        console.error('Error fetching provider status:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching provider status.',
            error: error.message,
        });
    }
};

exports.sendOtpForUpdateDetail = async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const findProvider = await providersModel.findOne({ mobileNumber: mobileNumber });
        if (!findProvider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found.',
            })
        }
        const { otp, expiresAt } = generateOtp(6, 120000)
        findProvider.updateOtp = otp;
        findProvider.updateOtpExpiresAt = expiresAt;
        await findProvider.save();
        const message = `Your otp for update detail is ${otp}.`
        const sendOtp = await SendWhatsapp(mobileNumber, message);
        return res.status(200).json({
            success: true,
            message: "Otp send successfully",
        })
    } catch (error) {
        console.log("Internal server errror", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.verifyOtpForUpdateDetail = async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        const findProvider = await providersModel.findOne({ mobileNumber: mobileNumber });
        if (!findProvider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found.',
            })
        }
        if (findProvider.updateOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid otp.',
            })
        }
        if (Date.now() > findProvider.updateOtpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Otp expired.',
            })
        }
        findProvider.updateOtp = null;
        findProvider.updateOtpExpiresAt = null;
        await findProvider.save();
        return res.status(200).json({
            success: true,
            message: "Otp verified successfully",
        })
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.changeProviderNumber = async (req, res) => {
    try {
        const { id } = req.params;
        const { newMobileNumber } = req.body;
        if (!newMobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required.',
            })
        }
        const findProvider = await providersModel.findById(id);
        if (!findProvider) {
            return res.status(404).json({
                success: false,
                message: 'Consultant not found.',
            })
        }

        const checkNumber = await providersModel.findOne({ mobileNumber: newMobileNumber });
        if (checkNumber) {
            if (checkNumber._id == id) {
                return res.status(400).json({
                    success: false,
                    message: 'Mobile number already registered.',
                })
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Mobile number already registered in another Consultant Profile.',
                })
            }
        }

        const { otp, expiresAt } = generateOtp(6, 120000)
        findProvider.changeNumberOtp = otp;
        findProvider.changeNumberOtpExpiresAt = expiresAt;
        await findProvider.save();
        const number = findProvider.mobileNumber;
        // console.log("number",number)
        const message = `Your otp for update Number is ${otp}.`
        await SendWhatsapp(number, message);
        return res.status(200).json({
            success: true,
            message: "Otp send successfully",
        })

    } catch (error) {
        console.log("Internal server error", error)
    }
}

exports.verifyOtpForChangeNumber = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp, newMobileNumber } = req.body;
        if (!newMobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required.',
            })
        }
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'Otp is required.',
            })
        }
        const findProvider = await providersModel.findById(id);
        if (!findProvider) {
            return res.status(404).json({
                success: false,
                message: 'Consultant not found.',
            })
        }
        if (findProvider.changeNumberOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid otp.',
            })
        }
        if (Date.now() > findProvider.changeNumberOtpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Otp expired.',
            })
        }
        findProvider.changeNumberOtp = null;
        findProvider.changeNumberOtpExpiresAt = null;
        findProvider.mobileNumber = newMobileNumber;
        await findProvider.save();
        return res.status(200).json({
            success: true,
            message: "Otp verified successfully",
        })

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.changeProviderDeactiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const findProvider = await providersModel.findById(id);
        if (!findProvider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found.',
            })
        }
        findProvider.isDeactived = !findProvider.isDeactived;
        await findProvider.save();
        return res.status(200).json({
            success: true,
            message: "Provider deactive successfully",
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}