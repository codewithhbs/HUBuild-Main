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
        const allChat = await ChatAndPayment.find().populate('userId').populate('providerId').populate('providerIds');
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

        let chat = await ChatAndPayment.findOne({ room: id }).populate('userId').populate('providerId').populate('providerIds');
        if (!chat) {
            chat = await ChatAndPayment.findById(id).populate('userId').populate('providerId').populate('providerIds');
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
        const { userId, providerIds, groupName, amount, service, time, razorpayOrderId, transactionId, PaymentStatus } = req.body;

        // 1. Create chat room
        const newChatRoom = new ChatAndPayment({
            userId,
            providerIds,
            isManualChat: true,
            groupName,
            amount, service, time, razorpayOrderId, transactionId, PaymentStatus
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

exports.addOrUpdateProvidersInChat = async (req, res) => {
    try {
        const { chatRoomId, providerIds } = req.body;

        // Validate input
        if (!chatRoomId) {
            return res.status(400).json({ message: 'Chat room ID is required.' });
        }

        if (!providerIds || (Array.isArray(providerIds) && providerIds.length === 0)) {
            return res.status(400).json({ message: 'At least one provider ID is required.' });
        }

        const providerIdsArray = Array.isArray(providerIds) ? providerIds : [providerIds];

        // 1. Check if chat room exists
        const chatRoom = await ChatAndPayment.findById(chatRoomId);
        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found.' });
        }

        // 2. Validate new providers exist
        const existingProviders = await Provider.find({ _id: { $in: providerIdsArray } });
        if (existingProviders.length !== providerIdsArray.length) {
            return res.status(404).json({ message: 'One or more providers not found.' });
        }

        const currentProviders = chatRoom.providerIds.map(id => id.toString());
        const newProviders = providerIdsArray.map(id => id.toString());

        // 3. Determine which providers to add and remove
        const providersToAdd = newProviders.filter(id => !currentProviders.includes(id));
        const providersToRemove = currentProviders.filter(id => !newProviders.includes(id));

        // 4. Update chat room's providerIds field
        chatRoom.providerIds = providerIdsArray;
        const updatedChatRoom = await chatRoom.save();

        // 5. Add chatRoomId to new providers
        if (providersToAdd.length > 0) {
            await Provider.updateMany(
                { _id: { $in: providersToAdd } },
                { $addToSet: { chatRoomIds: chatRoomId } }
            );
        }

        // 6. Remove chatRoomId from removed providers
        if (providersToRemove.length > 0) {
            await Provider.updateMany(
                { _id: { $in: providersToRemove } },
                { $pull: { chatRoomIds: chatRoomId } }
            );
        }

        return res.status(200).json({
            message: 'Chat room providers updated successfully.',
            data: {
                chatRoom: updatedChatRoom,
                addedProviders: providersToAdd,
                removedProviders: providersToRemove
            }
        });

    } catch (error) {
        console.error("Error updating providers in chat room:", error);
        return res.status(500).json({
            message: 'An error occurred while updating providers in the chat room.',
            error: error.message
        });
    }
};

exports.getCustomChatById = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("userId", userId)
        const chat = await ChatAndPayment.findById(userId).populate('userId').populate('providerIds');
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        const filteredMessages = chat.messages || [];
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: filteredMessages
        })
    } catch (error) {
        console.log("Internal Server error", error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
}

exports.getManualChatBuUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const chat = await ChatAndPayment.find({ userId: userId }).populate('userId').populate('providerId').populate('providerIds')
        // console.log("chat",chat)
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            })
        }
        const filterChat = chat.filter(chat => chat.isManualChat === true);
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: filterChat
        })
    } catch (error) {
        console.log("Internal Server error", error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
}

exports.getManualChatByProviderId = async (req, res) => {
    try {
        const { providerId } = req.params;

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
            });
        }

        const chats = await ChatAndPayment.find({ providerIds: { $in: [providerId] } })
            .populate('userId')
            .populate('providerId')
            .populate('providerIds');

        if (!chats || chats.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No chats Group found for You',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chats fetched successfully',
            data: chats,
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

exports.updateGroupChatISEnded = async (req, res) => {
    try {
        const chatRoomId = req.params.id;
        const { isGroupChatEnded } = req.body;

        if (!chatRoomId) {
            return res.status(400).json({
                success: false,
                message: 'Chat room ID is required',
            });
        }

        if (typeof isGroupChatEnded !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isGroupChatEnded must be a boolean',
            });
        }

        const updatedChat = await ChatAndPayment.findByIdAndUpdate(
            chatRoomId,
            { isGroupChatEnded },
            { new: true }
        );

        if (!updatedChat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat updated successfully',
            data: updatedChat,
        });
    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

exports.getGroupChatById = async (req, res) => {
    try {
        const { id } = req.params;

        // Populate both userId and providerIds with their details
        const chat = await ChatAndPayment.findById(id)
            .populate('userId')
            .populate('providerIds');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        // Return the complete chat object instead of just messages
        res.status(200).json({
            success: true,
            message: 'Chat fetched successfully',
            data: [chat] // Wrapping in array to match frontend expectation
        });

    } catch (error) {
        console.log("Internal server error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}


exports.updateManualChatRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const {
      groupName,
      providerIds,
      userId,
      amount,
      service,
      razorpayOrderId,
      transactionId,
      PaymentStatus
    } = req.body;

    // 1. Find existing chat room
    const chatRoom = await ChatAndPayment.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    // 2. Remove chatRoomId from previously linked providers
    if (Array.isArray(chatRoom.providerIds) && chatRoom.providerIds.length > 0) {
      await Provider.updateMany(
        { _id: { $in: chatRoom.providerIds } },
        { $pull: { chatRoomIds: chatRoom._id } }
      );
    }

    // 3. Add chatRoomId to new provider list (if provided)
    if (Array.isArray(providerIds) && providerIds.length > 0) {
      await Provider.updateMany(
        { _id: { $in: providerIds } },
        { $addToSet: { chatRoomIds: chatRoom._id } }
      );
      chatRoom.providerIds = providerIds;
    }

    // 4. Handle user change and update references
    if (userId && userId.toString() !== chatRoom.userId.toString()) {
      await User.findByIdAndUpdate(chatRoom.userId, {
        $pull: { chatRoomIds: chatRoom._id }
      });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { chatRoomIds: chatRoom._id }
      });

      chatRoom.userId = userId;
    }

    // 5. Update other fields if present
    if (groupName) chatRoom.groupName = groupName;
    if (amount) chatRoom.amount = amount;
    if (service) chatRoom.service = service;
    if (razorpayOrderId) chatRoom.razorpayOrderId = razorpayOrderId;
    if (transactionId) chatRoom.transactionId = transactionId;
    if (PaymentStatus) chatRoom.PaymentStatus = PaymentStatus;

    // 6. Save updated document
    const updatedChatRoom = await chatRoom.save();

    return res.status(200).json({
      message: "Chat room updated successfully.",
      data: updatedChatRoom
    });
  } catch (error) {
    console.error("Error updating chat room:", error);
    return res.status(500).json({
      message: "An error occurred while updating the chat room.",
      error: error.message
    });
  }
};
