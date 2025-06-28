const Commission = require('../models/commission.model');

// Create Commission
exports.createCommission = async (req, res) => {
    try {
        const { commissionPercent } = req.body;
        if (!commissionPercent) {
            return res.status(400).json({
                success: false,
                message: 'Commission percent required',
                error: 'Commission percent required',
            });
        }
        const newCommission = new Commission({
            commissionPercent,
        });
        await newCommission.save();
        return res.status(200).json({
            success: true,
            message: 'Commission created successfully',
            data: newCommission
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

// Update Commission
exports.updateCommission = async (req, res) => {
    try {
        const { id } = req.params; // ID from request params
        const { commissionPercent } = req.body;

        if (!commissionPercent) {
            return res.status(400).json({
                success: false,
                message: 'Commission percent is required for update',
            });
        }

        const updatedCommission = await Commission.findByIdAndUpdate(
            id,
            { commissionPercent },
            { new: true } // Return the updated document
        );

        if (!updatedCommission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Commission updated successfully',
            data: updatedCommission,
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

// Delete Commission
exports.deleteCommission = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCommission = await Commission.findByIdAndDelete(id);

        if (!deletedCommission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Commission deleted successfully',
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

// Get Single Commission
exports.getSingleCommission = async (req, res) => {
    try {
        const { id } = req.params;

        const commission = await Commission.findById(id);

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Commission retrieved successfully',
            data: commission,
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

// Get All Commissions
exports.getAllCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find();

        return res.status(200).json({
            success: true,
            message: 'Commissions retrieved successfully',
            data: commissions,
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
