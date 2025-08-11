const User = require('../models/user.Model');
const Provider = require('../models/providers.model');
require('dotenv').config();
const axios = require('axios');
const CallHistory = require('../models/CallHistory');

exports.createCall = async (req, res) => {
    try {
        const { providerId, userId, UserWallet, ProviderProfileMin, max_duration_allowed } = req.body;
        if (!providerId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Consultant ID and User ID are required"
            });
        }

        const provider = await Provider.findById(providerId);
        const user = await User.findById(userId);

        if (max_duration_allowed === 0) {

            return res.status(400).json({
                success: false,
                message: `Insufficient balance! You need at least ${ProviderProfileMin} to make a 1-minute call.`,
            });
        }

        if (!provider || !user) {
            return res.status(404).json({
                success: false,
                message: "Consultant or User not found"
            });
        }
        if (user.walletAmount === 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance! Please deposit money to make a call."
            });
        }

        if (provider.isBanned) {
            return res.status(400).json({
                success: false,
                message: "This Consultant is banned due to suspicious activity.",
            });
        }

        if (!provider.isProfileComplete) {
            return res.status(400).json({
                success: false,
                message: "This Consultant's profile is incomplete. Please choose another Consultant to make a call.",
            });
        }

        if (provider.is_on_chat) {
            return res.status(400).json({
                success: false,
                message: "This Consultant is already on chat. Please choose another Consultant to make a call.",
            });
        }

        if (provider.is_on_call) {
            return res.status(400).json({
                success: false,
                message: "Another User  already on a call with this Consultant. Please choose another Consultant to make a call.",
            });
        }

        const userNumber = user?.PhoneNumber;
        const providerNumber = provider?.mobileNumber;
        // console.log(providerNumber)
        // console.log("userNumber", userNumber)

        if (!userNumber || !providerNumber) {
            return res.status(400).json({
                success: false,
                message: "User or Consultant phone number is missing"
            });
        }

        const response = await axios.post(
            'https://apiv1.cloudshope.com/api/sendClickToCall',
            {
                from_number: userNumber,
                to_number: providerNumber,
                callback_url: "https://api.dessobuild.com/api/v1/call_status-call",
                callback_method: "POST",
                max_duration: max_duration_allowed
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CLOUDSHOPE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const callData = response.data;
        console.log("callData", callData)
        const newCallData = new CallHistory({
            userId: userId,
            from_number: userNumber,
            to_number: providerNumber,
            providerId: providerId,
            callerId: callData.data?.campaignId,
            callStatus: callData.call_status,
            UserWallet: UserWallet,
            max_duration_allowed: max_duration_allowed,
        })

        // provider.is_on_call = true;

        await provider.save()
        await newCallData.save();
        return res.status(200).json({
            success: true,
            message: "Call initiated successfully",
            callDetails: newCallData
        });

    } catch (error) {
        console.error("Error creating call:", error);
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Failed to create call",
                error: error.response.data
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.call_status = async (req, res) => {
    try {
        const callStatusQuery = req.query;
	console.log("query",req.query)
        if (!callStatusQuery.from_number || !callStatusQuery.to_number) {
            return res.status(400).json({
                success: false,
                message: "Missing required call details (from_number or to_number)."
            });
        }

        const findHistory = await CallHistory.findOne({
            from_number: callStatusQuery.from_number,
            to_number: callStatusQuery.to_number,
        })
            .sort({ createdAt: -1 })
            .populate('userId')
            .populate('providerId');

        if (!findHistory) {
            return res.status(404).json({
                success: false,
                message: "No call history found for the provided numbers."
            });
        }

        const providerId = findHistory?.providerId?._id;
        const userId = findHistory?.userId?._id;

        const findUser = await User.findById(userId);
        const findedProvider = await Provider.findById(providerId);

        if (!findedProvider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found."
            });
        }

        // Calculate talk time
        const startTime = parseInt(callStatusQuery.start_time);
        const endTime = parseInt(callStatusQuery.end_time);
        // let talkTimeInSeconds = endTime - startTime;
        let talkTimeInSeconds = Number(callStatusQuery.to_number_answer_time);

        if (isNaN(talkTimeInSeconds) || talkTimeInSeconds < 0) {
            talkTimeInSeconds = 0;
        }

        const minutes = Math.floor(talkTimeInSeconds / 60);
        const seconds = talkTimeInSeconds % 60;

        // Pad seconds with leading zero if needed
        const talkTimeFormatted = parseFloat(`${minutes}.${seconds.toString().padStart(2, '0')}`);

        console.log("talkTimeInSeconds", talkTimeInSeconds);
        console.log("Formatted talkTimeInMinutes", talkTimeFormatted);



        // Handle FAILED status
        if (callStatusQuery?.status === 'FAILED') {
            findHistory.status = callStatusQuery.status;
            findHistory.start_time = callStatusQuery.start_time;
            findHistory.end_time = callStatusQuery.end_time;
            findHistory.from_number_status = callStatusQuery.from_number_status;
            findHistory.to_number_status = callStatusQuery.to_number_status;
            findHistory.TalkTime = talkTimeFormatted;
            findedProvider.is_on_call = false;
            await Promise.all([findedProvider.save(), findHistory.save()]);
            return res.status(200).json({
                success: true,
                message: "Call failed",
                callData: callStatusQuery,
                callHistory: findHistory
            });
        }

        // Handle CANCEL status
        if (callStatusQuery?.to_number_status === "CANCEL") {
            findHistory.status = callStatusQuery.to_number_status;
            findHistory.start_time = callStatusQuery.start_time;
            findHistory.end_time = callStatusQuery.end_time;
            findHistory.from_number_status = callStatusQuery.from_number_status;
            findHistory.to_number_status = callStatusQuery.to_number_status;
            findHistory.TalkTime = talkTimeFormatted;
            findedProvider.is_on_call = false;
            findHistory.cancel_reason = 'Provider did not answer the call.';
            await Promise.all([findedProvider.save(), findHistory.save()]);
            return res.status(200).json({
                success: true,
                message: "To Number Status Received successfully.",
                callData: callStatusQuery,
                callHistory: findHistory
            });
        }

        // Calculate cost with 10-second grace logic
        let costToDeduct = 0;

        if (talkTimeInSeconds > 0) {
            const providerRate = findHistory.providerId?.pricePerMin || 0;
            let billableMinutes = 0;

            if (talkTimeInSeconds <= 60) {
                // Always charge full 1 minute (no grace)
                billableMinutes = 1;
            } else {
                const baseMinutes = Math.floor(talkTimeInSeconds / 60);
                const remainingSeconds = talkTimeInSeconds % 60;

                billableMinutes = baseMinutes;

                // After first 60 seconds, provide 10 seconds grace
                if (remainingSeconds > 10) {
                    billableMinutes += 1;
                }
            }

            costToDeduct = billableMinutes * providerRate;

            // Update wallets
            findedProvider.walletAmount += costToDeduct;
            findUser.walletAmount -= costToDeduct;
            findedProvider.is_on_call = false;

            await Promise.all([
                findedProvider.save(),
                findUser.save()
            ]);
        }


        // Update call history
        findHistory.status = callStatusQuery.status;
        findHistory.start_time = callStatusQuery.start_time;
        findHistory.end_time = callStatusQuery.end_time;
        findHistory.cost_of_call = costToDeduct;
        findHistory.from_number_status = callStatusQuery.from_number_status;
        findHistory.to_number_status = callStatusQuery.to_number_status;
        findHistory.TalkTime = talkTimeFormatted;
        findHistory.money_deducetation_amount = costToDeduct;
        findHistory.recording_url = callStatusQuery.recording_url;
        await findHistory.save();

        return res.status(200).json({
            success: true,
            message: "Call status received successfully.",
            talkTime: {
                seconds: talkTimeInSeconds,
                minutes: talkTimeFormatted
            },
            cost: costToDeduct,
            callData: callStatusQuery,
            callHistory: findHistory
        });

    } catch (error) {
        console.error("call disconnect error", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the call status.",
            error: error.message
        });
    }
};




exports.update_profile_status = async (id, status) => {
    try {
        console.log("I am in update_profile_status", id)
        const user = await Provider.findById(id).select('-chatTransition');
        console.log("before is_on_chat ", user.is_on_chat)

        // console.log("I am user", user)
        if (!user) {
            throw new Error('User not found');
        }

        user.is_on_chat = status; // Toggle the status
        await user.save(); // Save changes to the database
        console.log("update is_on_chat ", user.is_on_chat)
        return user;
    } catch (error) {
        console.log(error)
        throw new Error('Failed to update user profile status');
    }
};





exports.get_call_history_by_user = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("object", userId)
        const provider = await CallHistory.find({ userId: userId }).populate('userId').populate('providerId');
        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }
        const callHistory = provider;
        return res.status(200).json({ success: true, message: "Call history fetched successfully", data: callHistory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.get_call_history_by_provider = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        const provider = await CallHistory.find({ providerId: providerId }).populate('userId').populate('providerId');
        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }
        const callHistory = provider;
        return res.status(200).json({ success: true, message: "Call history fetched successfully", data: callHistory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.getAllCallHistory = async (req, res) => {
    try {
        const allHistory = await CallHistory.find().populate('userId').populate('providerId');
        if (!allHistory) {
            return res.status(404).json({
                success: false,
                message: "No call history found"
            })
        }
        return res.status(200).json({
            success: true,
            message: 'All call history fetched successfully',
            data: allHistory
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

exports.delete_call_history = async (req, res) => {
    try {
        const id = req.params.id;
        const callHistory = await CallHistory.findById(id);
        if (!callHistory) {
            return res.status(404).json({ success: false, message: "Call history not found" });
        }
        const deletedCallHistory = await CallHistory.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Call history deleted successfully" });
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.createCallFreeModule = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { callFrom, callTo, roomId } = req.body;

        if (!callFrom || !callTo || !roomId) {
            console.log("Validation failed: Missing fields");
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        console.log("Making request to Cloudshope API with:", {
            from_number: callFrom,
            to_number: callTo,
        });

        const response = await axios.post(
            'https://apiv1.cloudshope.com/api/sendClickToCall',
            {
                from_number: callFrom,
                to_number: callTo,
                // callback_url: "https://api.dessobuild.com/api/v1/call_status-call",
                // callback_method: "POST",
                // max_duration: max_duration_allowed
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CLOUDSHOPE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Cloudshope API response:", response.data);

        return res.status(200).json({
            success: true,
            message: "Call created successfully",
            data: response.data
        });

    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
