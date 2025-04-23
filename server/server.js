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
const Chat = require('./models/chatAndPayment.Model');
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
app.use(cors());

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
let providerHasConnected = false;

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

            console.log("Join room userId, astrologerId, role", userId, astrologerId, role)

            const room = `${userId}_${astrologerId}`;
            socket.join(room);

            roomMemberships.set(socket.id, {
                userId,
                astrologerId,
                role,
                room,
                providerConnected: false
            });
            // console.log("Hey i am roomMemberships", roomMemberships)

            if (role === 'provider') {
                const result = await chatStartFromProvider(userId, astrologerId);

                if (!result.success) {
                    throw new Error(result.message);
                }

                const findProvider = roomMemberships.get(socket.id);
                findProvider.providerConnected = true;
                roomMemberships.set(socket.id, findProvider);
                console.log("Hey i am set provider connected", findProvider)
                await update_profile_status(astrologerId);
                socket.to(room).emit('provider_connected', { room });
            }
            console.log("Hey I Am User exit ")
            if (role === 'user') {
                console.log("Hey I Am User ", astrologerId)
                console.log("Hey I Am providerConnections ", providerConnections)
                const providerSocketId = providerConnections.get(astrologerId);
                console.log("Hey I Am providerSocketId ", providerSocketId)
                await changeAvailableStatus(room, true);
                if (providerSocketId) {
                    const findRoom = roomMemberships.get(socket.id);
                    const roomId = findRoom.room;
                    io.to(providerSocketId).emit('user_connected_notification', {
                        userId,
                        message: 'A user has joined your chat!',
                        status: true
                    });
                }
            }

            socket.to(room).emit('user_status', {
                userId,
                astrologerId,
                status: 'online'
            });

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

    // Handle chat messages
    socket.on('message', async ({ room, message, senderId, timestamp, role }) => {
        try {
            if (!room || !message || !senderId || !role) {
                throw new Error('Missing required parameters');
            }
            let roomData = roomMemberships.get(socket.id);

            console.log("Trying to get roomData by socket.id:", socket.id);
            console.log("Result:", roomData);

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

            if (!roomData) {
                throw new Error('User not properly registered');
            }

            if (PROHIBITED_PATTERNS.some(pattern => pattern.test(message))) {
                socket.emit('wrong_message', {
                    message: 'Your message contains prohibited content.'
                });
                return;
            }

            const isFirstMessage = !activeTimers.has(room);

            if (role === 'user' && isFirstMessage) {
                const { userId, astrologerId } = roomData;
                const result = await chatStart(userId, astrologerId);

                if (!result.success) {
                    throw new Error(result.message);
                }

                // socket.emit('one_min_notice', {
                //     message: 'Please wait a minute for the provider to come online.'
                // });

                socket.emit('time_out', {
                    time: result.data.chatTimingRemaining
                });

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
            }

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

    // Handle provider connected event
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
        console.log("role end",role)

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
                await update_profile_status(astrologerId);
                await changeAvailableStatus(room, false);

                // Notify user that provider has left
                socket.to(room).emit('provider_disconnected', {
                    message: 'The provider has ended the chat.'
                });


                // End chat if provider was connected
                if (providerHasConnected) {
                    console.log("provider deduct", providerHasConnected)
                    try {
                        const response = await chatEnd(userId, astrologerId);
                        if (response.success) {
                            providerHasConnected = false;
                        }
                    } catch (error) {
                        console.error('Error ending chat:', error);
                    }
                }
            } else if (role === 'user') {
                await update_profile_status(astrologerId);
                await changeAvailableStatus(room, false);
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
                        const response = await chatEnd(userId, astrologerId);
                        if (response.success) {
                            providerHasConnected = false;
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
                await update_profile_status(astrologerId);

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
                await update_profile_status(astrologerId);
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
                        const response = await chatEnd(userId, astrologerId);
                        if (response.success) {
                            providerHasConnected = false;
                        }
                    } catch (error) {
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
    console.log("server is running")
});