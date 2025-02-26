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

        if (!findProvider?.bankDetail || Object.keys(findProvider.bankDetail).length === 0 || !findProvider.bankDetail.accountNumber) {
            return res.status(400).json({
                success: false,
                message: 'Bank details not found. Please add complete bank details first.',
                error: 'Bank details not found. Please add complete bank details first.',
            });
        }
        
        // findProvider.walletAmount -= amount;

        // Create a new withdrawal request
        const newRequest = new Withdraw({
            provider,
            amount,
            commission,
            finalAmount,
            providerWalletAmount,
            commissionPercent
        });

        const providerNumber = findProvider?.mobileNumber;
        const providerName = findProvider?.name;
        const AdminNumber = process.env.ADMIN_NUMBER
        const providerMessage = `Your withdrawal request for an amount of ${amount} has been successfully created.

Please wait for admin approval. ✅`;
        const message = `New Withdrawal request from ${providerName} for amount ${amount} has been created. 

Please review the request on the admin panel and approve the withdrawal. ✅`;


        await SendWhatsapp(providerNumber, providerMessage)
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

        // Find the withdraw request by ID
        const findWithdraw = await Withdraw.findById(id);
        if (!findWithdraw) {
            return res.status(400).json({
                success: false,
                message: 'Withdraw request not found',
                error: 'Withdraw request not found',
            });
        }

        // Validate required fields
        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
                error: 'Provider ID is required',
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

        // Check if the withdraw request is already processed
        if (findWithdraw.status === 'Approved' || findWithdraw.status === 'Rejected') {
            return res.status(400).json({
                success: false,
                message: 'Withdraw request is already approved or rejected',
                error: 'Withdraw request is already approved or rejected',
            });
        }

        const providerNumber = findProvider?.mobileNumber;
        const withdrawAmount = findWithdraw.amount;

        if (status === 'Approved') {
            if (findProvider.walletAmount < withdrawAmount) {
                const message = `Withdrawal request failed! ❌  

You do not have sufficient balance to make a withdrawal. Please check your account balance and try again.`;
                await SendWhatsapp(providerNumber, message);

                findWithdraw.status = 'Rejected';
                await findWithdraw.save();

                return res.status(400).json({
                    success: false,
                    message: 'Insufficient wallet balance',
                    error: 'Insufficient wallet balance',
                });
            }

            // Deduct the amount from provider's wallet
            findProvider.walletAmount -= withdrawAmount;
            await findProvider.save();

            // Send approval message
            const message = `Your withdrawal request has been approved! ✅  

The amount has been credited to your bank account. Please check your account for confirmation.`;
            await SendWhatsapp(providerNumber, message);

            findWithdraw.status = 'Approved';
            await findWithdraw.save();
        } else if (status === 'Rejected') {
            // Send rejection message
            const message = `Your withdrawal request has been rejected. ❌  

The admin will contact you regarding this matter. Please stay tuned for further updates.`;
            await SendWhatsapp(providerNumber, message);

            findWithdraw.status = 'Rejected';
            await findWithdraw.save();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided',
                error: 'Invalid status provided',
            });
        }

        return res.status(200).json({
            success: true,
            message: `Withdraw status updated to ${status}`,
            data: findWithdraw,
        });

    } catch (error) {
        console.error('Internal server error', error);
        return res.status(500).json({
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