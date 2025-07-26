const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

// Import local modules
const ConnectDB = require('./Config/DataBase');
const router = require('./routes/routes');
const Chat = require('./models/chatAndPayment.Model.js');
const { chatStart, chatEnd, chatStartFromProvider, changeAvailableStatus } = require('./controllers/user.Controller');
const { update_profile_status } = require('./controllers/call.controller');

// Connect to database
ConnectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 9123;

// Configuration for rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    limit: 200, // 200 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Too many requests",
    statusCode: 429,
    handler: (req, res, next) => {
        try {
            next();
        } catch (error) {
            res.status(429).send("Too many requests");
        }
    }
});

// Middleware setup
app.set(express.static('public'));
app.use('/public', express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins, but echo them back explicitly
        callback(null, origin || true);
    },
    credentials: true
}));


// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Make socket.io available to routes
app.locals.socketIo = io;
app.set('socketIo', io);

// Socket.io configuration and constants
const userConnections = new Map();
const providerConnections = new Map();
const roomMemberships = new Map();
const activeTimers = new Map();
const inactivityTimers = new Map();
let providerHasConnected = false;

// First, add a new Map to track when actual chat timing should start
const chatStartTimestamps = new Map(); // Stores the real start time when both are connected
const roomChatInfo = new Map(); // Stores chat information for each room

const TIMEOUT_DURATION = 60000; // 1 minute
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const PROHIBITED_PATTERNS = [
    /\b\d{10}\b/,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    /@[\w.-]+\.[a-zA-Z]{2,6}/,
    /\b18\+|adult\b/i,
];

// Set up logging
morgan.token('origin', (req) => req.headers.origin || 'Unknown Origin');
app.use(morgan(':method :url :status :response-time ms - Origin: :origin'));

// Cache control headers
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log("socket is connected ", socket.id)
    // Handle socket ID registration
    socket.on('send_socket_id', ({ socketId, role, userId }) => {
        try {
            console.log("i am in send socket id", socketId, role, userId)
            // console.log("socketId, role, userId", socketId, role, userId)
            if (!socketId || !role || !userId) {
                throw new Error('Missing required parameters');
            }

            if (role === 'user') {
                userConnections.set(userId, socketId);
            } else if (role === 'provider') {
                providerConnections.set(userId, socketId);
                console.log("providerConnections", providerConnections)
            } else {
                throw new Error('Invalid role');
            }
        } catch (error) {
            socket.emit('error_message', { message: `Registration failed: ${error.message}` });
        }
    });

    // Handle room joining
    socket.on('join_room', async ({ userId, astrologerId, role }, callback) => {
        try {
            if (!userId || !astrologerId || !role) {
                throw new Error('Missing required parameters');
            }

            console.log("Join room userId, astrologerId, role", userId, astrologerId, role);

            const room = `${userId}_${astrologerId}`;
            socket.join(room);

            roomMemberships.set(socket.id, {
                userId,
                astrologerId,
                role,
                room,
                providerConnected: false
            });

            // Moved chat start logic from 'message' to here for user role
            if (role === 'user') {
                console.log("Hey I Am User ", astrologerId);
                console.log("Hey I Am providerConnections ", providerConnections);
                const providerSocketId = providerConnections.get(astrologerId);
                console.log("Hey I Am providerSocketId ", providerSocketId);
                await changeAvailableStatus(room, true);

                // Start chat session when user joins - moved from message handler
                const result = await chatStart(userId, astrologerId);
                if (!result.success) {
                    throw new Error(result.message);
                }

                // Store original start time in our map
                roomChatInfo.set(room, {
                    originalStartTime: new Date(),
                    userId,
                    astrologerId
                });

                // Emit remaining chat time to the user
                socket.emit('time_out', {
                    time: result.data.chatTimingRemaining
                });

                // Set timer for provider connection timeout
                const timer = setTimeout(async () => {
                    const connectedSockets = await io.in(room).fetchSockets();
                    const providerConnected = connectedSockets.some(s => {
                        const member = roomMemberships.get(s.id);
                        return member?.role === 'provider';
                    });

                    if (!providerConnected) {
                        const userSocket = connectedSockets.find(s => {
                            const member = roomMemberships.get(s.id);
                            return member?.role === 'user';
                        });

                        if (userSocket) {
                            io.to(userSocket.id).emit('timeout_disconnect', {
                                message: 'Provider did not connect. Chat ended.'
                            });
                        }
                    }
                }, TIMEOUT_DURATION);

                activeTimers.set(room, timer);
                console.log("providerSocketId", providerSocketId)

                // Notify provider if they're connected
                if (providerSocketId) {
                    io.to(providerSocketId).emit('user_connected_notification', {
                        userId,
                        message: 'A user has joined your chat!',
                        status: true
                    });
                }
            }

            if (role === 'provider') {
                const result = await chatStartFromProvider(userId, astrologerId);

                if (!result.success) {
                    throw new Error(result.message);
                }

                const findProvider = roomMemberships.get(socket.id);
                findProvider.providerConnected = true;
                roomMemberships.set(socket.id, findProvider);
                console.log("Hey i am set provider connected", findProvider);

                await update_profile_status(astrologerId, true);

                // Check if both user and provider are now connected
                const userConnected = Array.from(roomMemberships.values()).some(
                    member => member.room === room && member.role === 'user'
                );

                if (userConnected) {
                    // Both are now connected - store the actual chat start timestamp
                    chatStartTimestamps.set(room, new Date());
                    console.log(`Both user and provider connected in room ${room}. Starting actual chat timing.`);

                    // Notify room that actual chat has begun
                    io.in(room).emit('chat_officially_started', {
                        room,
                        startTime: chatStartTimestamps.get(room)
                    });
                }

                socket.to(room).emit('provider_connected', { room });
            }

            socket.to(room).emit('user_status', {
                userId,
                astrologerId,
                status: 'online'
            });

            // Initialize inactivity timer when a user/provider joins the room
            setupInactivityTimer(room);

            socket.emit('room_joined', {
                message: 'Welcome back. Start chat',
                room
            });

            if (callback) {
                callback({ success: true, message: 'Welcome back. Start chat' });
            }
        } catch (error) {
            socket.emit('error_message', { message: error.message });

            if (callback) {
                callback({ success: false, message: error.message });
            }
        }
    });

    // Handle room joining for group chat
    socket.on("join_manual_room", async ({ userId, astrologerId, role, room }, callback) => {
        try {
            if (!userId || !astrologerId || !role || !room) {
                throw new Error("Missing required parameters")
            }

            console.log("Joining group room:", { userId, astrologerId, role, room })

            socket.join(room)

            // Store room membership
            roomMemberships.set(socket.id, {
                userId,
                astrologerId,
                role,
                room,
                providerConnected: role === "provider",
            })

            // Mark provider online if provider joins
            if (role === "provider") {
                await update_profile_status(astrologerId, true)
            }

            // Emit user status to other members in the room
            socket.to(room).emit("user_status", {
                userId,
                astrologerId,
                status: "online",
                role,
            })

            // Notify joining client
            socket.emit("room_joined", {
                message: "Joined group room successfully.",
                room,
            })

            if (callback) {
                callback({ success: true, message: "Joined group room successfully." })
            }
        } catch (error) {
            console.error("Join group room error:", error.message)
            socket.emit("error_message", { message: error.message })
            if (callback) {
                callback({ success: false, message: error.message })
            }
        }
    })


    // Function to setup or reset the inactivity timer
    function setupInactivityTimer(room) {
        // Clear any existing inactivity timer for this room
        if (inactivityTimers.has(room)) {
            clearTimeout(inactivityTimers.get(room));
        }

        // Set a new inactivity timer - 1 minute
        const inactivityTimer = setTimeout(async () => {
            console.log(`No activity in room ${room} for 1 minute`);

            // Send inactivity notification to all users in the room
            io.in(room).emit('inactivity_notice', {
                message: 'There has been no activity in this chat for 1 minute. Please continue your conversation or the chat may end soon.'
            });

        }, 60000); // 1 minute in milliseconds

        inactivityTimers.set(room, inactivityTimer);
    }

    // Handle group chat messages with enhanced sender info
    socket.on("manual_message", async ({ room, message, senderId, senderName, senderRole, timestamp, role, replyTo }) => {
        try {
            if (!room || !message || !senderId || !role) {
                throw new Error("Missing required parameters")
            }

            console.log(`Group message received in room ${room} from ${senderId}:`, message)
            if (replyTo) {
                console.log("Reply data:", replyTo)
            }

            // Check for prohibited content
            if (PROHIBITED_PATTERNS.some((pattern) => pattern.test(message))) {
                socket.emit("wrong_message", {
                    message: "Your message contains prohibited content.",
                })
                return
            }

            // Create message object with enhanced sender info and reply support
            const messageData = {
                sender: senderId,
                text: message,
                senderName: senderName, // Store sender name
                senderRole: senderRole, // Store sender role
                timestamp: timestamp || new Date().toISOString(),
            }

            // Add reply data if present
            if (replyTo) {
                messageData.replyTo = {
                    messageId: replyTo.messageId,
                    text: replyTo.text,
                    senderName: replyTo.senderName,
                    senderRole: replyTo.senderRole,
                    isFile: replyTo.isFile || false,
                    timestamp: replyTo.timestamp,
                }
            }

            // Save message to GroupChat DB
            await Chat.findOneAndUpdate(
                { _id: room },
                {
                    $push: {
                        messages: messageData,
                    },
                },
                { upsert: true, new: true },
            )

            // Prepare response data with sender info
            const responseData = {
                text: message,
                sender: senderId,
                senderId: senderId,
                senderName: senderName,
                senderRole: senderRole,
                timestamp: timestamp || new Date().toISOString(),
            }

            // Add reply data to response if present
            if (replyTo) {
                responseData.replyTo = messageData.replyTo
            }

            // Emit message to ENTIRE room (including sender)
            io.to(room).emit("return_message", responseData)

            // Optional: Still emit confirmation to sender
            socket.emit("message_sent", {
                success: true,
                text: message,
                timestamp: timestamp || new Date().toISOString(),
            })
        } catch (error) {
            console.error("Group message error:", error.message)
            socket.emit("error_message", { message: `Message failed: ${error.message}` })
        }
    })

    // Handle chat messages
    socket.on('message', async ({ room, message, senderId, timestamp, role }) => {
        try {
            if (!room || !message || !senderId || !role) {
                throw new Error('Missing required parameters');
            }
            let roomData = roomMemberships.get(socket.id);

            console.log("Trying to get roomData by socket.id:", socket.id);
            if (roomData && roomData.astrologerId) {
                console.log("Result:", roomData.astrologerId);
                await update_profile_status(roomData.astrologerId, true);
            }

            if (!roomData) {
                console.log("roomData not found by socket.id. Trying fallback search using astrologerId...");

                for (let [key, data] of roomMemberships) {
                    console.log(`Checking entry: key = ${key}, data =`, data);
                    if (data.astrologerId === senderId && data.room === room) {
                        roomData = data;
                        console.log("Match found via astrologerId fallback:", roomData);
                        break;
                    }
                }

                if (!roomData) {
                    console.error("No roomData found for senderId:", senderId, "and room:", room);
                    throw new Error('User not properly registered in roomMemberships');
                }
            }

            if (PROHIBITED_PATTERNS.some(pattern => pattern.test(message))) {
                socket.emit('wrong_message', {
                    message: 'Your message contains prohibited content.'
                });
                return;
            }

            // Reset inactivity timer whenever a message is sent
            setupInactivityTimer(room);

            // Save message to database
            await Chat.findOneAndUpdate(
                { room },
                {
                    $push: {
                        messages: {
                            sender: senderId,
                            text: message,
                            timestamp: timestamp || new Date().toISOString()
                        }
                    }
                },
                { upsert: true, new: true }
            );

            // Broadcast message to room
            socket.to(room).emit('return_message', {
                text: message,
                sender: senderId,
                timestamp: timestamp || new Date().toISOString()
            });
        } catch (error) {
            socket.emit('error_message', { message: `Message failed: ${error.message}` });
        }
    });


    // Handle file uploads
    socket.on('file_upload', async ({ room, fileData, senderId, timestamp }) => {
        try {
            if (!room || !fileData || !senderId) {
                throw new Error('Missing required parameters');
            }

            if (!ALLOWED_FILE_TYPES.includes(fileData.type)) {
                throw new Error('Invalid file type');
            }

            if (Buffer.byteLength(fileData.content, 'base64') > MAX_FILE_SIZE) {
                throw new Error('File size exceeds maximum allowed');
            }

            await Chat.findOneAndUpdate(
                { room },
                {
                    $push: {
                        messages: {
                            sender: senderId,
                            file: fileData,
                            timestamp: timestamp || new Date().toISOString()
                        }
                    }
                },
                { upsert: true, new: true }
            );

            socket.to(room).emit('return_message', {
                text: 'Attachment received',
                file: fileData,
                sender: senderId,
                timestamp: timestamp || new Date().toISOString()
            });
        } catch (error) {
            socket.emit('file_upload_error', { error: error.message });
        }
    });

    // Handle file upload for group chat with enhanced sender info and reply support
    socket.on("manual_file_upload", async ({ room, fileData, senderId, senderName, senderRole, timestamp, replyTo }) => {
        try {
            if (!room || !fileData || !senderId) {
                throw new Error("Missing required parameters for file upload")
            }

            console.log(`File upload received in room ${room} from ${senderId}:`, fileData.name)
            if (replyTo) {
                console.log("File reply data:", replyTo)
            }

            // Validate file data
            if (!fileData.content || !fileData.name || !fileData.type) {
                throw new Error("Invalid file data")
            }

            // Check file type (only images allowed)
            if (!fileData.type.startsWith("image/")) {
                socket.emit("file_upload_error", {
                    error: "Only image files are allowed",
                })
                return
            }

            // Create file message object with enhanced sender info and reply support
            const fileMessage = {
                sender: senderId,
                file: {
                    name: fileData.name,
                    type: fileData.type,
                    content: fileData.content,
                },
                senderName: senderName, // Store sender name
                senderRole: senderRole, // Store sender role
                timestamp: timestamp || new Date().toISOString(),
            }

            // Add reply data if present
            if (replyTo) {
                fileMessage.replyTo = {
                    messageId: replyTo.messageId,
                    text: replyTo.text,
                    senderName: replyTo.senderName,
                    senderRole: replyTo.senderRole,
                    isFile: replyTo.isFile || false,
                    timestamp: replyTo.timestamp,
                }
            }

            // Save file message to GroupChat DB
            await Chat.findOneAndUpdate(
                { _id: room },
                {
                    $push: {
                        messages: fileMessage,
                    },
                },
                { upsert: true, new: true },
            )

            // Prepare response data with sender info
            const responseData = {
                file: {
                    name: fileData.name,
                    type: fileData.type,
                    content: fileData.content,
                },
                sender: senderId,
                senderId: senderId,
                senderName: senderName,
                senderRole: senderRole,
                timestamp: timestamp || new Date().toISOString(),
            }

            // Add reply data to response if present
            if (replyTo) {
                responseData.replyTo = fileMessage.replyTo
            }

            // Broadcast file to ENTIRE room (including sender)
            io.to(room).emit("return_message", responseData)

            // Emit success confirmation to sender
            socket.emit("file_upload_success", {
                message: "File uploaded successfully",
                fileName: fileData.name,
            })

            console.log(`File ${fileData.name} successfully uploaded and broadcasted to room ${room}`)
        } catch (error) {
            console.error("File upload error:", error.message)
            socket.emit("file_upload_error", {
                error: `File upload failed: ${error.message}`,
            })
        }
    })

    // Optional: Handle file download requests
    socket.on("request_file_download", async ({ room, messageId, senderId }) => {
        try {
            // Find the chat and specific message
            const chat = await Chat.findById(room)
            if (!chat) {
                throw new Error("Chat not found")
            }

            const message = chat.messages.id(messageId)
            if (!message || !message.file) {
                throw new Error("File not found")
            }

            // Send file data back to requester
            socket.emit("file_download_response", {
                file: message.file,
                messageId: messageId
            })

        } catch (error) {
            console.error("File download error:", error.message)
            socket.emit("file_download_error", {
                error: error.message
            })
        }
    })

    // Add event handler for when provider connects later
    socket.on('provider_connected', ({ room }) => {
        try {
            if (!room) {
                throw new Error('Room identifier missing');
            }

            const timer = activeTimers.get(room);
            if (timer) {
                clearTimeout(timer);
                activeTimers.delete(room);
            }

            // Check if user is already connected in this room
            const userConnected = Array.from(roomMemberships.values()).some(
                member => member.room === room && member.role === 'user'
            );

            if (userConnected) {
                // Both are now connected - store the actual chat start timestamp
                chatStartTimestamps.set(room, new Date());
                console.log(`Provider joined and user already present in room ${room}. Starting actual chat timing.`);

                // Notify room that actual chat has begun
                io.in(room).emit('chat_officially_started', {
                    room,
                    startTime: chatStartTimestamps.get(room)
                });
            }

            const roomSocketIds = Array.from(socket.adapter.rooms.get(room) || []);
            for (const socketId of roomSocketIds) {
                const memberData = roomMemberships.get(socketId);
                if (memberData && memberData.role === 'user') {
                    memberData.providerConnected = true;
                    providerHasConnected = true;
                }
            }
        } catch (error) {
            socket.emit('error_message', { message: error.message });
        }
    });

    // On server side
    socket.on('end_chat', async (data) => {
        const { userId, astrologerId, role, room } = data;
        console.log("all chat end", userId, astrologerId, role, room)

        try {
            // Clean up as in the disconnect handler
            const timer = activeTimers.get(room);
            if (timer) {
                clearTimeout(timer);
                activeTimers.delete(room);
            }

            // Notify others in the room
            socket.to(room).emit('user_status', {
                userId,
                astrologerId,
                status: 'offline'
            });

            console.log("role hitesh", role)
            console.log("providerHasConnected hitesh", providerHasConnected)

            // Role-specific handling
            if (role === 'provider') {
                await update_profile_status(astrologerId, false);

                await changeAvailableStatus(room, false);

                // Notify user that provider has left
                socket.to(room).emit('provider_disconnected', {
                    message: 'The provider has ended the chat.'
                });


                // End chat if provider was connected
                if (providerHasConnected) {
                    console.log("provider deduct", providerHasConnected)
                    try {
                        // Get the actual timing info to pass to chatEnd
                        const actualStartTime = chatStartTimestamps.get(room);
                        const response = await chatEnd(userId, astrologerId, actualStartTime);
                        if (response.success) {
                            providerHasConnected = false;
                            // Clean up stored timestamps
                            chatStartTimestamps.delete(room);
                            roomChatInfo.delete(room);
                        }
                    } catch (error) {
                        console.error('Error ending chat:', error);
                    }
                }
            } else if (role === 'user') {
                await update_profile_status(astrologerId, false);

                await changeAvailableStatus(room, false);
                const providerSocketId = providerConnections.get(astrologerId);
                console.log("Hey I Am providerSocketId ", providerSocketId)
                if (providerSocketId) {
                    const findRoom = roomMemberships.get(socket.id);
                    const roomId = findRoom.room;
                    io.to(providerSocketId).emit('user_connected_notification', {
                        userId,
                        message: 'A user has leaved your chat!',
                        status: false
                    });
                }
                // Notify provider that user has left
                socket.to(room).emit('user_left_chat', {
                    userId,
                    message: 'User has ended the chat.',
                    status: false
                });

                // End chat if provider was connected
                if (providerHasConnected) {
                    console.log("user deduct", providerHasConnected)
                    try {
                        // Get the actual timing info to pass to chatEnd
                        const actualStartTime = chatStartTimestamps.get(room);
                        const response = await chatEnd(userId, astrologerId, actualStartTime);
                        if (response.success) {
                            providerHasConnected = false;
                            // Clean up stored timestamps
                            chatStartTimestamps.delete(room);
                            roomChatInfo.delete(room);
                        }
                    } catch (error) {
                        console.error('Error ending chat:', error);
                    }
                }
            }

            // Leave the room
            socket.leave(room);

            // Remove from room memberships
            roomMemberships.delete(socket.id);

            // Send acknowledgment
            socket.emit('chat_ended', { success: true });
        } catch (error) {
            console.error('Error handling end_chat:', error);
            socket.emit('chat_ended', { success: false, message: 'Error ending chat' });
        }
    });

    // Handle chat end
    socket.on("manual_end_chat", async ({ userId, astrologerId, role, room }) => {
        try {
            if (!userId || !astrologerId || !role || !room) {
                throw new Error("Missing required parameters")
            }

            console.log("Ending group chat for:", { userId, astrologerId, role, room })

            // Clear any active timer
            const timer = activeTimers.get(room)
            if (timer) {
                clearTimeout(timer)
                activeTimers.delete(room)
            }

            // Notify other participants in room
            socket.to(room).emit("user_status", {
                userId,
                astrologerId,
                status: "offline",
                role,
            })

            if (role === "provider") {
                // Inform group that provider left
                socket.to(room).emit("provider_disconnected", {
                    message: `Provider ${astrologerId} has left the group chat.`,
                    providerId: astrologerId,
                })
            } else if (role === "user") {
                // Inform providers that user left
                socket.to(room).emit("user_left_chat", {
                    userId,
                    message: "The user has ended the group chat.",
                    status: false,
                })
            }

            // Leave and clean up
            socket.leave(room)
            roomMemberships.delete(socket.id)

            socket.emit("chat_ended", { success: true })
        } catch (error) {
            console.error("Error ending group chat:", error.message)
            socket.emit("chat_ended", { success: false, message: error.message })
        }
    })


    // Handle disconnections
    socket.on('disconnect', async () => {
        try {
            // Clean up user connections
            for (const [userId, socketId] of userConnections.entries()) {
                if (socketId === socket.id) {
                    userConnections.delete(userId);
                }
            }

            // Clean up provider connections
            for (const [providerId, socketId] of providerConnections.entries()) {
                if (socketId === socket.id) {
                    providerConnections.delete(providerId);
                }
            }

            // Handle room-related cleanup
            const roomData = roomMemberships.get(socket.id);
            if (!roomData) return;

            const { userId, astrologerId, room, role } = roomData;

            // Clear any active timers
            const timer = activeTimers.get(room);
            if (timer) {
                clearTimeout(timer);
                activeTimers.delete(room);
            }

            // Remove from room memberships
            roomMemberships.delete(socket.id);

            console.log("socket.adapter.rooms.get(room)", socket.adapter.rooms.get(room))

            // Check remaining connections
            const roomSocketIds = Array.from(socket.adapter.rooms.get(room) || []);
            console.log("roomSocketIds", roomSocketIds)
            const hasUserSocket = roomSocketIds.some(id => {
                const member = roomMemberships.get(id);
                return member?.role === 'user';
            });

            const hasProviderSocket = roomSocketIds.some(id => {
                const member = roomMemberships.get(id);
                return member?.role === 'provider';
            });

            console.log("hasProviderSocket", hasProviderSocket)
            console.log("hasUserSocket", hasUserSocket)

            // Handle provider disconnection
            if (role === 'provider') {
                providerHasConnected = true;
                await update_profile_status(astrologerId, false);
                await changeAvailableStatus(room, false);

                if (hasUserSocket) {
                    const userSocketId = roomSocketIds.find(id => {
                        const member = roomMemberships.get(id);
                        return member?.role === 'user';
                    });

                    if (userSocketId) {
                        io.to(userSocketId).emit('provider_disconnected', {
                            message: 'The provider has left the chat.'
                        });
                    }
                }
            }
            // Handle user disconnection
            else if (role === 'user') {
                await update_profile_status(astrologerId, false);
                await changeAvailableStatus(room, false);
                if (hasProviderSocket) {
                    const providerSocketId = roomSocketIds.find(id => {
                        const member = roomMemberships.get(id);
                        return member?.role === 'provider';
                    });
                    console.log("hasProviderSocket ", hasProviderSocket)
                    console.log("providerSocketId", providerSocketId)

                    if (providerSocketId) {
                        io.to(providerSocketId).emit('user_left_chat', {
                            userId,
                            message: 'User has left the chat.',
                            status: false
                        });
                    }
                }

                // End chat if provider connected during session
                if (roomData.providerConnected || providerHasConnected) {
                    try {
                        // Get the actual timing info to pass to chatEnd
                        const actualStartTime = chatStartTimestamps.get(room);
                        const response = await chatEnd(userId, astrologerId, actualStartTime);
                        if (response.success) {
                            providerHasConnected = false;
                            // Clean up stored timestamps
                            chatStartTimestamps.delete(room);
                            roomChatInfo.delete(room);
                        }
                    } catch (error) {
                        console.log("Graceful handling of disconnect errors", error)
                        // Graceful handling of disconnect errors
                    }
                }
            }

            // Notify others about status change
            socket.to(room).emit('user_status', {
                userId,
                astrologerId,
                status: 'offline'
            });
        } catch (error) {
            // Can't send to disconnected client
            console.log("Internale server error", error)
        }
    });
});

// Location API endpoint
app.post('/Fetch-Current-Location', async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: "Latitude and longitude are required",
        });
    }

    try {
        if (!process.env.GOOGLE_MAP_KEY) {
            return res.status(403).json({
                success: false,
                message: "API Key is not found"
            });
        }

        const addressResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAP_KEY}`
        );

        if (addressResponse.data.results.length > 0) {
            const addressComponents = addressResponse.data.results[0].address_components;

            let city = null;
            let area = null;
            let postalCode = null;
            let district = null;

            addressComponents.forEach(component => {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                } else if (component.types.includes('sublocality_level_1')) {
                    area = component.long_name;
                } else if (component.types.includes('postal_code')) {
                    postalCode = component.long_name;
                } else if (component.types.includes('administrative_area_level_3')) {
                    district = component.long_name;
                }
            });

            const addressDetails = {
                completeAddress: addressResponse.data.results[0].formatted_address,
                city: city,
                area: area,
                district: district,
                postalCode: postalCode,
                landmark: null,
                lat: addressResponse.data.results[0].geometry.location.lat,
                lng: addressResponse.data.results[0].geometry.location.lng,
            };

            return res.status(200).json({
                success: true,
                data: {
                    location: { lat, lng },
                    address: addressDetails,
                },
                message: "Location fetch successful"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No address found for the given location",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch address",
        });
    }
});

// Routes
app.use('/api/v1', limiter, router);

app.get('/', (req, res) => {
    res.send('Welcome To Help U Build');
});

// Start server
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});