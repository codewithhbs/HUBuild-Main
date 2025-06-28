const AdminCoupon = require('../models/adminCoupon.model')

exports.createAdminCoupon = async (req, res) => {
    try {
        const { couponCode, discount } = req.body;
        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            })
        }
        if (!discount) {
            return res.status(400).json({
                success: false,
                message: 'Discount is required'
            })
        }
        const coupon = await AdminCoupon.create({
            couponCode,
            discount
        })
        return res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
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

exports.getAllAdminCoupon = async (req, res) => {
    try {
        const allCoupon = await AdminCoupon.find();
        if (!allCoupon) {
            return res.status(400).json({
                success: false,
                message: "Admin Coupon Not Founded"
            })
        }
        return res.status(201).json({
            success: true,
            message: "Admin Coupon Founded",
            data: allCoupon
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.getSingleAdminCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await AdminCoupon.findById(id);
        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: "Admin Coupon Not Founded"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Admin Coupon Founded",
            data: coupon
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
        })
    }
}

exports.updateAdminCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { couponCode, discount } = req.body;

        const coupon = await AdminCoupon.findById(id)
        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: "Admin Coupon Not Founded"
            })
        }

        if (couponCode) coupon.couponCode = couponCode;
        if (discount) coupon.discount = discount;
        await coupon.save();
        return res.status(200).json({
            success: true,
            message: "Admin Coupon Updated",
            data: coupon
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

exports.deleteAdminCoupon = async (req, res) => {
    try {
        const {id} = req.params;
        const coupon = await AdminCoupon.findByIdAndDelete(id)
        if(!coupon){
            return res.status(400).json({
                success: false,
                message: "Admin Coupon Not Founded"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Admin Coupon Deleted",
            data: coupon
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