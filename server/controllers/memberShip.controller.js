const Provider = require("../models/providers.model"); // Import Provider model
const AdminCoupon = require("../models/adminCoupon.model");
const MemberShip = require('../models/memberShip.model');
const User = require("../models/user.Model");
const Razorpay = require('razorpay');
require('dotenv').config();
const axios = require('axios');
const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


exports.createMemberShip = async (req, res) => {
    try {
        const { planPrice } = req.body;
        if (!planPrice) {
            return res.status(400).json({
                success: false,
                message: "Plan price is required"
            })
        }
        const memberShip = await MemberShip.create({
            planPrice
        })
        await memberShip.save();
        res.status(200).json({
            success: true,
            message: "MemberShip created successfully",
            data: memberShip
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

exports.getAllMemberShip = async (req, res) => {
    try {
        const allMemberShip = await MemberShip.find();
        if (!allMemberShip) {
            return res.status(400).json({
                success: false,
                message: "No memberShip found"
            })
        }
        res.status(200).json({
            success: true,
            message: "MemberShip found successfully",
            data: allMemberShip
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

exports.getSingleMemberShip = async (req, res) => {
    try {
        const { id } = req.params;
        const memberShip = await MemberShip.findById(id);
        if (!memberShip) {
            return res.status(400).json({
                success: false,
                message: "MemberShip not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "MemberShip found successfully",
            data: memberShip
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

exports.updateMemberShip = async (req, res) => {
    try {
        const { id } = req.params;
        const { planPrice } = req.body;
        const memberShip = await MemberShip.findById(id);
        if (!memberShip) {
            return res.status(400).json({
                success: false,
                message: "MemberShip not found"
            })
        }
        if (planPrice) memberShip.planPrice = planPrice;
        await memberShip.save();
        res.status(200).json({
            success: true,
            message: "MemberShip updated successfully",
            data: memberShip
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

exports.deleteMemberShip = async (req, res) => {
    try {
        const { id } = req.params;
        const memberShip = await MemberShip.findByIdAndDelete(id);
        if (!memberShip) {
            return res.status(400).json({
                success: false,
                message: "MemberShip not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "MemberShip deleted successfully"
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

exports.checkCouponCode = async (req, res) => {
    try {
        const { couponCode } = req.body;
        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: "Coupon Code is required"
            });
        }

        // First, check Admin Coupon
        const adminCoupon = await AdminCoupon.findOne({ couponCode });
        if (adminCoupon) {
            console.log("object", adminCoupon);
            return res.status(200).json({
                success: true,
                message: "Coupon found successfully. Refer by admin",
                data: adminCoupon
            });
        }

        // Then, check Provider Coupon
        const providerCoupon = await Provider.findOne({ couponCode }).populate("discount"); // Populate discount if needed
        if (providerCoupon) {
            console.log("providerCoupon", providerCoupon);
            return res.status(200).json({
                success: true,
                message: "Coupon found successfully. Refer by provider",
                data: providerCoupon
            });
        }

        return res.status(400).json({
            success: false,
            message: "Coupon not found"
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.buyMemberShip = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: "Coupon Code is required"
            });
        }

        const provider = await Provider.findById(providerId);
        if (!provider) {
            return res.status(400).json({
                success: false,
                message: "Provider not found"
            });
        }

        const allMemberShip = await MemberShip.find();
        if (!allMemberShip || allMemberShip.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No Membership found"
            });
        }

        const memberShip = allMemberShip[0]; // Assuming the first membership is the correct one
        const planPrice = memberShip?.planPrice || 0;

        console.log("Selected Membership:", memberShip);

        // Check for Provider's Coupon
        const providerCoupon = await Provider.findOne({ couponCode }).populate("discount");

        // Check for Admin Coupon
        const adminCoupon = await AdminCoupon.findOne({ couponCode });

        let discount = 0;

        if (providerCoupon && providerCoupon.discount) {
            discount = providerCoupon.discount.discountPercent || 0;
        } else if (adminCoupon) {
            discount = adminCoupon.discount || 0;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Coupon Code"
            });
        }

        console.log("Applying Discount:", discount, "%");

        // Calculate Discounted Amount
        const discountAmount = (planPrice * discount) / 100;
        const finalAmount = planPrice - discountAmount;

        // Razorpay Order Options
        const razorpayOptions = {
            amount: finalAmount * 100 || 5000000, // Ensure it's in paise
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

        // Save Order ID in Provider
        provider.memberShip = memberShip._id;
        provider.razorpayOrderId = razorpayOrder.id;
        await provider.save();

        return res.status(200).json({
            success: true,
            message: "Membership bought successfully",
            data: {
                razorpayOrder,
                provider,
                discountAmount,
                finalAmount
            }
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


exports.membershipPaymentVerify = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        console.log("object", req.body);
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

        // Fetch payment details from Razorpay
        const paymentDetails = await axios.get(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
            auth: {
                username: process.env.RAZORPAY_KEY_ID,
                password: process.env.RAZORPAY_KEY_SECRET,
            },
        });

        const { method, status, amount } = paymentDetails.data;
        console.log("method, status, amount",method, status, amount)
        const currentTime = new Date().toISOString();

        const findProvider = await Provider.findOne({ razorpayOrderId: razorpay_order_id });
        if (!findProvider) {
            return res.status(400).json({
                success: false,
                message: 'Provider not found.',
            });
        }

        // If payment is not successful, handle failure
        if (status !== 'captured') {

            return res.redirect(
                `https://helpubuild.co.in/payment-failure?error=Payment failed via ${method || 'unknown method'}&transactionId=${razorpay_payment_id}&amount=${failedAmount}&date=${currentTime}`
            );
        }
        findProvider.isMember = true;
        await findProvider.save();
        return res.redirect(
            `https://helpubuild.co.in/successfull-recharge?amount=${amount}&transactionId=${razorpay_payment_id}&date=${currentTime}`
        );

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}