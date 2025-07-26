const RechargeCoupon = require("../models/rechargeCoupon.model");

exports.createRechargeCoupon = async (req, res) => {
    try {
        const { couponCode, discount } = req.body;
        if (!couponCode) {
            return res.status(400).json({ message: "Coupon code is required" });
        }
        if (!discount) {
            return res.status(400).json({ message: "Discount is required" });
        }
        const newRechargeCoupon = new RechargeCoupon({ couponCode, discount });
        await newRechargeCoupon.save();
        res.status(200).json({
            success: true,
            message: "Recharge coupon created successfully",
            data: newRechargeCoupon,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

exports.getAllRechargeCoupons = async (req, res) => {
    try {
        const rechargeCoupons = await RechargeCoupon.find();
        if (!rechargeCoupons) {
            return res.status(404).json({ message: "No recharge coupons found" });
        }
        res.status(200).json({
            success: true,
            message: "Recharge coupons found",
            data: rechargeCoupons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

exports.updateRechargeCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { couponCode, discount } = req.body;
        const updatedRechargeCoupon = await RechargeCoupon.findByIdAndUpdate(id, { couponCode, discount }, { new: true });
        if (!updatedRechargeCoupon) {
            return res.status(404).json({ message: "Recharge coupon not found" });
        }
        res.status(200).json({
            success: true,
            message: "Recharge coupon updated",
            data: updatedRechargeCoupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

exports.getSingleRechargeCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const rechargeCoupon = await RechargeCoupon.findById(id);
        if (!rechargeCoupon) {
            return res.status(404).json({ message: "Recharge coupon not found" });
        }
        res.status(200).json({
            success: true,
            message: "Recharge coupon found",
            data: rechargeCoupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

exports.deleteRechargeCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRechargeCoupon = await RechargeCoupon.findByIdAndDelete(id);
        if (!deletedRechargeCoupon) {
            return res.status(404).json({ message: "Recharge coupon not found" });
        }
        res.status(200).json({
            success: true,
            message: "Recharge coupon deleted",
            data: deletedRechargeCoupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

exports.checkCouponIsExist = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode || typeof couponCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required and must be a string',
      });
    }

    const rechargeCoupon = await RechargeCoupon.findOne({ couponCode: couponCode.trim() });

    if (!rechargeCoupon) {
      return res.status(404).json({
        success: false,
        message: 'Recharge coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recharge coupon found',
      data: rechargeCoupon,
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};