const Chat = require('../models/Chat.model');

// socket.on('message', async ({ room, message }) => {
//     console.log(`Message to ${room}:`, message);

//     // Save message to database
//     await Chat.findOneAndUpdate(
//         { room },
//         { $push: { messages: { senderId: socket.id, text: message } } },
//         { upsert: true, new: true }
//     );

//     // Broadcast the message to the room
//     io.to(room).emit('return_message', { text: message, senderId: socket.id });
// });

// socket.on('file_upload', async ({ room, fileData }) => {
//     console.log(`File received in ${room}:`, fileData);

//     // Save file to database
//     await Chat.findOneAndUpdate(
//         { room },
//         { $push: { messages: { senderId: socket.id, file: fileData } } },
//         { upsert: true, new: true }
//     );

//     io.to(room).emit('return_message', { text: 'Attachment received', file: fileData, senderId: socket.id });
// });

exports.getAllChat = async(req,res) => {
    try {
        // const chats = await Chat.find().populate('messages.senderId').exec();
        const chats = await Chat.find();
        res.status(200).json({
            success: true,
            data: chats
        })
    } catch (error) {
        console.log("Internal server error in geting all chat",error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}
