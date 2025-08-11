const User = require("../models/user.Model");
const sendEmail = require("../utils/SendEmail");
const sendToken = require("../utils/SendToken");
const generateOtp = require("../utils/GenreateOtp")
const Provider = require("../models/providers.model");
const { uploadToCloudinary, deleteImageFromCloudinary } = require("../utils/Cloudnary");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios')
require('dotenv').config()
const { validatePaymentVerification, validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { default: mongoose } = require("mongoose");
const SendWhatsapp = require("../utils/SendWhatsapp");
const bcrypt = require('bcrypt');
const GlobelUserRefDis = require("../models/globelUserRefDis.model");
const providersModel = require("../models/providers.model");
const ChatAndPayment = require("../models/chatAndPayment.Model");
const RechargeCoupon = require("../models/rechargeCoupon.model");
// const { SendWhatsapp } = require("../utils/SendWhatsapp");
// const SendWhatsapp = require("../utils/SendWhatsapp");
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Generate a unique referral code
const generateReferralCode = (userId) => {
    return `REF${userId.toString().slice(-5)}${Math.floor(1000 + Math.random() * 9000)}`;
};

exports.registeruser = async (req, res) => {
    try {
        const { name, email, PhoneNumber, Password, cPassword } = req.body;
        const errors = [];

        if (!name) errors.push("Please enter a name");
        if (!email) errors.push("Please enter an email");
        if (!PhoneNumber) errors.push("Please enter a contact number");
        if (!Password || Password.length < 6) errors.push("Please enter a password with at least 6 characters");

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const checkNumber = await User.findOne({ PhoneNumber });
        if (checkNumber) {
            return res.status(400).json({ success: false, message: "Phone number already registered" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ success: false, message: "Email is already registered" });
            } else {


                const { otp, expiresAt } = generateOtp(6, 120000)
                existingUser.otp = otp
                existingUser.Password = Password
                existingUser.expiresAt = expiresAt


                const message = `Hello ${name},

It looks like you already have an account with us! To access your account and enjoy our services, please verify your account using the OTP below:

🔹 OTP: ${otp}
🕒 This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).

Verify your account now and start exploring all the benefits we offer! 🚀  
                `;


                await SendWhatsapp(PhoneNumber, message)
                // await sendEmail(emailContent);
                await existingUser.save()
                return res.status(200).json({ success: true, message: "A new verification message has been sent on whatsapp. Please check your Whatsapp.", data: existingUser });
            }
        }

        const { otp, expiresAt } = generateOtp(6, 120000)
        // const image = `https://ui-avatars.com/api/?background=random&name=${name}`
        const newUser = new User({
            // Gender,
            name,
            email,
            otp,
            expiresAt,
            PhoneNumber,
            Password,
            cPassword,
        });

        const couponDiscount = await GlobelUserRefDis.find();
        if (!couponDiscount) {
            newUser.referralDiscount = 10
        }
        const firstDis = couponDiscount[0];
        newUser.referralCode = generateReferralCode(newUser._id);

        newUser.referralDiscount = firstDis._id
        await newUser.save();

        const message = `Hello ${name},  
Thank you for registering with us! To complete your registration, please verify your Phone Number using the OTP below:  

🔹 OTP: ${otp}  
🕒 This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()})  

Once verified, you'll have full access to our services.  

Best regards,  
Your Service Team`;

        await SendWhatsapp(PhoneNumber, message);

        res.status(201).json({ success: true, data: newUser.expiresAt, message: "User registered successfully! Please check your email for verification." });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { type } = req.params;
        if (!type) {
            return res.status(400).json({ success: false, message: "Invalid type provided." });
        }

        const { email, otp, password } = req.body;
        console.log("Received data:", req.body);

        if (!email) return res.status(400).json({ success: false, message: "Please enter an email" });
        if (!otp) return res.status(400).json({ success: false, message: "Please enter the OTP" });

        let accountType = "User";
        let account = await User.findOne({ PhoneNumber: email });

        if (!account) {
            account = await Provider.findOne({ mobileNumber: email });
            accountType = "Provider";
        }

        if (!account) {
            return res.status(404).json({ success: false, message: `${accountType} account not found with that email.` });
        }

        // console.log("Fetch Account:", account)
        let accountOtp, otpExpiresAt, verificationMessage, newPassword;

        if (type === 'email' && accountType === "User") {
            accountOtp = account.otp;
            otpExpiresAt = account.expiresAt;
            verificationMessage = "Email verified successfully.";
        } else if (type === 'password') {
            accountOtp = account.resetPasswordOtp;
            console.log("otp", accountOtp)
            otpExpiresAt = account.resetPasswordExpiresAt;
            verificationMessage = "OTP verified for password reset.";
            newPassword = account.newPassword;
        } else {
            return res.status(400).json({ success: false, message: "Invalid verification type or unauthorized email verification for providers." });
        }

        // console.log("Stored OTP:", accountOtp, "User entered OTP:", otp);

        if (!accountOtp) {
            return res.status(400).json({ success: false, message: "OTP not found or expired, request a new one." });
        }

        if (accountOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        if (!otpExpiresAt || Date.now() > otpExpiresAt) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        if (type === 'email') {
            account.isVerified = true;
            account.otp = null;
            account.expiresAt = null;
        } else if (type === 'password') {

            account.Password = newPassword;
            account.resetPasswordOtp = null;
            account.resetPasswordExpiresAt = null;
        }

        await account.save();
        console.log("Save account", account);
        await sendToken(account, res, 200, verificationMessage);

    } catch (error) {
        console.error("Error during verification:", error);
        return res.status(500).json({ success: false, message: "An error occurred during verification." });
    }
};


exports.Changepassword = async (req, res) => {
    try {
        const { mobileNumber, otp, password } = req.body;
        console.log("[Changepassword] Request received with mobileNumber:", mobileNumber);

        // Validation
        if (!mobileNumber) {
            console.log("[Changepassword] Mobile number is missing");
            return res.status(400).json({ success: false, message: "Please enter a Mobile Number" });
        }
        if (!otp) {
            console.log("[Changepassword] OTP is missing");
            return res.status(400).json({ success: false, message: "Please enter the OTP" });
        }
        if (!password) {
            console.log("[Changepassword] Password is missing");
            return res.status(400).json({ success: false, message: "Please enter a new password" });
        }

        // Find account in User or Provider
        let account = await User.findOne({ PhoneNumber: mobileNumber });
        let isProvider = false;

        if (!account) {
            console.log("[Changepassword] User not found in User collection, checking Provider collection...");
            account = await Provider.findOne({ mobileNumber: mobileNumber });
            isProvider = true;
        }

        if (!account) {
            console.log("[Changepassword] No account found for mobileNumber:", mobileNumber);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("[Changepassword] Account found. Verifying OTP...");

        // OTP validation
        const accountOtp = account.resetPasswordOtp;
        const otpExpiry = account.resetPasswordExpiresAt;

        if (!accountOtp || !otpExpiry || new Date() > otpExpiry) {
            console.log("[Changepassword] OTP not found or expired for account:", mobileNumber);
            return res.status(400).json({ success: false, message: "OTP not found or expired, request a new one." });
        }

        if (accountOtp !== otp) {
            console.log("[Changepassword] Invalid OTP provided for account:", mobileNumber);
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        // Set new password
        if (isProvider) {
            account.password = password;
            console.log("[Changepassword] Password updated for Provider account.");
        } else {
            account.Password = password;
            console.log("[Changepassword] Password updated for User account.");
        }

        // Clear OTP data
        account.resetPasswordOtp = null;
        account.resetPasswordExpiresAt = null;

        await account.save();
        console.log("[Changepassword] Account saved successfully.");

        const verificationMessage = "Password changed successfully.";
        return await sendToken(account, res, 200, verificationMessage);

    } catch (error) {
        console.error("[Changepassword] Error occurred:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};



exports.resendOtp = async (req, res) => {
    try {
        const { type } = req.params; // Ensure 'type' is being passed correctly (it might be req.query.type)
        const { email } = req.body;

        console.log("Email:", email);

        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide an email." });
        }

        let account = await User.findOne({ PhoneNumber: email });
        let accountType = "User";

        if (!account) {
            account = await Provider.findOne({ mobileNumber: email });
            accountType = "Provider";
        }

        if (!account) {
            return res.status(404).json({ success: false, message: `${accountType} account not found with that email.` });
        }

        const { otp, expiresAt } = generateOtp(6, 120000);
        let message;

        if (type === 'email') {
            if (account.isVerified) {
                return res.status(400).json({ success: false, message: "Email is already verified." });
            }
            account.otp = otp;
            account.expiresAt = expiresAt;

            message = `Hello ${account.name},  

            You already have an account with us! Please verify your email using the OTP below:  

            🔹 OTP: ${otp}  
            🕒 This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).  

            Verify your account now and enjoy our services! 🚀`;

        } else if (type === 'password') {
            account.resetPasswordOtp = otp;
            account.resetPasswordExpiresAt = expiresAt;

            message = `Hello ${account.name},  

            You requested to reset your password. Please use the OTP below to verify your request:  

            🔹 OTP: ${otp}  
            🕒 This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).  

            If you did not request a password reset, please ignore this message. Your account remains secure.`;
        } else {
            return res.status(400).json({ success: false, message: "Invalid resend type." });
        }

        // Save the updated OTP details
        await account.save();

        const number = account.PhoneNumber;
        await SendWhatsapp(number, message);

        return res.status(200).json({ success: true, message: `A new OTP has been sent to your registered contact.` });

    } catch (error) {
        console.error("Error during OTP resend:", error);
        return res.status(500).json({ success: false, message: "An error occurred while resending OTP. Please try again later." });
    }
};



exports.updateProfile = async (req, res) => {
    // console.log("object")
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, email, PhoneNumber } = req.body;
        // const { ProfileImage } = req.file;

        const updateFields = {};

        if (req.file) {
            const { imageUrl, public_id } = await uploadToCloudinary(req.file.buffer)
            updateFields.ProfileImage = {
                imageUrl: imageUrl,
                public_id: public_id
            }
        }

        if (name) {
            updateFields.name = name;
        }
        if (email) updateFields.email = email;
        if (PhoneNumber) updateFields.PhoneNumber = PhoneNumber;

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};

exports.updateUserProfileImage = async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Internal server error'
            })
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.',
                error: 'No file uploaded.'
            })
        }
        if (existingUser?.ProfileImage?.public_id) {
            await deleteImageFromCloudinary(existingUser.ProfileImage.public_id)
        }
        const imgUrl = await uploadToCloudinary(req.file.buffer);
        const { imageUrl, public_id } = imgUrl
        existingUser.ProfileImage = { public_id, imageUrl: imageUrl }
        await existingUser.save();
        return res.status(200).json({
            success: true,
            message: 'Profile image updated successfully.',
            data: existingUser
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

exports.login = async (req, res) => {
    try {
        const { any, password, loginFrom } = req.body;
        console.log("📥 Received login request with:", { any, password, loginFrom });

        if (!any || !password) {
            console.log("❌ Missing email/phone or password");
            return res.status(400).json({ success: false, message: "Please provide both your email/phone number and password." });
        }

        // Step 1: Check in User collection
        console.log("🔍 Searching in User collection...");
        let user = await User.findOne({
            $or: [{ email: any }, { PhoneNumber: any }]
        });
        console.log("🧑 Found in User collection:", user ? user.email || user.PhoneNumber : null);

        let isProvider = false;

        // Step 2: If not found, check in Provider collection
        if (!user) {
            console.log("❌ Not found in User. Searching in Provider collection...");
            user = await Provider.findOne({
                $or: [{ email: any }, { mobileNumber: any }]
            });
            isProvider = true;
            console.log("🏥 Found in Provider collection:", user ? user.email || user.mobileNumber : null);

            // Step 3: Check if account is pending
            if (user?.accountVerified === 'Pending') {
                console.log("🚫 Provider account not verified yet.");
                return res.status(400).json({
                    success: false,
                    message: "Your account is not verified yet. Please wait for the admin to verify your account."
                });
            }
        }

        // Step 4: Check if user or provider was found
        if (!user) {
            console.log("❌ No account found.");
            return res.status(404).json({
                success: false,
                message: `No account found with that email/phone number${isProvider ? " for provider" : " for user"}.`
            });
        }

        console.log("✅ Account found:", user.email || user.PhoneNumber || user.mobileNumber);

        // Step 5: Role mismatch check
        if (user.role !== loginFrom) {
            console.log("❌ Role mismatch. Expected:", loginFrom, "| Found:", user.role);
            return res.status(404).json({
                success: false,
                message: `No account found with that email/phone number${isProvider ? " for user" : " for provider"}.`
            });
        }

        if(user.isDeleted === true){
            console.log("❌ Account is deleted.");
            return res.status(404).json({
                success: false,
                message: `No account found with that email/phone number${isProvider ? " for user" : " for provider"}.`
            });
        }

        // Step 6: Check password
        console.log("🔐 Checking password...");
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log("❌ Incorrect password");
            return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please try again." });
        }
        console.log("✅ Password matched");

        // Step 7: Check ban status
        if (user.isBanned) {
            console.log("🚫 Account is banned");
            return res.status(403).json({
                success: false,
                message: `Your ${isProvider ? "provider" : "user"} account has been blocked. Please contact our support team.`
            });
        }

        // Step 8: Update provider statuses
        if (user.role === "provider") {
            console.log("🔄 Updating provider statuses: loginStatus, chatStatus, callStatus");
            user.loginStatus = true;
            user.chatStatus = true;
            user.callStatus = true;
            await user.save();
            console.log("✅ Provider status updated and saved");
        }

        // Step 9: Send token and login success
        console.log("✅ Sending token and login success response...");
        await sendToken(user, res, 200, `Login successful! Welcome back, ${isProvider ? "Provider" : "User"}!`);

    } catch (error) {
        console.error("💥 Login error:", error);
        return res.status(500).json({ success: false, message: "An error occurred during login. Please try again later." });
    }
};


exports.updateUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { Password, newPassword } = req.body;
        const existingData = await User.findById(userId);
        if (!existingData) {
            return res.status(404).json({
                success: false, message: "User not found."
            });
        }
        const isMatch = await existingData.comparePassword(Password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please Enter Correct Password." });
        }
        existingData.Password = newPassword;
        await existingData.save();
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully.',
            data: existingData
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


exports.logout = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await providersModel.findById(id);
        if (provider) {
            provider.chatStatus = false
            provider.callStatus = false
            await provider.save();
        }
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true, // Optional: Ensures cookie is only accessible by the web server
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            sameSite: 'Lax', // Adjust based on your cross-site requirements
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong during logout',
            error: error.message
        });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { mobileNumber, newPassword } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({ success: false, message: "Please provide your phone number." });
        }

        let user = await User.findOne({ PhoneNumber: mobileNumber });
        let isProvider = false;

        if (!user) {
            user = await Provider.findOne({ mobileNumber: mobileNumber });
            isProvider = true;
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No account found with that phone number${isProvider ? " for provider" : " for user"}.`
            });
        }

        const { otp, expiresAt } = generateOtp(6, 120000);
        user.resetPasswordOtp = otp;
        user.resetPasswordExpiresAt = expiresAt;
        user.newPassword = newPassword;

        const message = `Hello,  
        
        We received a request to reset the password for your ${isProvider ? "provider" : "user"} account.  
        
        Please use the OTP below to proceed with your password reset:  
        
        \ud83d\udd39 OTP: ${otp}  
        \ud83d\udd52 This OTP is valid for 2 minutes (expires at: ${new Date(expiresAt).toISOString()}).`;

        await SendWhatsapp(mobileNumber, message);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "A password reset OTP has been sent via WhatsApp. Please check your inbox for further instructions."
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during the password reset process. Please try again later."
        });
    }
};

//==============Admin Works ==================//
exports.getAllUsers = async (req, res) => {
    try {
        const { isBanned, isVerified, PhoneNumber, email, Gender } = req.query;

        const filter = {};
        if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        if (PhoneNumber) filter.PhoneNumber = PhoneNumber;
        if (email) filter.email = email;
        if (Gender) filter.Gender = Gender;

        const users = await User.find(filter).select('-Password');

        res.status(200).json({ success: true, data: users })
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving users." });
    }
};

exports.getSingleUserById = async (req, res) => {
    try {
        // console.log(id)
        const userId = req.params.id;
        const user = await User.findById(userId).select('-Password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving the user." });
    }
};

exports.getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-Password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving the user." });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        // const user = await User.findByIdAndDelete(userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isDeleted = true; // Set isDeleted to true
        await user.save();
        // const userChat = await ChatAndPayment.deleteMany({ userId: userId });

        res.status(200).json({ success: true, message: "User account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the account" });
    }
};

exports.banUserToggle = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBanned } = req.body;
        // console.log("userid",userId)
        // console.log("banned",isBanned)

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isBanned = isBanned; // Toggle the isBanned status
        await user.save();

        const status = user.isBanned ? "banned" : "unbanned";
        res.status(200).json({ success: true, message: `User has been ${status} successfully` });
    } catch (error) {
        console.error("Error toggling ban status:", error);
        res.status(500).json({ success: false, message: "An error occurred while toggling ban status" });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                error: "User not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "User found",
            data: user
        });
    } catch (error) {
        console.log("Internal server error in getting user by id", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.createPayment = async (req, res) => {
    try {
        // console.log("i create payment start")
        const { userId } = req.params;
        const { price, couponCode } = req.body;
        if (!couponCode || typeof couponCode !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required and must be a string',
            });
        }
        const rechargeCoupon = await RechargeCoupon.findOne({ couponCode: couponCode.trim() });
        if (!rechargeCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Recharge coupon not found',
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                error: "User not found",
            })
        }
        if (!price) {
            return res.status(400).json({
                success: false,
                message: "Price is required",
                error: "Price is required"
            })
        }
        if (price === 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be zero",
                error: "Price cannot be zero"
            })
        }

        const razorpayOptions = {
            amount: price * 100 || 5000000,
            currency: 'INR',
            payment_capture: 1,
        };

        const razorpayOrder = await razorpayInstance.orders.create(razorpayOptions);

        if (!razorpayOrder) {
            return res.status(500).json({
                success: false,
                message: 'Error in creating Razorpay order',
            });
        }
        // console.log("create payment end")
        user.razorpayOrderId = razorpayOrder.id
        user.rechargeCoupon = rechargeCoupon?._id
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Razorpay order created successfully',
            data: {
                user,
                razorpayOrder,
            }
        });


    } catch (error) {
        console.log("Internal server error in doing payment", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.PaymentVerify = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Validate request body
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request',
            });
        }

        // Generate signature for verification
        const genreaterSignature = validatePaymentVerification({ "order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_KEY_SECRET);


        if (!genreaterSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }
        // console.log("process.env.RAZORPAY_KEY_ID", process.env.RAZORPAY_KEY_ID,process.env.RAZORPAY_KEY_SECRET)
        // Fetch payment details from Razorpay
        const paymentDetails = await axios.get(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
            auth: {
                username: process.env.RAZORPAY_KEY_ID,
                password: process.env.RAZORPAY_KEY_SECRET,
            },
        });

        const { method, status, amount } = paymentDetails.data;
        const currentTime = new Date().toISOString(); // Get current timestamp

        const findOrder = await User.findOne({ razorpayOrderId: razorpay_order_id }).populate('rechargeCoupon');
        if (!findOrder) {
            return res.status(400).json({
                success: false,
                message: 'Order not found.',
            });
        }

        const bonusPercentage = findOrder.rechargeCoupon?.discount || 0;
        // If payment is not successful, handle failure
        if (status !== 'captured') {
            const failedAmount = amount / 100; // Convert amount from paise to INR
            
            // Log failed payment with timestamp
            findOrder.rechargeHistory = findOrder.rechargeHistory || []; // Initialize if undefined
            findOrder.rechargeHistory.push({
                baseAmount: failedAmount,
                bonusAmount: 0,
                totalCredited: 0,
                time: currentTime,
                transactionId: razorpay_payment_id,
                paymentStatus: 'failed',
                paymentMethod: method,
                couponCode: findOrder.rechargeCoupon?.couponCode || null,
                couponDiscount: bonusPercentage,
            });


            // Save updated order
            await findOrder.save();

            return res.redirect(
                `https://www.dessobuild.com/payment-failure?error=Payment failed via ${method || 'unknown method'}&transactionId=${razorpay_payment_id}&amount=${failedAmount}&date=${currentTime}`
            );
        }


        const previousWalletAmount = findOrder.walletAmount || 0;
        const baseAmount = amount / 100; // Convert amount from paise to INR
        const bonusAmount = (baseAmount * bonusPercentage) / 100;
        const totalAmount = baseAmount + bonusAmount;

        findOrder.walletAmount = previousWalletAmount + totalAmount;


        // Log successful payment with timestamp
        findOrder.rechargeHistory = findOrder.rechargeHistory || []; // Initialize if undefined
        findOrder.rechargeHistory.push({
            baseAmount: baseAmount,
            bonusAmount: bonusAmount,
            totalCredited: totalAmount,
            time: currentTime,
            transactionId: razorpay_payment_id,
            paymentStatus: 'paid',
            paymentMethod: method,
            couponCode: findOrder.rechargeCoupon?.couponCode || null,
            couponDiscount: bonusPercentage,
        });


        // Save updated order
        await findOrder.save();
       return res.redirect(`https://www.dessobuild.com/successfull-recharge?amount=${totalAmount}&transactionId=${razorpay_payment_id}&date=${currentTime}`)
    } catch (error) {
        console.log('Internal server error', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// exports.chatStart = async (userId, astrologerId) => {
//     try {
//         const user = await User.findById(userId)
//         const provider = await Provider.findById(astrologerId)
//         if (!user) {
//             return {
//                 success: false,
//                 message: 'User is not found',
//                 error: 'User is not found'
//             }
//         }
//         if (!provider) {
//             return {
//                 success: false,
//                 message: 'Provider is not found',
//                 error: 'Provider is not found'
//             }
//         }

//         if (user?.role !== 'user') {
//             return {
//                 success: true,
//                 message: 'Chat started',
//                 error: 'Chat started',
//             };
//         }

//         const walletAmount = user?.walletAmount;
//         const providerWalletAmount = provider?.walletAmount;
//         const providerPricePerMin = provider?.pricePerMin;
//         if (walletAmount < providerPricePerMin) {
//             return {
//                 success: false,
//                 message: 'Your wallet amount is too low. Please recharge your wallet.',
//                 error: 'Your wallet amount is too low. Please recharge your wallet.'
//             }
//         }
//         if (providerPricePerMin === 0) {
//             return {
//                 success: false,
//                 message: 'Provider price per minute is zero. The provider has not been updated.',
//                 error: 'Provider price per minute is zero. The provider has not been updated.',
//             };
//         }

//         // Generate a unique ObjectId for the new chat transition
//         const newChatTransitionId = new mongoose.Types.ObjectId();

//         const chatTimingRemaining = Math.floor(walletAmount / providerPricePerMin);
//         const currentTime = new Date().toISOString();
//         user.chatTransition = user.chatTransition || []; // Initialize if undefined
//         provider.chatTransition = provider.chatTransition || []; // Initialize if undefined
//         const newChatTransition = {
//             _id: newChatTransitionId,
//             startChatTime: currentTime,
//             startingChatAmount: walletAmount,
//             providerPricePerMin: providerPricePerMin,
//             chatTimingRemaining: chatTimingRemaining,
//             provider: provider._id,
//         };
//         const newChatTransitionProvider = {
//             _id: newChatTransitionId,
//             startChatTime: currentTime,
//             startingChatAmount: providerWalletAmount,
//             providerPricePerMin: providerPricePerMin,
//             chatTimingRemaining: chatTimingRemaining,
//             user: user._id,
//         };
//         user.chatTransition.push(newChatTransition);
//         provider.chatTransition.push(newChatTransitionProvider);

//         user.lastChatTransitionId = newChatTransitionId;
//         provider.lastChatTransitionId = newChatTransitionId;

//         // console.log("newChatTransition", newChatTransition)

//         await user.save();
//         await provider.save();

//         return {
//             success: true,
//             message: 'Chat Stated Successfully',
//             data: {
//                 chatTimingRemaining: chatTimingRemaining,
//                 chatTransition: newChatTransition,
//                 lastChatTransitionId: user.lastChatTransitionId,
//             }
//         }

//     } catch (error) {
//         console.error('Error in createChatRoom:', error);
//         return {
//             success: false,
//             message: 'Internal server error',
//             error: error.message,
//         };
//     }
// }

exports.chatStart = async (userId, astrologerId) => {
    console.log("i am chatStart", userId, astrologerId)
    try {
        const user = await User.findById(userId)
        const provider = await Provider.findById(astrologerId)
        if (!user) {
            return {
                success: false,
                message: 'User is not found',
                error: 'User is not found'
            }
        }
        if (!provider) {
            return {
                success: false,
                message: 'Provider is not found',
                error: 'Provider is not found'
            }
        }

        if (user?.role !== 'user') {
            return {
                success: true,
                message: 'Chat started',
                error: 'Chat started',
            };
        }

        if (provider?.isBanned === true) {
            return {
                success: false,
                message: 'Provider is banned',
                error: 'Provider is banned',
            };
        }

        const walletAmount = user?.walletAmount;
        const providerWalletAmount = provider?.walletAmount;
        const providerPricePerMin = provider?.pricePerMin;
        if (walletAmount < providerPricePerMin) {
            return {
                success: false,
                message: 'Your wallet amount is too low. Please recharge your wallet.',
                error: 'Your wallet amount is too low. Please recharge your wallet.'
            }
        }
        if (providerPricePerMin === 0) {
            return {
                success: false,
                message: 'Provider price per minute is zero. The provider has not been updated.',
                error: 'Provider price per minute is zero. The provider has not been updated.',
            };
        }

        // Generate a unique ObjectId for the new chat transition
        const newChatTransitionId = new mongoose.Types.ObjectId();

        const chatTimingRemaining = Math.floor(walletAmount / providerPricePerMin);
        const currentTime = new Date().toISOString();
        user.chatTransition = user.chatTransition || []; // Initialize if undefined
        provider.chatTransition = provider.chatTransition || []; // Initialize if undefined
        const newChatTransition = {
            _id: newChatTransitionId,
            startChatTime: currentTime,
            startingChatAmount: walletAmount,
            providerPricePerMin: providerPricePerMin,
            chatTimingRemaining: chatTimingRemaining,
            provider: provider._id,
        };
        const newChatTransitionProvider = {
            _id: newChatTransitionId,
            startChatTime: currentTime,
            startingChatAmount: providerWalletAmount,
            providerPricePerMin: providerPricePerMin,
            chatTimingRemaining: chatTimingRemaining,
            user: user._id,
        };
        user.chatTransition.push(newChatTransition);
        provider.chatTransition.push(newChatTransitionProvider);

        user.lastChatTransitionId = newChatTransitionId;
        provider.lastChatTransitionId = newChatTransitionId;

        const adminNumber = process.env.ADMIN_NUMBER;
        const adminMessage = `New chat transition created with id ${newChatTransitionId} for user ${user?.name} and provider ${provider?.name}.`;
        await SendWhatsapp(adminNumber, adminMessage)

        // console.log("newChatTransition", newChatTransition)
        const number = provider?.mobileNumber;
        // const message = `New chat transition created with id ${newChatTransitionId} for user ${user?.name} and provider ${provider?.name}.`;
        const message = `Hello,  

You have received a new message! The ${user?.name} is waiting for your reply.  

⏳ Please respond quickly to continue the conversation.  

Keep the chat going! 🚀`;
        await SendWhatsapp(number, message)
        await user.save();
        // await provider.save();

        return {
            success: true,
            message: 'Chat Stated Successfully',
            data: {
                chatTimingRemaining: chatTimingRemaining,
                chatTransition: newChatTransition,
                lastChatTransitionId: user.lastChatTransitionId,
            }
        }

    } catch (error) {
        console.error('Error in createChatRoom:', error);
        return {
            success: false,
            message: 'Internal server error',
            error: error.message,
        };
    }
}

exports.chatStartFromProvider = async (userId, astrologerId) => {
    try {
        const user = await User.findById(userId)
        const provider = await Provider.findById(astrologerId)
        if (!user) {
            return {
                success: false,
                message: 'User is not found',
                error: 'User is not found'
            }
        }
        if (!provider) {
            return {
                success: false,
                message: 'Provider is not found',
                error: 'Provider is not found'
            }
        }

        if (user?.role !== 'user') {
            return {
                success: true,
                message: 'Chat started',
                error: 'Chat started',
            };
        }

        const walletAmount = user?.walletAmount;
        const providerWalletAmount = provider?.walletAmount;
        const providerPricePerMin = provider?.pricePerMin;
        if (walletAmount < providerPricePerMin) {
            return {
                success: false,
                message: `${user?.name} wallet amount is too low. So you can't able to chat.`,
                error: `${user?.name} wallet amount is too low. So you can't able to chat.`
            }
        }
        if (providerPricePerMin === 0) {
            return {
                success: false,
                message: 'Your price per minute is zero. You has not been updated.',
                error: 'Your price per minute is zero. You has not been updated.',
            };
        }

        // Generate a unique ObjectId for the new chat transition
        const newChatTransitionId = new mongoose.Types.ObjectId();

        const chatTimingRemaining = Math.floor(walletAmount / providerPricePerMin);
        const currentTime = new Date().toISOString();
        // user.chatTransition = user.chatTransition || []; // Initialize if undefined
        provider.chatTransition = provider.chatTransition || []; // Initialize if undefined

        const newChatTransitionProvider = {
            _id: newChatTransitionId,
            startChatTime: currentTime,
            startingChatAmount: providerWalletAmount,
            providerPricePerMin: providerPricePerMin,
            chatTimingRemaining: chatTimingRemaining,
            user: user._id,
        };
        // user.chatTransition.push(newChatTransition);
        provider.chatTransition.push(newChatTransitionProvider);

        // user.lastChatTransitionId = newChatTransitionId;
        provider.lastChatTransitionId = newChatTransitionId;

        // console.log("newChatTransition", newChatTransition)

        // await user.save();
        await provider.save();

        return {
            success: true,
            message: 'Chat Stated Successfully',
            data: {
                chatTimingRemaining: chatTimingRemaining,
                chatTransition: newChatTransitionId,
                lastChatTransitionId: user.lastChatTransitionId,
            }
        }

    } catch (error) {
        console.error('Error in createChatRoom:', error);
        return {
            success: false,
            message: 'Internal server error',
            error: error.message,
        };
    }
}

// SECOND FILE CHANGES (for your chatEnd controller function)

// Modified chatEnd function to accept actualStartTime parameter
exports.chatEnd = async (userId, astrologerId, actualStartTime = null) => {
    try {
        console.log("i am hit for deduction in chat")
        console.log("actualStartTime", actualStartTime)
        // First, find the user by userId
        const findUser = await User.findById(userId);
        if (!findUser) {
            return {
                success: false,
                message: 'User not found',
                error: 'User not found',
            };
        }

        const findProvider = await Provider.findById(astrologerId);
        if (!findProvider) {
            return {
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            };
        }

        // Check if the user is a provider, in which case we should find the provider
        let user;
        if (findUser.role === 'provider') {
            const findProvider = await Provider.findById(astrologerId);
            if (!findProvider) {
                return {
                    success: false,
                    message: 'Provider not found',
                    error: 'Provider not found',
                };
            }
            user = findProvider;  // Set user to the provider object
        } else {
            user = findUser;  // Set user to the regular user object
        }

        // Ensure the user has an active chat to end (check lastChatTransitionId)
        if (!user.lastChatTransitionId) {
            return {
                success: false,
                message: 'No active chat transition ID found',
                error: 'No active chat transition ID found',
            };
        }

        // Find the last chat transition
        const lastTransition = user.chatTransition.find(
            (transition) => transition._id.toString() === user.lastChatTransitionId.toString()
        );

        // Find the last chat transition
        const providerLastTransition = findProvider.chatTransition.find(
            (transition) => transition._id.toString() === findProvider.lastChatTransitionId.toString()
        );

        if (!lastTransition) {
            return {
                success: false,
                message: 'No active chat found to end in user',
                error: 'No active chat found to end in user',
            };
        }

        if (!providerLastTransition) {
            return {
                success: false,
                message: 'No active chat found to end in provider',
                error: 'No active chat found to end in provider',
            };
        }

        // Calculate the chat end details
        const endTime = new Date();

        // KEY CHANGE: Use actualStartTime if provided, otherwise use the original startChatTime
        const startTime = actualStartTime || new Date(lastTransition.startChatTime);

        // Calculate duration based on the actual start time (when both were connected)
        const durationSeconds = Math.ceil((endTime - startTime) / 1000); // total seconds
        const providerPricePerMinInPaise = lastTransition.providerPricePerMin * 100;

        // Calculate whole minutes and remainder seconds
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;

        // Apply 10 seconds grace logic
        let billableMinutes = 0;

        if (durationSeconds <= 60) {
            // Always charge full 1 minute if chat is 60 seconds or less
            billableMinutes = 1;
        } else {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = durationSeconds % 60;

            billableMinutes = minutes;

            // After 1 minute, apply 10 sec grace
            if (seconds > 10) {
                billableMinutes += 1;
            }
        }


        // Final amount to deduct
        const walletUsedInPaise = Math.min(billableMinutes * providerPricePerMinInPaise, user.walletAmount * 100);

        // Set the chat ending details
        lastTransition.endingChatTime = endTime.toISOString();
        lastTransition.endingChatAmount = (user.walletAmount * 100 - walletUsedInPaise) / 100; // Deducted amount in rupees
        user.walletAmount -= walletUsedInPaise / 100;  // Deduct wallet amount for chat duration (converted back to rupees)
        user.lastChatTransitionId = null;
        lastTransition.deductionAmount = walletUsedInPaise / 100;
        lastTransition.Date = endTime;

        // Set the chat ending details for provider
        providerLastTransition.endingChatTime = endTime.toISOString();
        findProvider.walletAmount += walletUsedInPaise / 100;  // Add amount to provider wallet (converted back to rupees)
        findProvider.lastChatTransitionId = null;
        providerLastTransition.deductionAmount = walletUsedInPaise / 100;
        providerLastTransition.Date = endTime;

        // Save the updated user data
        await user.save();
        await findProvider.save();

        // Log the timing information for debugging
        if (actualStartTime) {
            console.log(`Chat ended with actual start time: ${actualStartTime.toISOString()}`);
            console.log(`Original chat start time was: ${new Date(lastTransition.startChatTime).toISOString()}`);
            console.log(`Actual billing duration: ${durationSeconds} seconds (${billableMinutes} billable minutes)`);
        }

        return {
            success: true,
            message: 'Chat ended successfully',
            data: {
                duration: durationSeconds,
                walletUsedInPaise, // Wallet used in paise
                remainingWallet: user.walletAmount, // Remaining wallet in rupees
            },
        };
    } catch (error) {
        console.error('Error in chatEnd:', error);
        return {
            success: false,
            message: 'Internal server error',
            error: error.message,
        };
    }
};

exports.getTotalRechargeAmount = async (req, res) => {
    try {
        // Aggregate the rechargeHistory amounts from all users
        const totalRechargeAmount = await User.aggregate([
            { $unwind: '$rechargeHistory' }, // Unwind the rechargeHistory array
            { $group: { _id: null, totalAmount: { $sum: '$rechargeHistory.amount' } } } // Sum the 'amount' field
        ]);

        if (totalRechargeAmount.length === 0) {
            return res.status(404).json({ success: false, message: 'No recharge history found' });
        }

        // Return the total recharge amount
        return res.status(200).json({
            success: true,
            message: 'Total recharge amount retrieved successfully',
            data: totalRechargeAmount[0].totalAmount
        });

    } catch (error) {
        console.error('Error fetching total recharge amount:', error);
        return res.status(500).json({
            message: 'Server error while fetching total recharge amount. Please try again later.'
        });
    }
};

exports.getDetailForVerification = async (req, res) => {
    try {
        const { id } = req.params;
        let user = await User.findById(id)
        if (!user) {
            user = await Provider.findById(id)
        }
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                exists: false
            })
        }
        console.log("user.role", user.role)
        if (user.role === 'provider') {
            console.log("user.isMember", user.isMember)
            if (user.isMember === false) {
                return res.status(404).json({
                    success: false,
                    message: "provider is not purchased plan",
                    exists: false
                })
            }
        }
        res.status(200).json({
            success: true,
            exists: true
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            exists: true
        })
    }
}

exports.changeAvailableStatus = async (id, status) => {
    console.log("room id for set", id, status)
    try {
        const chatroom = await ChatAndPayment.findOne({ room: id })
        if (!chatroom) {
            return {
                success: false,
                message: 'Chatroom not found',
                error: 'Chatroom not found',
            };
        }
        chatroom.isChatStarted = status
        console.log("chatroom.isChatStarted", chatroom.isChatStarted)
        await chatroom.save()
        return {
            success: true,
            message: 'Chatroom updated successfully',
            data: chatroom,
        };
    } catch (error) {
        console.log("Internal server error", error)
        return {
            success: false,
            message: 'Internal server error',
            error: error.message,
        };
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find({});
        if (!users) {
            return res.status(500).json({
                success: false,
                message: "User not found",
                error: "User not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "User found",
            data: users
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