import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import './chat.css';
import { MdAttachment } from "react-icons/md";
import ScrollToBottom from 'react-scroll-to-bottom';
import axios from 'axios';
import { GetData } from '../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import AccessDenied from '../../components/AccessDenied/AccessDenied';
// import Login from '../auth/Login'

const ENDPOINT = 'https://api.helpubuild.co.in/';

const ChatDemo = () => {
    // const [messageReaded,setMessageReaded] = useState(false)
    const [lastMessage, setLastMessage] = useState('')
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socketId, setSocketId] = useState('');
    const [file, setFile] = useState(null);
    const Data = GetData('user')
    const UserData = JSON.parse(Data)
    const [astroId, setAstroId] = useState('')
    const [IsChatBoxActive, setIsChatBoxActive] = useState(false)
    const [isProviderConnected, setIsProviderConnected] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0)
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('offline');
    const [showReviewPopup, setShowReviewPopup] = useState(false);

    // console.log("message",UserData._id)
    const id = UserData?._id || ''

    const socket = useMemo(() => io(ENDPOINT, { autoConnect: false }), []);

    const handleChatStart = async (chatId) => {
        // console.log("chatId", chatId);
        try {
            const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-chat-by-id/${chatId}`);

            setMessage([]);
            const allData = data.data;
            const userId = allData?.userId?._id;
            const providerId = allData?.providerId?._id;
            const allMessageData = allData.messages;
            setMessages(allMessageData);

            if (UserData?.role === 'provider') {
                setAstroId(userId);
            } else {
                setAstroId(providerId);
            }

            // Join the room
            const room = `${userId}_${providerId}`;
            // Join the room
            // const room = `${userId}_${providerId}`;
            if (UserData?.role === 'provider') {
                socket.emit('provider_connected', { room: room });
                console.log('Emitting provider_connected event to room:', room);
            }
            socket.emit('join_room', { userId, astrologerId: providerId, role: UserData.role }, (response) => {
                // Check if socket connection was successful and join room was acknowledged
                if (response.success) {
                    setIsChatBoxActive(true);  // Only activate the chat box after successful response
                    console.log('response:', response);
                    setIsActive(response.status);
                    toast.success(response.message);
                } else {
                    console.error(response.message);  // Log the error message
                }
            });
            // console.log(`Joined room: ${room}`);
        } catch (error) {
            console.error('Error joining room:', error);
        }
    };


    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log('Connected!', socket.id);
            setSocketId(socket.id);
        });

        // Listen for messages and update the state
        socket.on('return_message', (data) => {
            // console.log('Received message:', data);
            setMessages((prev) => [...prev, data]);
        });

        socket.on('user_status', ({ userId, astrologerId, status }) => {
            console.log(`User ${userId} or Provider ${astrologerId} is now ${status}`);
            setStatus(status);
        });

        socket.on('error_message', (data) => {
            // console.log('Received error message:', data.message);
            toast.error(data.message)
            setIsChatBoxActive(false);
        })

        socket.on('wrong_message', (data) => {
            toast.error(data.message)
        })

        // socket.on('timeout_disconnect', (data) => {
        //     toast.success(data.message)
        // })

        // Listen for the 'provider_connected' event from the backend
        socket.on('provider_connected', ({ room }) => {
            // // This will handle the provider's connection
            // console.log(`Provider connected to room: ${room}`);

            // If the provider connects, mark them as connected
            setIsProviderConnected(true);
            // console.log("provider connected")
            toast.success('Provider has connected.');

            // Optionally, you can trigger any other UI update here
            // such as enabling the chat or showing provider-specific messages
        });

        socket.on('one_min_notice', (data) => {
            toast.success(data.message)
        })

        socket.on('time_out', (data) => {
            setTimeLeft(data.time); // Set the timeLeft from the socket response
        });

        return () => {
            socket.off('connect');
            socket.off('return_message');
            socket.off('error_message');
            socket.off('wrong_message');
            // socket.off('timeout_disconnect');
            socket.off('provider_connected');
            socket.off('one_min_notice');
            socket.off('time_out');
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        const handleProviderDisconnected = (data) => {
            toast.success(data.message);

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        };

        socket.on('timeout_disconnect', handleProviderDisconnected);

        return () => {
            socket.off('timeout_disconnect', handleProviderDisconnected);
        };
    }, []);



    useEffect(() => {
        // Set the timeout to disconnect the socket after the timeLeft in minutes
        if (timeLeft > 0) {
            const timeout = timeLeft * 60000; // Convert minutes to milliseconds

            // Set a timeout to disconnect the socket after the calculated time
            const disconnectTimeout = setTimeout(() => {
                socket.disconnect();
                toast.error('Your chat has ended. Please recharge your wallet to continue.');
            }, timeout);

            // Clean up the timeout when the component is unmounted or timeLeft changes
            return () => clearTimeout(disconnectTimeout);
        }
    }, [timeLeft]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // Limit file size to 5MB
            toast.error('File size should not exceed 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const fileData = { name: file.name, type: file.type, content: reader.result };

            let room = '';
            if (UserData.role === 'provider') {
                room = `${astroId}_${UserData._id}`;
            } else {
                room = `${UserData._id}_${astroId}`;
            }

            // Emit the file upload event
            socket.emit('file_upload', {
                room,
                fileData,
                senderId: UserData._id,
                timestamp: new Date().toISOString()
            });

            // Update the chat with the new file message
            setMessages((prev) => [
                ...prev,
                {
                    text: file.name,
                    file: fileData,
                    sender: UserData._id,
                    timestamp: new Date().toISOString(),
                },
            ]);
        };
        reader.readAsDataURL(file);

        // Reset the file input to allow the same file to be selected again
        event.target.value = '';
    };



    const validateMessageContent = (message) => {
        // Regular expression for detecting phone numbers, emails, and 18+ content
        const prohibitedPatterns = [
            /\b\d{10}\b/,         // Phone number pattern (10 digits)
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email pattern
            /18\+|\bsex\b|\bxxx\b|\bcall\b|\bphone\b|\bmobile|\bteliphone\b|\bnudes\b|\bporn\b|\bsex\scall\b|\btext\b|\bwhatsapp\b|\bskype\b|\btelegram\b|\bfacetime\b|\bvideo\schat\b|\bdial\snumber\b|\bmessage\b/i, // Keywords related to 18+ content and phone connections
        ];


        // Check if any of the prohibited patterns match the message
        for (const pattern of prohibitedPatterns) {
            if (pattern.test(message)) {
                return false;  // Message contains prohibited content
            }
        }

        return true;  // Message is clean
    };


    // Handle message submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const safeMessage = message && typeof message === 'string' ? message.trim() : '';
        if (!validateMessageContent(safeMessage)) {
            // If the message contains prohibited content, show an error message
            toast.error('Your message contains prohibited content (phone numbers, emails, or 18+ content).');
            return; // Stop further execution
        }

        let room = '';
        if (UserData.role === 'provider') {
            room = `${astroId}_${UserData._id}`;
        } else {
            room = `${UserData._id}_${astroId}`;
        }

        const payload = { room, message: safeMessage, senderId: UserData._id, timestamp: new Date().toISOString(), role: UserData.role };
        socket.emit('message', payload);

        setMessages((prev) => [
            ...prev,
            {
                text: safeMessage,
                sender: UserData._id,
                timestamp: new Date().toISOString(),
            },
        ]);
        setMessage('');
    };


    const [allProviderChat, setProviderChat] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchChatProverId = async () => {
        if (!UserData) {
            return toast.error("Please Login First");
        }

        try {
            const url = UserData?.role === "provider"
                ? `https://api.helpubuild.co.in/api/v1/get-chat-by-providerId/${UserData._id}`
                : `https://api.helpubuild.co.in/api/v1/get-chat-by-userId/${UserData._id}`;

            const { data } = await axios.get(url);
            const allData = data.data.reverse(); // Reverse the data to show latest chats first
            setProviderChat(allData);
        } catch (error) {
            console.error("Internal server error", error);
        }
    };

    useEffect(() => {
        fetchChatProverId();
    }, []);

    // Filter chats based on the search term
    const filteredChats = allProviderChat.filter(chat => {
        const name = UserData?.role === "provider" ? chat?.userId?.name : chat?.providerId?.name;
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
    if (!UserData) {
        // return window.location.href = '/login'
        return <AccessDenied />
    }
    console.log("status",status);
    return (
        <section className=' hitesh_styling' style={{ backgroundColor: '#CDC4F9' }}>
            <div className="container py-5">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card" style={{ borderRadius: '15px' }}>
                            <div className="card-body">
                                <div className="row">
                                    {/* Sidebar with Chat List */}
                                    <div className="col-md-4 mb-4">
                                        <div className="p-3">
                                            {UserData?.role === "provider" ? (
                                                <div className="heading-chat-list w-100 mb-2">
                                                    <h3 className="p-1 m-0">Customer</h3>
                                                </div>
                                            ) : (
                                                <div className="heading-chat-list w-100 mb-2">
                                                    <h3 className="p-1 m-0">Provider</h3>
                                                </div>
                                            )}
                                            <div className="input-group rounded mb-3">
                                                <input
                                                    type="search"
                                                    className="form-control rounded"
                                                    placeholder="Search"
                                                    aria-label="Search"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                                                />
                                                <span className="input-group-text border-0">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                            </div>
                                            <ul className="list-unstyled connection-list mb-0">
                                                {filteredChats.length > 0 ? (
                                                    filteredChats.map((chat, index) => (
                                                        <li onClick={() => handleChatStart(chat._id)} key={index} className="p-2 border-bottom">
                                                            <div className="d-flex flex-row">
                                                                {UserData?.role === "provider" ? (
                                                                    <div style={{ display: "flex" }} className="flex-row cursor-pointer w-100 justify-content-between">
                                                                        <div className="profile_img_box">
                                                                            <img
                                                                                src={chat?.userId?.ProfileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.userId?.name || "User")}&background=random`}
                                                                                alt={chat?.userId?.name}
                                                                                className="align-self-center"
                                                                            />
                                                                        </div>
                                                                        <div className="pt-1 chat_list">
                                                                            <p className="fw-bold mb-0">{chat?.userId?.name}</p>
                                                                            <p className="recent-chat-message">{chat?.messages?.[chat?.messages.length - 1]?.text || 'No messages yet'}</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: "flex" }} className="flex-row cursor-pointer w-100 justify-content-between">
                                                                        <div className="profile_img_box">
                                                                            <img
                                                                                src={chat?.providerId?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.providerId?.name || "User")}&background=random`}
                                                                                alt={chat?.providerId?.name}
                                                                                className="align-self-center"
                                                                            />
                                                                        </div>
                                                                        <div className="pt-1 chat_list">
                                                                            <p className="fw-bold mb-0">{chat?.providerId?.name}</p>
                                                                            <p className="recent-chat-message">
                                                                                {chat?.messages?.[chat?.messages.length - 1]?.text ||
                                                                                    (chat?.messages?.[chat?.messages.length - 1]?.file ? 'File Attached' : 'No messages yet')}
                                                                            </p>

                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="p-2 text-center text-muted">No results found</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Chat Window */}
                                    {
                                        IsChatBoxActive ? (<>
                                            <div className="col-md-8 chat-box">
                                                <div className="chat-head">
                                                    <h2>Chats...</h2>
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
                                                    />
                                                    <input
                                                        type="file"
                                                        id="fileUpload"
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="fileUpload" className="ms-2">
                                                        <MdAttachment size={24} />
                                                    </label>
                                                    <button type="submit" className="btn btn-primary ms-2">
                                                        Send
                                                    </button>
                                                </form>
                                            </div>
                                        </>) : (
                                            <>
                                                <div className='col-md-8 chat-box'>
                                                    <div className='empty-box'>
                                                        <div className="message-text">
                                                            <h5>Your messages</h5>
                                                            <p>Send a message to start the conversation</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatDemo;