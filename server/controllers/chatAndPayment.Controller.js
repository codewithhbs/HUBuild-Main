const Provider = require('../models/providers.model')
const User = require('../models/user.Model')
const ChatAndPayment = require('../models/chatAndPayment.Model')
const SendWhatsapp = require('../utils/SendWhatsapp')
require('dotenv').config()

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID, 
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

exports.createChatWithNew = async (req, res) => {
    try {
        // console.log("i am hit")
        const { userId, providerId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User id is required',
            })
        }
        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider id is required',
            })
        }
        const room = `${userId}_${providerId}`
        const check = await ChatAndPayment.findOne({ room: room })
        if (check) {
            return res.status(400).json({
                success: false,
                message: 'Chat is already started. Check Your chat room.',
                error: 'Chat is already started. Check Your chat room.'
            })
        }
        const newChat = new ChatAndPayment({
            userId,
            providerId,
            room: room
        })
        const user = await User.findById(userId)
        const number = user.number;
        const message = `Chat is initialized with ${user?.name}.  

Go ahead and wait for the user's message. ⏳`;

        // await SendWhatsapp(number,message)
        await newChat.save();
        return res.status(201).json({
            success: true,
            message: 'New chat created successfully',
            data: newChat
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

exports.getAllChatRecord = async (req, res) => {
    try {
        const allChat = await ChatAndPayment.find().populate('userId').populate('providerId')
        return res.status(200).json({
            success: true,
            message: 'All chat records fetched successfully',
            data: allChat
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

exports.getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ids", id)

        let chat = await ChatAndPayment.findOne({ room: id }).populate('userId').populate('providerId')
        if (!chat) {
            chat = await ChatAndPayment.findById(id).populate('userId').populate('providerId')
        } 
        console.log(chat)
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: chat
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

exports.getChatByProviderid = async (req, res) => {
    try {
        const { providerId } = req.params;
        const chat = await ChatAndPayment.find({ providerId: providerId }).populate('userId').populate('providerId')
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: chat
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

exports.getChatByUserid = async (req, res) => {
    try {
        const { userId } = req.params;
        const chat = await ChatAndPayment.find({ userId: userId }).populate('userId').populate('providerId')
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: chat
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


exports.markUserChatsAsRead = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from the request parameters
        console.log("user", userId)

        // Find all chats related to the user and where newChat is true, then update them to false
        const result = await ChatAndPayment.updateMany(
            { userId: userId, newChat: true },
            { $set: { newChat: false } }
        );

        console.log("result", result)

        // Check if any documents were modified
        if (result.nModified > 0) {
            return res.status(200).json({
                message: 'All new chats for this user have been marked as read.',
                modifiedCount: result.nModified,
            });
        } else {
            return res.status(200).json({
                message: 'No new chats found for this user to update.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred while marking user chats as read.',
            error: error.message,
        });
    }
};

exports.markProviderChatsAsRead = async (req, res) => {
    try {
        const { providerId } = req.params; // Get providerId from the request parameters
        console.log("provider", providerId)

        // Find all chats related to the provider and where newChat is true, then update them to false
        const result = await ChatAndPayment.updateMany(
            { providerId: providerId, newChat: true },
            { $set: { newChat: false } }
        );

        // Check if any documents were modified
        if (result.nModified > 0) {
            return res.status(200).json({
                message: 'All new chats for this provider have been marked as read.',
                modifiedCount: result.nModified,
            });
        } else {
            return res.status(200).json({
                message: 'No new chats found for this provider to update.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred while marking provider chats as read.',
            error: error.message,
        });
    }
};

exports.deleteChatRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const result = await ChatAndPayment.findByIdAndDelete(chatRoomId);
        if (result.deletedCount > 0) {
            return res.status(200).json({
                message: 'Chat room deleted successfully.',
                deletedCount: result.deletedCount,
            });
        } else {
            return res.status(404).json({
                message: 'Chat room not found.',
                error: 'Chat room not found.',
            });
        }
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            message: 'An error occurred while deleting the chat room.',
            error: error.message,
        });
    }
}

exports.getchatByRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const result = await ChatAndPayment.find({ room: chatRoomId }).populate('userId').populate('providerId');
        if (result.length > 0) {
            return res.status(200).json({
                message: 'Chat retrieved successfully.',
                data: result,
            });
        } else {
            return res.status(404).json({
                message: 'No chats found for this chat room.',
                error: 'No chats found for this chat room.',
            });
        }

    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the chat.',
            error: error.message,
        });
    }
}