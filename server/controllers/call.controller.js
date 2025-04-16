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

        if (max_duration_allowed === 0) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance! You need at least ${ProviderProfileMin} to make a 1-minute call.`,
            });
        }


        const provider = await Provider.findById(providerId);
        const user = await User.findById(userId);

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
                callback_url: "https://www.api.helpubuild.co.in/api/v1/call_status-call",
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
        console.log("callData",callData)
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

        provider.is_on_call = true;
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
        // console.log("I am hit")
        const callStatusQuery = req.query;

        if (!callStatusQuery.from_number || !callStatusQuery.to_number) {
            return res.status(400).json({
                success: false,
                message: "Missing required call details (from_number or to_number)."
            });
        }

        console.log("query",callStatusQuery)

        const findHistory = await CallHistory.findOne({
            from_number: callStatusQuery.from_number,
            to_number: callStatusQuery.to_number,
        }).sort({createdAt: -1}).populate('userId').populate('providerId');
        console.log("findHistory finding",findHistory)

        if (!findHistory) {
            return res.status(404).json({
                success: false,
                message: "No call history found for the provided numbers."
            });
        }

        console.log("findHistory?.providerId finding",findHistory?.providerId)

        const findProviderId = findHistory?.providerId?._id;
        console.log("findProviderId finding id",findProviderId)

        const findedProvider = await Provider.findById(findProviderId);
        console.log("findedProvider finding",findedProvider)

        if (!findedProvider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found."
            });
        }

        // Calculate talk time
        const startTime = parseInt(callStatusQuery.start_time);
        const endTime = parseInt(callStatusQuery.end_time);
        let talkTimeInSeconds = endTime - startTime;

        if (isNaN(startTime) || isNaN(endTime) || talkTimeInSeconds < 0) {
            talkTimeInSeconds = 0;
        }


        let talkTimeInMinutes = (talkTimeInSeconds / 60).toFixed(2);

        if (callStatusQuery?.status === 'FAILED') {
            findHistory.status = callStatusQuery.status;
            findHistory.start_time = callStatusQuery.start_time;
            findHistory.end_time = callStatusQuery.end_time;
            findHistory.TalkTime = (talkTimeInSeconds / 60).toFixed(2);
            findedProvider.is_on_call = false;
            await findedProvider.save();
            await findHistory.save()
            console.log("findedProvider FAILED",findedProvider)
            console.log("findHistory FAILED",findHistory)
            return res.status(200).json({
                success: true,
                message: "Call failed",
                callData: callStatusQuery,
                callHistory: findHistory
            });
        }
        if (callStatusQuery?.to_number_status === "CANCEL") {
            findHistory.status = callStatusQuery.to_number_status;
            findHistory.start_time = callStatusQuery.start_time;
            findHistory.end_time = callStatusQuery.end_time;
            findedProvider.is_on_call = false;

            await findedProvider.save();
            findHistory.cancel_reason = 'Provider did not answer the call.';
            await findHistory.save();
            console.log("findedProvider CANCEL",findedProvider)
            console.log("findHistory cancel",findHistory)
            return res.status(200).json({
                success: true,
                message: "To Number Status Received successfully.",
                callData: callStatusQuery,
                callHistory: findHistory
            });
        }

        let HowManyCostOfTalkTime = 0;
        if (talkTimeInSeconds > 0) {
            if (talkTimeInSeconds < 60) {
                const num = Number(talkTimeInMinutes)
                HowManyCostOfTalkTime = num * findHistory.providerId?.pricePerMin;
            } else {
                HowManyCostOfTalkTime = talkTimeInMinutes * findHistory.providerId?.pricePerMin;
            }
            console.log("findHistory.providerId",findHistory.providerId)
            findedProvider.walletAmount += Number(HowManyCostOfTalkTime);
            findHistory.userId.walletAmount -= Number(HowManyCostOfTalkTime);
            findedProvider.is_on_call = false;

            await findedProvider.save();
            console.log("findedProvider call start and done",findedProvider)
            await findHistory.userId.save();
        }


        findHistory.status = callStatusQuery.status;
        findHistory.start_time = callStatusQuery.start_time;
        findHistory.end_time = callStatusQuery.end_time;
        findHistory.cost_of_call = HowManyCostOfTalkTime;
        findHistory.TalkTime = (talkTimeInSeconds / 60).toFixed(2);
        findHistory.money_deducetation_amount = HowManyCostOfTalkTime
        findHistory.recording_url = callStatusQuery.recording_url;
        await findHistory.save();
        // console.log("findHistory final",findHistory)

        return res.status(200).json({
            success: true,
            message: "Call status received successfully.",
            talkTime: {
                seconds: talkTimeInSeconds,
                minutes: talkTimeInMinutes
            },
            cost: HowManyCostOfTalkTime,
            callData: callStatusQuery,
            callHistory: findHistory
        });

    } catch (error) {
        console.log("call disconnect error",error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the call status.",
            error: error.message
        });
    }
};



exports.update_profile_status = async (id) => {
    try {
        console.log("I am in update_profile_status", id)
        console.log("I am Hit")
        const user = await Provider.findById(id).select('-chatTransition');
        console.log("before is_on_chat ", user.is_on_chat)

        console.log("I am user", user)
        if (!user) {
            throw new Error('User not found');
        }

        user.is_on_chat = !user.is_on_chat; // Toggle the status
        await user.save(); // Save changes to the database
        console.log("update is_on_chat ", user.is_on_chat)
        return user;
    } catch (error) {
        console.log(error)
        throw new Error('Failed to update user profile status');
    }
};



