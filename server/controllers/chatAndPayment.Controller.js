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
        const { role } = req.query; // role should be passed as a query param

        let chat = await ChatAndPayment.findOne({ room: id }).populate('userId').populate('providerId');
        if (!chat) {
            chat = await ChatAndPayment.findById(id).populate('userId').populate('providerId');
        }

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Filter messages according to the role and deletion timestamp
        let filteredMessages = chat.messages || [];

        if (role === 'user' && chat.deletedDateByUser) {
            filteredMessages = filteredMessages.filter(
                msg => new Date(msg.timestamp).getTime() > new Date(chat.deletedDateByUser).getTime()
            );
        }

        if (role === 'provider' && chat.deletedDateByProvider) {
            filteredMessages = filteredMessages.filter(
                msg => new Date(msg.timestamp).getTime() > new Date(chat.deletedDateByProvider).getTime()
            );
        }

        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: {
                ...chat._doc,
                messages: filteredMessages
            }
        });

    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
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
        // console.log("provider", providerId)

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
        return res.status(200).json({
            message: 'Chat room deleted successfully.',
            deletedCount: result.deletedCount,
        });
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

exports.deleteChatByRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const result = await ChatAndPayment.deleteOne({ room: chatRoomId });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found.',
                error: 'Chat not found.',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Chat deleted successfully.',
        });
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the chat.',
            error: error.message,
        });
    }
}

exports.deleteMessageFromRoom = async (req, res) => {
    try {
        const { chatRoomId } = req.params;
        const { role } = req.query;

        const findChat = await ChatAndPayment.findOne({ room: chatRoomId });
        if (!findChat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found.',
            });
        }

        // If role is user
        if (role === 'user') {
            // if (findChat.deleteByProvider) {
            //     const deleteChat = await ChatAndPayment.deleteOne({ room: chatRoomId });
            //     if (deleteChat.deletedCount === 0) {
            //         return res.status(404).json({
            //             success: false,
            //             message: 'Chat not found or already deleted.',
            //         });
            //     }
            //     return res.status(200).json({
            //         success: true,
            //         message: 'Chat deleted successfully.',
            //     });
            // } else {
            findChat.deleteByUser = true;
            findChat.deletedDateByUser = new Date();
            await findChat.save();
            return res.status(200).json({
                success: true,
                message: 'Message deleted successfully by user.',
            });
            // }
        }

        // If role is provider
        else if (role === 'provider') {
            // if (findChat.deleteByUser) {
            //     const deleteChat = await ChatAndPayment.deleteOne({ room: chatRoomId });
            //     if (deleteChat.deletedCount === 0) {
            //         return res.status(404).json({
            //             success: false,
            //             message: 'Chat not found or already deleted.',
            //         });
            //     }
            //     return res.status(200).json({
            //         success: true,
            //         message: 'Chat deleted successfully.',
            //     });
            // } else {
            findChat.deleteByProvider = true;
            findChat.deletedDateByProvider = new Date();
            await findChat.save();
            return res.status(200).json({
                success: true,
                message: 'Message deleted successfully by provider.',
            });
            // }
        }

        // If role is missing or invalid
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role provided.',
            });
        }

    } catch (error) {
        console.error("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the message.',
            error: error.message,
        });
    }
};


// create manual chat room with multiple vendor and user

exports.createManualChatRoom = async (req, res) => {
    try {
        const { userId, providerIds } = req.body;

        // 1. Create chat room
        const newChatRoom = new ChatAndPayment({
            userId,
            providerIds
        });
        const savedChatRoom = await newChatRoom.save();

        // 2. Add chatRoom ID to user
        await User.findByIdAndUpdate(userId, {
            $addToSet: { chatRoomIds: savedChatRoom._id }
        });

        // 3. Add chatRoom ID to each provider
        await Provider.updateMany(
            { _id: { $in: providerIds } },
            { $addToSet: { chatRoomIds: savedChatRoom._id } }
        );

        return res.status(200).json({
            message: 'Chat room created successfully.',
            data: savedChatRoom
        });
    } catch (error) {
        console.error("Error creating chat room:", error);
        return res.status(500).json({
            message: 'An error occurred while creating the chat room.',
            error: error.message
        });
    }
};

exports.addProvidersToChat = async (req, res) => {
    try {
        const { chatRoomId, providerIds } = req.body;

        // Validate input
        if (!chatRoomId) {
            return res.status(400).json({
                message: 'Chat room ID is required.'
            });
        }

        if (!providerIds || (Array.isArray(providerIds) && providerIds.length === 0)) {
            return res.status(400).json({
                message: 'At least one provider ID is required.'
            });
        }

        // Ensure providerIds is an array (handle single provider case)
        const providerIdsArray = Array.isArray(providerIds) ? providerIds : [providerIds];

        // 1. Check if chat room exists
        const chatRoom = await ChatAndPayment.findById(chatRoomId);
        if (!chatRoom) {
            return res.status(404).json({
                message: 'Chat room not found.'
            });
        }

        // 2. Check if providers exist
        const existingProviders = await Provider.find({ _id: { $in: providerIdsArray } });
        if (existingProviders.length !== providerIdsArray.length) {
            return res.status(404).json({
                message: 'One or more providers not found.'
            });
        }

        // 3. Filter out providers that are already in the chat room
        const newProviderIds = providerIdsArray.filter(
            providerId => !chatRoom.providerIds.includes(providerId)
        );

        if (newProviderIds.length === 0) {
            return res.status(400).json({
                message: 'All specified providers are already in the chat room.'
            });
        }

        // 4. Update chat room with new providers
        const updatedChatRoom = await ChatAndPayment.findByIdAndUpdate(
            chatRoomId,
            { $addToSet: { providerIds: { $each: newProviderIds } } },
            { new: true }
        );

        // 5. Add chatRoom ID to each new provider
        await Provider.updateMany(
            { _id: { $in: newProviderIds } },
            { $addToSet: { chatRoomIds: chatRoomId } }
        );

        return res.status(200).json({
            message: `Successfully added ${newProviderIds.length} provider(s) to the chat room.`,
            data: {
                chatRoom: updatedChatRoom,
                addedProviders: newProviderIds
            }
        });

    } catch (error) {
        console.error("Error adding providers to chat room:", error);
        return res.status(500).json({
            message: 'An error occurred while adding providers to the chat room.',
            error: error.message
        });
    }
};