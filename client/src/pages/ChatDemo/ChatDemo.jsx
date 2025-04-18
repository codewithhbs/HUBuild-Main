import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import './chat.css';
import { MdAttachment } from "react-icons/md";
import ScrollToBottom from 'react-scroll-to-bottom';
import axios from 'axios';
import { GetData } from '../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import AccessDenied from '../../components/AccessDenied/AccessDenied';
import { useSocket } from '../../context/SocketContext';
import { useNavigate, useLocation } from "react-router-dom";

const ENDPOINT = 'https://api.helpubuild.co.in/';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB file size limit

const ChatDemo = () => {
    // State Management
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socketId, setSocketId] = useState('');
    const [astroId, setAstroId] = useState('');
    const [isChatBoxActive, setIsChatBoxActive] = useState(false);
    const [isProviderConnected, setIsProviderConnected] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('offline');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedProviderId, setSelectedProviderId] = useState(null);
    const [isChatStarted, setIsChatStarted] = useState(false);
    const [isAbleToJoinChat, setIsAbleToJoinChat] = useState(false);
    const [allProviderChat, setProviderChat] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRoomId, setEsRoomId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [isChatOnGoing, setIsChatOnGoing] = useState(false); // toggle to test
    const [showPrompt, setShowPrompt] = useState(false);
    const [nextPath, setNextPath] = useState(null);
    const [isUserConfirming, setIsUserConfirming] = useState(false);
    // console.log("socketId".socketId)

    // User data from session storage
    const userData = useMemo(() => {
        const data = GetData('user');
        return data ? JSON.parse(data) : null;
    }, []);

    const id = userData?._id || '';
    const role = userData?.role || '';

    const socket = useSocket();

    useEffect(() => {
        // console.log("id id",isRoomId)
        const res = async () => {
            try {
                const { data } = await axios.get(`${ENDPOINT}api/v1/get-chat-by-id/${isRoomId}`);
                const chatData = data.data;
                console.log("chatData", chatData)
                setIsAbleToJoinChat(chatData.isChatStarted);
            } catch (error) {
                console.log("Internal server error", error)
            }
        }
        res();
    }, [isRoomId])

    // Fetch chat history
    const fetchChatHistory = useCallback(async () => {
        if (!userData) {
            toast.error("Please login first");
            return;
        }

        try {
            const url = userData?.role === "provider"
                ? `${ENDPOINT}api/v1/get-chat-by-providerId/${userData._id}`
                : `${ENDPOINT}api/v1/get-chat-by-userId/${userData._id}`;

            const { data } = await axios.get(url);
            setProviderChat(data.data.reverse()); // Show latest chats first
        } catch (error) {
            toast.error("Failed to load chat history");
        }
    }, [userData]);

    useEffect(() => {
        fetchChatHistory();
    }, [fetchChatHistory]);

    // Handle selecting a chat from the sidebar
    const handleChatStart = useCallback(async (chatId) => {
        if (!chatId) return;

        try {
            const { data } = await axios.get(`${ENDPOINT}api/v1/get-chat-by-id/${chatId}`);
            const chatData = data.data;

            if (!chatData) {
                toast.error("Chat not found");
                return;
            }

            const userId = chatData?.userId?._id;
            const providerId = chatData?.providerId?._id;

            setMessages(chatData.messages || []);
            setSelectedUserId(userId);
            setSelectedProviderId(providerId);
            setIsChatBoxActive(true);

            if (userData?.role === 'provider') {
                setAstroId(userId);
            } else {
                setAstroId(providerId);
            }
        } catch (error) {
            toast.error("Failed to load chat details");
        }
    }, [userData]);

    useEffect(() => {
        if (selectedUserId || selectedProviderId) {
            const room = `${selectedUserId}_${selectedProviderId}`;
            setEsRoomId(room)
        }
    }, [selectedUserId, selectedProviderId])
    const handleStartChat = useCallback(() => {
        if (!selectedUserId || !selectedProviderId) {
            toast.error("Chat information is missing");
            return;
        }



        const room = `${selectedUserId}_${selectedProviderId}`;
        if (room) {

            setEsRoomId(room)
        } else {
            toast.error("Chat information is missing");
        }

        if (userData?.role === 'provider') {
            socket.emit('join_room', {
                userId: selectedUserId,
                astrologerId: selectedProviderId,
                role: "provider"
            });
            socket.emit('provider_connected', { room });
            setIsChatOnGoing(true)
            setIsChatStarted(true);
        } else {
            socket.emit('join_room', {
                userId: selectedUserId,
                astrologerId: selectedProviderId,
                role: userData.role
            }, (response) => {
                if (response?.success) {
                    setIsChatBoxActive(true);
                    setIsActive(response.status);
                    setIsChatStarted(true);
                    toast.success(response.message);
                    setIsChatOnGoing(true)
                } else {
                    toast.error(response?.message || "Failed to join chat");
                }
            });
        }
    }, [selectedUserId, selectedProviderId, userData, socket]);


    const endChat = useCallback(() => {


        try {
            // Emit event to notify server about intentional chat ending
            // This matches what the server is expecting based on the disconnect handler
            socket.emit('end_chat', {
                userId: selectedUserId,
                astrologerId: selectedProviderId,
                role: userData?.role,
                room: userData?.role === 'provider'
                    ? `${selectedUserId}_${selectedProviderId}`
                    : `${selectedUserId}_${selectedProviderId}`
            });

            // Update local state
            setIsChatStarted(false);
            setIsChatBoxActive(false);
            setIsActive(false);
            setIsChatOnGoing(false)

            // Notify user
            // toast.success('Chat ended successfully');

            // Optionally, you could reload chat history to show updated status
            fetchChatHistory();
        } catch (error) {
            toast.error('Failed to end chat properly');
            console.error('Error ending chat:', error);
        }
    }, [socket, selectedUserId, selectedProviderId, userData, fetchChatHistory]);

    // 🧠 Handle internal navigation (<Link>, navigate())
    useEffect(() => {
        const handleClick = (e) => {
            if (!isChatOnGoing) return;

            const link = e.target.closest("a");
            if (link && link.href && !link.target) {
                const url = new URL(link.href);
                if (url.pathname !== window.location.pathname) {
                    e.preventDefault();
                    const fullPath = url.pathname + url.search + url.hash; // ✅ NEW
                    setNextPath(fullPath);
                    setShowPrompt(true);
                }
            }
        };

        document.body.addEventListener("click", handleClick);
        return () => document.body.removeEventListener("click", handleClick);
    }, [isChatOnGoing]);

    // 🧠 Intercept programmatic navigation
    useEffect(() => {
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        function intercept(method) {
            return function (...args) {
                if (!isChatOnGoing) {
                    return method.apply(window.history, args);
                }

                const nextUrl = args[2];
                if (nextUrl !== window.location.pathname) {
                    const url = new URL(nextUrl, window.location.origin);
                    const fullPath = url.pathname + url.search + url.hash;
                    setNextPath(fullPath);
                    setShowPrompt(true);
                } else {
                    method.apply(window.history, args);
                }
            };
        }

        window.history.pushState = intercept(originalPushState);
        window.history.replaceState = intercept(originalReplaceState);

        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
        };
    }, [isChatOnGoing]);

    // 🧠 Block browser refresh, tab close, or back/forward buttons
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isChatOnGoing && !isUserConfirming) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isChatOnGoing, isUserConfirming]);

    // ✅ Proceed with navigation
    const confirmNavigation = async () => {
        setIsUserConfirming(true); // so reload isn’t blocked
        await endChat();
        setShowPrompt(false);

        if (nextPath) {
            navigate(nextPath, { replace: true });
            setNextPath(null);
        } else {
            window.location.reload();
        }
    };

    // ❌ Cancel action
    const cancelNavigation = () => {
        setNextPath(null);
        setShowPrompt(false);
    };

    // Socket event listeners
    useEffect(() => {
        // socket.connect();

        socket.on('connect', () => {
            setSocketId(socket.id);
            socket.emit('send_socket_id', {
                socketId: socket.id,
                role: userData?.role,
                userId: id
            });
        });

        socket.on('return_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on('user_status', ({ userId, astrologerId, status }) => {
            setStatus(status);
        });

        socket.on('error_message', (data) => {
            toast.error(data.message);
            setIsChatBoxActive(false);
        });

        socket.on('wrong_message', (data) => {
            toast.error(data.message);
        });

        socket.on('provider_connected', ({ room }) => {
            setIsProviderConnected(true);
            toast.success('Provider has connected');
        });

        socket.on('one_min_notice', (data) => {
            toast.success(data.message);
        });

        socket.on('time_out', (data) => {
            setTimeLeft(data.time);
        });

        socket.on('user_connected_notification', ({ userId, message, status }) => {
            if (userData?._id !== userId) {
                setIsAbleToJoinChat(status);
            }
            toast.success(message);
        });

        socket.on('user_left_chat', ({ userId, message, status }) => {
            console.log("status", status)
            setIsAbleToJoinChat(status);
            setIsChatStarted(status);
            toast.success(message);
        });

        socket.on('timeout_disconnect', (data) => {
            toast.success(data.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        });

        socket.on('chat_ended', (data) => {
            if (data.success) {
                setIsChatStarted(false);
                setIsChatBoxActive(false);
                setIsActive(false);
                toast.success('Chat ended successfully');
            } else {
                toast.error(data.message || 'Error ending chat');
            }
        });

        socket.on('provider_disconnected', (data) => {
            toast.success(data.message);
            setIsProviderConnected(false);
            setIsChatStarted(false);
        });

        return () => {
            socket.off('connect');
            socket.off('return_message');
            socket.off('error_message');
            socket.off('wrong_message');
            socket.off('provider_connected');
            socket.off('one_min_notice');
            socket.off('time_out');
            socket.off('user_connected_notification');
            socket.off('user_left_chat');
            socket.off('timeout_disconnect');
            socket.off('chat_ended');
            socket.off('provider_disconnected');
            // socket.disconnect();
        };
    }, [id, socket, userData]);

    // Handle chat timeout
    useEffect(() => {
        if (timeLeft > 0) {
            const timeout = timeLeft * 60000; // Convert minutes to milliseconds
            const disconnectTimeout = setTimeout(() => {
                socket.disconnect();
                toast.error('Your chat has ended. Please recharge your wallet to continue.');
                setIsChatStarted(false);
                setIsChatBoxActive(false);
            }, timeout);

            return () => clearTimeout(disconnectTimeout);
        }
    }, [timeLeft, socket]);

    // Content validation for messages
    const validateMessageContent = useCallback((messageText) => {
        if (!messageText || typeof messageText !== 'string' || messageText.trim() === '') {
            return false;
        }

        // Prohibited patterns
        const prohibitedPatterns = [
            /\b\d{10}\b/,         // Phone number pattern
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email pattern
            /18\+|\bsex\b|\bxxx\b|\bcall\b|\bphone\b|\bmobile|\bteliphone\b|\bnudes\b|\bporn\b|\bsex\scall\b|\btext\b|\bwhatsapp\b|\bskype\b|\btelegram\b|\bfacetime\b|\bvideo\schat\b|\bdial\snumber\b|\bmessage\b/i, // Keywords related to 18+ content and phone connections
        ];

        return !prohibitedPatterns.some(pattern => pattern.test(messageText));
    }, []);

    // Handle file upload
    const handleFileChange = useCallback((event) => {
        if (!isChatStarted) {
            toast.error("Please start the chat first");
            event.target.value = '';
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size should not exceed 5MB');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    content: reader.result
                };

                const room = userData?.role === 'provider'
                    ? `${astroId}_${userData._id}`
                    : `${userData._id}_${astroId}`;

                socket.emit('file_upload', {
                    room,
                    fileData,
                    senderId: userData._id,
                    timestamp: new Date().toISOString()
                });

                setMessages((prev) => [
                    ...prev,
                    {
                        text: file.name,
                        file: fileData,
                        sender: userData._id,
                        timestamp: new Date().toISOString(),
                    },
                ]);
            } catch (error) {
                toast.error('Failed to process file');
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
        };

        reader.readAsDataURL(file);
        event.target.value = '';
    }, [isChatStarted, userData, astroId, socket]);

    // Send message
    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!isChatStarted) {
            toast.error("Please start the chat first");
            return;
        }

        const trimmedMessage = message && typeof message === 'string' ? message.trim() : '';

        if (!trimmedMessage) {
            toast.error('Please enter a message');
            return;
        }

        if (!validateMessageContent(trimmedMessage)) {
            toast.error('Your message contains prohibited content (phone numbers, emails, or 18+ content)');
            return;
        }

        try {
            const room = userData?.role === 'provider'
                ? `${astroId}_${userData._id}`
                : `${userData._id}_${astroId}`;

            const payload = {
                room,
                message: trimmedMessage,
                senderId: userData._id,
                timestamp: new Date().toISOString(),
                role: userData.role
            };

            socket.emit('message', payload);

            setMessages((prev) => [
                ...prev,
                {
                    text: trimmedMessage,
                    sender: userData._id,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        }
    }, [message, isChatStarted, userData, astroId, socket, validateMessageContent]);

    // Filter chats based on search term
    const filteredChats = useMemo(() => {
        return allProviderChat.filter(chat => {
            const name = userData?.role === "provider"
                ? chat?.userId?.name
                : chat?.providerId?.name;

            return name?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [allProviderChat, userData, searchTerm]);

    // If no user data, show access denied
    if (!userData) {
        return <AccessDenied />;
    }

    return (
        <section className='hitesh_styling' style={{ backgroundColor: '#CDC4F9' }}>
            <div className="container py-5">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card" style={{ borderRadius: '15px' }}>
                            <div className="card-body">
                                <div className="row">
                                    {/* Sidebar with Chat List */}
                                    <div className="col-md-4 mb-4">
                                        <div className="p-3">
                                            <div className="heading-chat-list w-100 mb-2">
                                                <h3 className="p-1 m-0">
                                                    {userData?.role === "provider" ? "Clients" : "Consultants"}
                                                </h3>
                                            </div>
                                            <div className="input-group rounded mb-3">
                                                <input
                                                    type="search"
                                                    className="form-control rounded"
                                                    placeholder="Search"
                                                    aria-label="Search"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <span className="input-group-text border-0">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                            </div>
                                            <ul className="list-unstyled connection-list mb-0">
                                                {filteredChats.length > 0 ? (
                                                    filteredChats.map((chat, index) => (
                                                        <li
                                                            onClick={() => handleChatStart(chat._id)}
                                                            key={chat._id || index}
                                                            className="p-2 border-bottom"
                                                        >
                                                            <div className="d-flex flex-row">
                                                                <div style={{ display: "flex" }} className="flex-row cursor-pointer w-100 justify-content-between">
                                                                    <div className="profile_img_box">
                                                                        {userData?.role === "provider" ? (
                                                                            <img
                                                                                src={chat?.userId?.ProfileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.userId?.name || "User")}&background=random`}
                                                                                alt={chat?.userId?.name || "User"}
                                                                                className="align-self-center"
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={chat?.providerId?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.providerId?.name || "User")}&background=random`}
                                                                                alt={chat?.providerId?.name || "Provider"}
                                                                                className="align-self-center"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="pt-1 chat_list">
                                                                        <p className="fw-bold mb-0">
                                                                            {userData?.role === "provider"
                                                                                ? chat?.userId?.name || "User"
                                                                                : chat?.providerId?.name || "Provider"}
                                                                        </p>
                                                                        <p className="recent-chat-message">
                                                                            {chat?.messages?.[chat?.messages.length - 1]?.text ||
                                                                                (chat?.messages?.[chat?.messages.length - 1]?.file
                                                                                    ? 'File Attached'
                                                                                    : 'No messages yet')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="p-2 text-center text-muted">No chats found</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Chat Window */}
                                    {isChatBoxActive ? (
                                        <div className="col-md-8 chat-box">
                                            <div className="chat-head">
                                                <h2>Chats</h2>
                                                {role === 'user' ? (
                                                    isChatStarted ? (
                                                        <a onClick={endChat} className='chatEndBtn'>End Chat</a>
                                                    ) : (
                                                        <a onClick={handleStartChat} className='chatStartBtn'>Start Chat</a>
                                                    )
                                                ) : (
                                                    isAbleToJoinChat && (
                                                        isChatStarted ? (
                                                            <a onClick={endChat} className='chatEndBtn'>End Chat</a>
                                                        ) : (
                                                            <a onClick={handleStartChat} className='chatStartBtn'>Start Chat</a>
                                                        )
                                                    )
                                                )}
                                            </div>
                                            <ScrollToBottom initialScrollBehavior='smooth' className="chat-window">
                                                {messages.length === 0 ? (
                                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                                                        <p className="text-muted">Send a message to start a conversation</p>
                                                    </div>
                                                ) : (
                                                    messages.map((msg, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`d-flex flex-row ${msg.sender === id ? 'justify-content-end' : 'justify-content-start'}`}
                                                        >
                                                            {msg.file ? (
                                                                <p className="small p-2 mb-1 rounded-3 bg-body-tertiary">
                                                                    <a href={msg.file.content} download={msg.file.name}>
                                                                        <img
                                                                            src={msg.file.content}
                                                                            style={{
                                                                                width: '160px',
                                                                                border: '3px solid rgb(204, 204, 204)',
                                                                                height: '150px',
                                                                                borderRadius: '10px',
                                                                            }}
                                                                            alt={msg.file.name}
                                                                        />
                                                                    </a>
                                                                </p>
                                                            ) : (
                                                                <p
                                                                    className={`small p-2 mb-1 forMessageStyling rounded-3 ${msg.sender === id ? 'self-message' : 'bg-light'}`}
                                                                >
                                                                    {msg.text}
                                                                    <div className="forTimeRelated">
                                                                        <span className="messageTimeAbsolute">
                                                                            {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            }) || 'Not-Available'}
                                                                        </span>
                                                                    </div>
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </ScrollToBottom>
                                            <form className="d-flex align-items-center" onSubmit={handleSubmit}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Type message"
                                                    value={message || ''}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    disabled={!isChatStarted}
                                                />
                                                <input
                                                    type="file"
                                                    id="fileUpload"
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                    disabled={!isChatStarted}
                                                    accept="image/*"
                                                />
                                                <label
                                                    htmlFor="fileUpload"
                                                    className="ms-2"
                                                    style={{
                                                        cursor: isChatStarted ? 'pointer' : 'not-allowed',
                                                        opacity: isChatStarted ? 1 : 0.5
                                                    }}
                                                >
                                                    <MdAttachment size={24} />
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={!isChatStarted}
                                                    className="btn btn-primary ms-2"
                                                >
                                                    Send
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className='col-md-8 chat-box'>
                                            <div className='empty-box'>
                                                <div className="message-text">
                                                    <h5>Your messages</h5>
                                                    <p>Select a chat to start the conversation</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPrompt && (
                <div
                    style={{
                        position: "fixed",
                        top: "30%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        padding: "20px",
                        backgroundColor: "#fff",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                        borderRadius: "10px",
                        zIndex: 1000,
                        textAlign: "center",
                    }}
                >
                    <p>Are you sure you want to leave the chat?</p>
                    <button onClick={confirmNavigation} style={{ marginRight: 10 }}>
                        Yes
                    </button>
                    <button onClick={cancelNavigation}>No</button>
                </div>
            )}
        </section>
    );
};

export default ChatDemo;