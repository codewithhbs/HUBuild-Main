const Withdraw = require('../models/withdraw.model')
const Provider = require('../models/providers.model');
const SendWhatsapp = require('../utils/SendWhatsapp');

exports.createWithdrawal = async (req, res) => {
    try {
        const { provider, amount, commission, finalAmount, providerWalletAmount, commissionPercent } = req.body;

        // Collect missing fields
        const emptyField = [];
        if (!provider) emptyField.push('Provider');
        if (!amount) emptyField.push('Amount');
        if (!commission) emptyField.push('Commission');
        if (!finalAmount) emptyField.push('Final Amount');
        if (!providerWalletAmount) emptyField.push('Provider Wallet Amount');
        if (!commissionPercent) emptyField.push('Commission percent');

        // Return an error if any field is missing
        if (emptyField.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please provide all fields: ${emptyField.join(', ')}`
            });
        }

        if (amount > providerWalletAmount) {
            return res.status(400).json({
                success: false,
                message: 'Your wallet amount is insufficient'
            });
        }

        const findProvider = await Provider.findById(provider);

        if (!findProvider) {
            return res.status(400).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            });
        }

        if(!findProvider?.bankDetail){
            return res.status(400).json({
                success: false,
                message: 'Bank details not found',
                error: 'Bank details not found',
            });
        }

        findProvider.walletAmount -= amount;

        // Create a new withdrawal request
        const newRequest = new Withdraw({
            provider,
            amount,
            commission,
            finalAmount,
            providerWalletAmount,
            commissionPercent
        });

        const providerName = findProvider?.name;
        const AdminNumber = process.env.ADMIN_NUMBER
        const message = `New withdrawal request from ${providerName}.  

Please review the request on the admin panel and approve the withdrawal. ✅`;


        await SendWhatsapp(AdminNumber, message)

        await findProvider.save();
        // Save the request to the database
        await newRequest.save();

        return res.status(200).json({
            success: true,
            message: 'Withdrawal request created successfully',
            data: newRequest,
        });

    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.updateWithdrawStatus = async (req, res) => {
    try {
        const { id } = req.params; // Withdraw request ID
        const { status, providerId } = req.body; // Status and Provider ID from the request body
        // console.log("i am hit", status, providerId)

        // Find the withdraw request by ID
        const findWithdraw = await Withdraw.findById(id);
        if (!findWithdraw) {
            return res.status(400).json({
                success: false,
                message: 'Error in finding withdraw request',
                error: 'Error in finding withdraw request',
            });
        }

        // Validate required fields
        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider Id is required',
                error: 'Provider Id is required',
            });
        }
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
                error: 'Status is required',
            });
        }

        // Find the provider by ID
        const findProvider = await Provider.findById(providerId);
        if (!findProvider) {
            return res.status(400).json({
                success: false,
                message: 'Provider not found',
                error: 'Provider not found',
            });
        }

        const withdrawStatus = findWithdraw.status;
        if (withdrawStatus === 'Approved' || withdrawStatus === 'Rejected') {
            return res.status(400).json({
                success: false,
                message: 'Withdraw request is already approved or rejected',
                error: 'Withdraw request is already approved or rejected',
            });
        }

        // If the withdraw status is approved, deduct the amount from the provider's wallet
        if (status === 'Approved') {
            const providerNumber = findProvider?.mobileNumber;
            const message = `Withdrawal request failed! ❌  

You do not have sufficient balance to make a withdrawal. Please check your account balance and try again.`;

            if (findProvider.walletAmount < findWithdraw.amount) {
                await SendWhatsapp(providerNumber, message)
                findWithdraw.status = 'Rejected';
                await findWithdraw.save();
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient wallet balance',
                    error: 'Insufficient wallet balance',
                });
            }

            // findProvider.walletAmount -= findWithdraw.amount; // Deduct the amount
            // await findProvider.save(); // Save updated provider

            message = `Your withdrawal request has been approved! ✅  

The amount has been credited to your bank account. Please check your account for confirmation.`;

            await SendWhatsapp(providerNumber, message)
            // Update the status of the withdraw request
            findWithdraw.status = status;
            await findWithdraw.save();
            return res.status(200).json({
                success: true,
                message: 'Withdraw status updated',
                data: findWithdraw,
            });
        }

        if (status === 'Rejected') {
            findProvider.walletAmount += findWithdraw.amount; // Deduct the amount

            findWithdraw.status = status;

            const providerNumber = findProvider?.mobileNumber;
            const message = `Your withdrawal request has been rejected. ❌  

The admin will contact you regarding this matter. Please stay tuned for further updates.`;

            await SendWhatsapp(providerNumber, message)
            await findProvider.save();
            await findWithdraw.save();
            return res.status(200).json({
                success: true,
                message: 'Withdraw status updated',
                data: findWithdraw,
            });
        }

        // Update the status of the withdraw request
        findWithdraw.status = status;
        await findWithdraw.save();

        return res.status(200).json({
            success: true,
            message: 'Withdraw status updated',
            data: findWithdraw,
        });
    } catch (error) {
        console.error('Internal server error', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

exports.deleteWithdrawRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteWithdraw = await Withdraw.findByIdAndDelete(id)
        if (!deleteWithdraw) {
            return res.status(400).json({
                success: false,
                message: 'Withdraw request not fount',
                error: 'Withdraw request not fount'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Withdraw request deleted successfully',
            data: deleteWithdraw
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

exports.getWithdrawalsByProviderId = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Find withdrawals by provider ID
        const withdrawals = await Withdraw.find({ provider: providerId }).populate('provider'); // Optional: populate provider details

        if (!withdrawals || withdrawals.length === 0) {
            return res.status(404).json({ message: 'No withdrawals found for this provider.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Withdraw request found successfully',
            data: withdrawals
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdraw.find().populate('provider');
        if (!withdrawals) {
            return res.status(404).json({
                success: false,
                message: 'No withdrawals found',
                error: 'No withdrawals found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Withdraw request found successfully',
            data: withdrawals
        });

    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.getTotalWithdrawAndCommission = async (req, res) => {
    try {
        // Aggregate the total withdraw amount and total commission from all withdrawals
        const totals = await Withdraw.aggregate([
            { $match: { status: 'Approved' } }, // Only consider approved withdrawals
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalCommission: { $sum: { $toDouble: '$commission' } } // Sum the commission as a number
                }
            }
        ]);

        if (totals.length === 0) {
            return res.status(404).json({ message: 'No approved withdrawals found' });
        }

        // Return the total withdraw amount and total commission
        return res.status(200).json({
            totalWithdrawAmount: totals[0].totalAmount,
            totalCommission: totals[0].totalCommission
        });

    } catch (error) {
        console.error('Error fetching total withdraw and commission:', error);
        return res.status(500).json({
            message: 'Server error while fetching total withdraw and commission. Please try again later.'
        });
    }
};