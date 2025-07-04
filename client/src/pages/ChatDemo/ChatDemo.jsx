"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import "./chat.css"
import { MdAttachment, MdSend, MdArrowBack, MdDelete, MdSearch, MdMoreVert } from "react-icons/md"
import ScrollToBottom from "react-scroll-to-bottom"
import axios from "axios"
import { GetData } from "../../utils/sessionStoreage"
import toast from "react-hot-toast"
import AccessDenied from "../../components/AccessDenied/AccessDenied"
import { useSocket } from "../../context/SocketContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ENDPOINT = "https://api.helpubuild.in/"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB file size limit

const ChatDemo = () => {
    // State Management - keeping all the original logic
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [isFetchingChatStatus, setIsFetchingChatStatus] = useState(false);


    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [socketId, setSocketId] = useState("")
    const [astroId, setAstroId] = useState("")
    const [isChatBoxActive, setIsChatBoxActive] = useState(false)
    const [isProviderConnected, setIsProviderConnected] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [status, setStatus] = useState("offline")
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [selectedProviderId, setSelectedProviderId] = useState(null)
    const [isChatStarted, setIsChatStarted] = useState(false)
    const [isAbleToJoinChat, setIsAbleToJoinChat] = useState(false)
    const [allProviderChat, setProviderChat] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isRoomId, setEsRoomId] = useState(null)
    const [isMobileView, setIsMobileView] = useState(false)
    const [showChatList, setShowChatList] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()
    const [chatStart, setChatStart] = useState(false)

    const [isChatOnGoing, setIsChatOnGoing] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [nextPath, setNextPath] = useState(null)
    const [isUserConfirming, setIsUserConfirming] = useState(false)
    const [selectedChat, setSelectedChat] = useState(null)

    // Check for mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768)
        }

        handleResize() // Initial check
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    // User data from session storage
    const userData = useMemo(() => {
        const data = GetData("user")
        return data ? JSON.parse(data) : null
    }, [])

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const id = userData?._id || ""
    const role = userData?.role || ""

    const socket = useSocket()

    // Handle mobile view chat selection
    const handleChatSelection = (chatId, chat) => {
        handleChatStart(chatId)
        setSelectedChat(chat)
        if (isMobileView) {
            setShowChatList(false)
        }
    }

    // Back to chat list (mobile)
    const handleBackToList = () => {
        setShowChatList(true)
    }

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await axios.get(url);
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
                console.log(`Retrying fetch attempt ${i + 1}...`);
            }
        }
    };

    useEffect(() => {
        const fetchStatusOfChatStart = async () => {
            if (!isRoomId) return;

            setIsFetchingChatStatus(true);
            try {
                const { data } = await fetchWithRetry(`${ENDPOINT}api/v1/get-chat-by-id/${isRoomId}?role=${userData?.role}`);
                const chatData = data.data;
                console.log("chatData.isChatStarted", chatData.isChatStarted);
                setIsAbleToJoinChat(chatData.isChatStarted);
            } catch (error) {
                console.log("Internal server error", error);
                toast.error("Failed to fetch chat status");
                setIsAbleToJoinChat(false);
            } finally {
                setIsFetchingChatStatus(false);
            }
        };

        if (isRoomId) {
            fetchStatusOfChatStart();
        }
    }, [isRoomId]);

    // Fetch chat history
    const fetchChatHistory = useCallback(async () => {
        if (!userData) {
            toast.error("Please login first")
            return
        }

        try {
            const url =
                userData?.role === "provider"
                    ? `${ENDPOINT}api/v1/get-chat-by-providerId/${userData._id}`
                    : `${ENDPOINT}api/v1/get-chat-by-userId/${userData._id}`

            const { data } = await axios.get(url)
            console.log("data.data", data.data)
            const filterData = userData?.role === "provider"
                ? data.data.filter(item => item.providerChatTempDeleted === false)
                : data.data.filter(item => item.userChatTempDeleted === false)
            console.log("filterData", filterData)
            setProviderChat(filterData.reverse()) // Show latest chats first
        } catch (error) {
            toast.error("Failed to load chat history")
        }
    }, [userData])

    useEffect(() => {
        fetchChatHistory()
    }, [fetchChatHistory])

    const handleDeleteChatByRoom = async () => {
        try {
            await axios.delete(`${ENDPOINT}api/v1/delete-messages-by-room/${isRoomId}?role=${userData?.role}`)
            toast.success("Chat deleted successfully")
            fetchChatHistory()
            setIsChatBoxActive(false)
            setShowChatList(true)
        } catch (error) {
            toast.error("Failed to delete chat")
            console.log("Internal server error", error)
        }
    }

    // Handle selecting a chat from the sidebar
    const handleChatStart = useCallback(
        async (chatId) => {
            if (!chatId) return;

            try {
                const { data } = await axios.get(
                    `${ENDPOINT}api/v1/get-chat-by-id/${chatId}?role=${userData?.role}`
                );

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

                if (userData?.role === "provider") {
                    setAstroId(userId);
                } else {
                    setAstroId(providerId);
                }
            } catch (error) {
                toast.error("Failed to load chat details");
            }
        },
        [userData],
    );


    useEffect(() => {
        if (selectedUserId && selectedProviderId) {
            const room = `${selectedUserId}_${selectedProviderId}`;
            setEsRoomId(room);
            console.log("Room ID set:", room); // Add logging
        } else {
            setEsRoomId(null); // Clear room ID when dependencies are missing
        }
    }, [selectedUserId, selectedProviderId]);

    const handleStartChat = useCallback(() => {
        if (!selectedUserId || !selectedProviderId) {
            toast.error("Chat information is missing")
            return
        }

        const room = `${selectedUserId}_${selectedProviderId}`
        if (room) {
            setEsRoomId(room)
        } else {
            toast.error("Chat information is missing")
        }

        if (userData?.role === "provider") {
            setChatStart(true)
            socket.emit("join_room", {
                userId: selectedUserId,
                astrologerId: selectedProviderId,
                role: "provider",
            })
            socket.emit("provider_connected", { room })
            setIsChatOnGoing(true)
            setIsChatStarted(true)
            setChatStart(false)
        } else {
            setChatStart(true)
            socket.emit(
                "join_room",
                {
                    userId: selectedUserId,
                    astrologerId: selectedProviderId,
                    role: userData.role,
                    room: room
                },
                (response) => {
                    if (response?.success) {
                        setIsChatBoxActive(true)
                        setIsActive(response.status)
                        setIsChatStarted(true)
                        toast.success(response.message)
                        setIsChatOnGoing(true)
                        setChatStart(false)
                    } else {
                        toast.error(response?.message || "Failed to join chat")
                        setIsChatBoxActive(false)
                        // setIsActive(response.status)
                        setIsChatStarted(false)
                        // toast.success(response.message)
                        setIsChatOnGoing(false)
                    }
                },
            )
        }
    }, [selectedUserId, selectedProviderId, userData, socket])

    const endChat = useCallback(() => {
        try {
            socket.emit("end_chat", {
                userId: selectedUserId,
                astrologerId: selectedProviderId,
                role: userData?.role,
                room: `${selectedUserId}_${selectedProviderId}`,
            })
            // res()
            setIsChatStarted(false)
            setIsChatBoxActive(false)
            setIsActive(false)
            setIsChatOnGoing(false)
            fetchChatHistory()
        } catch (error) {
            toast.error("Failed to end chat properly")
            console.error("Error ending chat:", error)
        }
    }, [socket, selectedUserId, selectedProviderId, userData, fetchChatHistory])

    // Navigation handling
    useEffect(() => {
        const handleClick = (e) => {
            if (!isChatOnGoing) return

            const link = e.target.closest("a")
            if (link && link.href && !link.target) {
                const url = new URL(link.href)
                if (url.pathname !== window.location.pathname) {
                    e.preventDefault()
                    const fullPath = url.pathname + url.search + url.hash
                    setNextPath(fullPath)
                    setShowPrompt(true)
                }
            }
        }

        document.body.addEventListener("click", handleClick)
        return () => document.body.removeEventListener("click", handleClick)
    }, [isChatOnGoing])

    useEffect(() => {
        const originalPushState = window.history.pushState
        const originalReplaceState = window.history.replaceState

        function intercept(method) {
            return (...args) => {
                if (!isChatOnGoing) {
                    return method.apply(window.history, args)
                }

                const nextUrl = args[2]
                if (nextUrl !== window.location.pathname) {
                    const url = new URL(nextUrl, window.location.origin)
                    const fullPath = url.pathname + url.search + url.hash
                    setNextPath(fullPath)
                    setShowPrompt(true)
                } else {
                    method.apply(window.history, args)
                }
            }
        }

        window.history.pushState = intercept(originalPushState)
        window.history.replaceState = intercept(originalReplaceState)

        return () => {
            window.history.pushState = originalPushState
            window.history.replaceState = originalReplaceState
        }
    }, [isChatOnGoing])

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isChatOnGoing && !isUserConfirming) {
                e.preventDefault()
                e.returnValue = ""
                return ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isChatOnGoing, isUserConfirming])

    const confirmNavigation = async () => {
        setIsUserConfirming(true)
        await endChat()
        setShowPrompt(false)

        if (nextPath) {
            navigate(nextPath, { replace: true })
            setNextPath(null)
        } else {
            window.location.reload()
        }
    }

    const cancelNavigation = () => {
        setNextPath(null)
        setShowPrompt(false)
    }

    // Socket event listeners
    // Socket event listeners with proper endChat reference
    useEffect(() => {
        socket.on("connect", () => {
            setSocketId(socket.id)
            socket.emit("send_socket_id", {
                socketId: socket.id,
                role: userData?.role,
                userId: id,
            })
            console.log("after emit", userData?.role, id, socket.id)
        })

        socket.on("return_message", (data) => {
            setMessages((prev) => [...prev, data])
        })

        socket.on("user_status", ({ userId, astrologerId, status }) => {
            setStatus(status)
        })

        socket.on("error_message", (data) => {
            toast.error(data.message)
            setIsChatBoxActive(false)
        })

        socket.on("wrong_message", (data) => {
            toast.error(data.message)
        })

        socket.on("provider_connected", ({ room }) => {
            setIsProviderConnected(true)
            toast.success("Provider has connected")
        })

        socket.on("one_min_notice", (data) => {
            toast.success(data.message)
        })

        socket.on("time_out", (data) => {
            setTimeLeft(data.time)
        })

        socket.on("user_connected_notification", ({ userId, message, status }) => {
            if (userData?._id !== userId) {
                setIsAbleToJoinChat(status)
            }
            toast.success(message)
        })

        socket.on("user_left_chat", ({ userId, message, status }) => {
            setIsAbleToJoinChat(status)
            setIsChatStarted(status)
            toast.success(message)
        })

        socket.on("timeout_disconnect", (data) => {
            toast.success(data.message)
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        })

        socket.on("chat_ended", (data) => {
            if (data.success) {
                setIsChatStarted(false)
                setIsChatBoxActive(false)
                setIsActive(false)
                setIsAbleToJoinChat(false)
                toast.success("Chat ended successfully")
            } else {
                toast.error(data.message || "Error ending chat")
            }
        })

        socket.on("inactivity_notice", async (data) => {
            toast.success(data.message)
            if (userData?.role === "user") {
                await endChat()
            }
        })

        // Fixed provider_disconnected handler
        socket.on("provider_disconnected", (data) => {
            toast.success(data.message)

            // Call the endChat function if chat was started
            if (isChatStarted) {
                endChat();
            } else {
                // Otherwise just update the UI states
                setIsProviderConnected(false)
                setIsAbleToJoinChat(false)
                setIsChatStarted(false)
            }
        })

        return () => {
            socket.off("connection")
            socket.off("return_message")
            socket.off("error_message")
            socket.off("wrong_message")
            socket.off("provider_connected")
            socket.off("one_min_notice")
            socket.off("time_out")
            socket.off("user_connected_notification")
            socket.off("user_left_chat")
            socket.off("timeout_disconnect")
            socket.off("chat_ended")
            socket.off("inactivity_notice")
            socket.off("provider_disconnected")
        }
    }, [id, socket, userData, endChat, isChatStarted]) // Make sure to include endChat in the dependency array

    // Handle chat timeout
    useEffect(() => {
        if (timeLeft > 0) {
            const timeout = timeLeft * 60000 // Convert minutes to milliseconds
            const disconnectTimeout = setTimeout(() => {
                socket.disconnect()
                toast.error("Your chat has ended. Please recharge your wallet to continue.")
                setIsChatStarted(false)
                setIsChatBoxActive(false)
            }, timeout)

            return () => clearTimeout(disconnectTimeout)
        }
    }, [timeLeft, socket])

    // Content validation for messages
    const validateMessageContent = useCallback((messageText) => {
        if (!messageText || typeof messageText !== "string" || messageText.trim() === "") {
            return false
        }

        // Prohibited patterns
        const prohibitedPatterns = [
            /\b\d{10}\b/, // Phone number pattern
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email pattern
            /18\+|\bsex\b|\bxxx\b|\bcall\b|\bphone\b|\bmobile|\bteliphone\b|\bnudes\b|\bporn\b|\bsex\scall\b|\btext\b|\bwhatsapp\b|\bskype\b|\btelegram\b|\bfacetime\b|\bvideo\schat\b|\bdial\snumber\b|\bmessage\b/i, // Keywords related to 18+ content and phone connections
        ]

        return !prohibitedPatterns.some((pattern) => pattern.test(messageText))
    }, [])

    // Handle file upload
    const handleFileChange = useCallback(
        (event) => {
            if (!isChatStarted) {
                toast.error("Please start the chat first")
                event.target.value = ""
                return
            }

            const file = event.target.files[0]
            if (!file) return

            if (!file.type.startsWith("image/")) {
                toast.error("Only image files are allowed")
                event.target.value = ""
                return
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error("File size should not exceed 5MB")
                event.target.value = ""
                return
            }

            const reader = new FileReader()
            reader.onload = () => {
                try {
                    const fileData = {
                        name: file.name,
                        type: file.type,
                        content: reader.result,
                    }

                    const room = userData?.role === "provider" ? `${astroId}_${userData._id}` : `${userData._id}_${astroId}`

                    socket.emit("file_upload", {
                        room,
                        fileData,
                        senderId: userData._id,
                        timestamp: new Date().toISOString(),
                    })

                    setMessages((prev) => [
                        ...prev,
                        {
                            text: file.name,
                            file: fileData,
                            sender: userData._id,
                            timestamp: new Date().toISOString(),
                        },
                    ])
                } catch (error) {
                    toast.error("Failed to process file")
                }
            }

            reader.onerror = () => {
                toast.error("Failed to read file")
            }

            reader.readAsDataURL(file)
            event.target.value = ""
        },
        [isChatStarted, userData, astroId, socket],
    )

    // Send message
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault()

            if (!isChatStarted) {
                toast.error("Please start the chat first")
                return
            }

            const trimmedMessage = message && typeof message === "string" ? message.trim() : ""

            if (!trimmedMessage) {
                toast.error("Please enter a message")
                return
            }

            if (!validateMessageContent(trimmedMessage)) {
                toast.error("Your message contains prohibited content (phone numbers, emails, or 18+ content)")
                return
            }

            try {
                const room = userData?.role === "provider" ? `${astroId}_${userData._id}` : `${userData._id}_${astroId}`

                const payload = {
                    room,
                    message: trimmedMessage,
                    senderId: userData._id,
                    timestamp: new Date().toISOString(),
                    role: userData.role,
                }

                socket.emit("message", payload)

                setMessages((prev) => [
                    ...prev,
                    {
                        text: trimmedMessage,
                        sender: userData._id,
                        timestamp: new Date().toISOString(),
                    },
                ])
                setMessage("")
            } catch (error) {
                toast.error("Failed to send message")
            }
        },
        [message, isChatStarted, userData, astroId, socket, validateMessageContent],
    )

    // Filter chats based on search term
    const filteredChats = useMemo(() => {
        return allProviderChat.filter((chat) => {
            const name = userData?.role === "provider" ? chat?.userId?.name : chat?.providerId?.name

            return name?.toLowerCase().includes(searchTerm.toLowerCase())
        })
    }, [allProviderChat, userData, searchTerm])

    // If no user data, show access denied
    if (!userData) {
        return <AccessDenied />
    }

    return (
        <div className="modern-chat-container">
            <div className="container-fluid p-0">
                <div className="row g-0">
                    {/* Chat List - Show on desktop or when showChatList is true on mobile */}
                    {(!isMobileView || showChatList) && (
                        <div className="col-md-4 chat-list-container">
                            <div className="chat-list-header">
                                <h3>{userData?.role === "provider" ? "Clients" : "Consultants"}</h3>
                                <div className="search-container">
                                    <input
                                        type="search"
                                        className="form-control search-input"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <MdSearch className="search-icon" />
                                </div>
                            </div>

                            <div className="chat-list">
                                {filteredChats.length > 0 ? (
                                    filteredChats.map((chat, index) => (
                                        <div
                                            key={chat._id || index}
                                            className={`chat-list-item ${isRoomId === `${chat?.userId?._id}_${chat?.providerId?._id}` ? "active" : ""}`}
                                            onClick={() => handleChatSelection(chat._id, chat)}
                                        >
                                            <div className="avatar">
                                                {userData?.role === "provider" ? (
                                                    <img
                                                        src={
                                                            chat?.userId?.ProfileImage?.url ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.userId?.name || "User")}&background=random`
                                                        }
                                                        alt={chat?.userId?.name || "User"}
                                                    />
                                                ) : (
                                                    <img
                                                        src={
                                                            chat?.providerId?.photo?.imageUrl ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.providerId?.name || "User")}&background=random`
                                                        }
                                                        alt={chat?.providerId?.name || "Provider"}
                                                    />
                                                )}
                                                <span className={`status-indicator ${status === "online" ? "online" : "offline"}`}></span>
                                            </div>
                                            <div className="chat-info">
                                                <div className="chat-name">
                                                    {userData?.role === "provider"
                                                        ? chat?.userId?.name || "User"
                                                        : chat?.providerId?.name || "Provider"}
                                                </div>
                                                <div className="last-message">
                                                    {chat?.messages?.[chat?.messages.length - 1]?.text ||
                                                        (chat?.messages?.[chat?.messages.length - 1]?.file ? "File Attached" : "No messages yet")}
                                                </div>
                                            </div>
                                            <div className="chat-meta">
                                                {chat?.messages?.length > 0 && (
                                                    <div className="message-time">
                                                        {new Date(chat?.messages[chat?.messages.length - 1]?.timestamp).toLocaleTimeString(
                                                            "en-US",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-chats">
                                        <p>No chats found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Window - Show on desktop or when showChatList is false on mobile */}
                    {(!isMobileView || !showChatList) && (
                        <div className="col-md-8 chat-window-container">
                            {isChatBoxActive ? (
                                <>
                                    <div className="chat-header">
                                        {isMobileView && (
                                            <button className="back-button" onClick={handleBackToList}>
                                                <MdArrowBack />
                                            </button>
                                        )}

                                        <div className="chat-user-info">
                                            <div className="avatar">
                                                {selectedChat && (
                                                    <img
                                                        src={
                                                            userData?.role === "provider"
                                                                ? selectedChat?.userId?.ProfileImage?.url ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat?.userId?.name || "User")}&background=random`
                                                                : selectedChat?.providerId?.photo?.imageUrl ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat?.providerId?.name || "Provider")}&background=random`
                                                        }
                                                        alt={
                                                            userData?.role === "provider"
                                                                ? selectedChat?.userId?.name || "User"
                                                                : selectedChat?.providerId?.name || "Provider"
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">
                                                    {selectedChat &&
                                                        (userData?.role === "provider"
                                                            ? selectedChat?.userId?.name || "User"
                                                            : selectedChat?.providerId?.name || "Provider")}
                                                </div>
                                                <div className="user-status">{status === "online" ? "Online" : "Offline"}</div>
                                            </div>
                                        </div>

                                        {role === "user" ? (
                                            isChatStarted ? (
                                                // <li>
                                                <button className="btn btn-danger" onClick={endChat}>
                                                    End Chat
                                                </button>
                                                // </li>
                                            ) : (
                                                // <li>
                                                <button className="btn btn-success" onClick={handleStartChat}>
                                                   {chatStart ? "Chat Starting..." : "Start Chat"}
                                                </button>
                                                // </li>
                                            )
                                        ) : (
                                            isAbleToJoinChat &&
                                            (isChatStarted ? (
                                                // <li>
                                                <button className="btn btn-danger" onClick={endChat}>
                                                    End Chat
                                                </button>
                                                // </li>
                                            ) : (
                                                // <li>
                                                <button className="btn btn-success" onClick={handleStartChat}>
                                                    {chatStart ? "Chat Starting..." : "Start Chat"}
                                                </button>
                                                // </li>
                                            ))
                                        )}

                                        <div className="chat-actions">
                                            <div className="dropdown">
                                                <button
                                                    className="btn dropdown-toggle"
                                                    type="button"
                                                    id="chatActionsDropdown"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <MdMoreVert />
                                                </button>
                                                <ul className="dropdown-menu h-dropdown-menu dropdown-menu-end" aria-labelledby="chatActionsDropdown">
                                                    <li>
                                                        <button className="dropdown-item" onClick={handleDeleteChatByRoom}>
                                                            <MdDelete className="me-2" /> Delete Chat
                                                        </button>
                                                    </li>
                                                    {/* {role === "user" ? (
                                                        isChatStarted ? (
                                                            <li>
                                                                <button className="dropdown-item text-danger" onClick={endChat}>
                                                                    End Chat
                                                                </button>
                                                            </li>
                                                        ) : (
                                                            <li>
                                                                <button className="dropdown-item text-success" onClick={handleStartChat}>
                                                                    Start Chat
                                                                </button>
                                                            </li>
                                                        )
                                                    ) : (
                                                        isAbleToJoinChat &&
                                                        (isChatStarted ? (
                                                            <li>
                                                                <button className="dropdown-item text-danger" onClick={endChat}>
                                                                    End Chat
                                                                </button>
                                                            </li>
                                                        ) : (
                                                            <li>
                                                                <button className="dropdown-item text-success" onClick={handleStartChat}>
                                                                    Start Chat
                                                                </button>
                                                            </li>
                                                        ))
                                                    )} */}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <ScrollToBottom className="messages-container" initialScrollBehavior="smooth">
                                        {messages.length === 0 ? (
                                            <div className="no-messages">
                                                <p>Send a message to start a conversation</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, idx) => (
                                                <div key={idx} className={`message-wrapper ${msg.sender === id ? "outgoing" : "incoming"}`}>
                                                    {msg.file ? (
                                                        <div onClick={() => handleImageClick(msg.file)}
                                                            style={{ cursor: 'pointer' }} className="message-bubble file-message">
                                                            <a>
                                                                <img
                                                                    src={msg.file.content || "/placeholder.svg"}
                                                                    alt={msg.file.name}
                                                                    className="message-image img-thumbnail"
                                                                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                                                                />
                                                            </a>
                                                            <div className="message-time">
                                                                {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="message-bubble">
                                                            <div className="message-text">{msg.text}</div>
                                                            <div className="message-time">
                                                                {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </ScrollToBottom>

                                    <Modal
                                        show={showModal}
                                        onHide={handleCloseModal}
                                        centered
                                        size="lg"
                                        className="image-preview-modal"
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title>{selectedImage?.name}</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body className="text-center p-0">
                                            {selectedImage && (
                                                <img
                                                    src={selectedImage.content}
                                                    alt={selectedImage.name}
                                                    className="img-fluid"
                                                    style={{ maxHeight: '70vh' }}
                                                />
                                            )}
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={handleCloseModal}>
                                                Close
                                            </Button>
                                            <a
                                                href={selectedImage?.content}
                                                download={selectedImage?.name}
                                                className="btn btn-primary"
                                            >
                                                Download
                                            </a>
                                        </Modal.Footer>
                                    </Modal>

                                    <form className="message-input-container" onSubmit={handleSubmit}>
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                            disabled={!isChatStarted}
                                            accept="image/*"
                                        />
                                        <label htmlFor="fileUpload" className={`attachment-button ${!isChatStarted ? "disabled" : ""}`}>
                                            <MdAttachment />
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control message-input"
                                            placeholder={isChatStarted ? "Type your message..." : "Start chat to send messages"}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            disabled={!isChatStarted}
                                        />
                                        <button
                                            type="submit"
                                            className={`send-button ${!isChatStarted ? "disabled" : ""}`}
                                            disabled={!isChatStarted}
                                        >
                                            <MdSend />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="empty-chat-container">
                                    <div className="empty-chat-content">
                                        <div className="empty-chat-icon">
                                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272V21L8.87279 20C9.94066 20.6336 10.9393 21 12 21Z"
                                                    stroke="#6B7280"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <h3>Your Messages</h3>
                                        <p>Select a chat to start the conversation</p>
                                        {isMobileView && (
                                            <button className="btn btn-primary mt-3" onClick={handleBackToList}>
                                                View Chats
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Confirmation Modal */}
            {showPrompt && (
                <div className="navigation-modal">
                    <div className="navigation-modal-content">
                        <h4>Leave Chat?</h4>
                        <p>Are you sure you want to leave the chat?</p>
                        <div className="navigation-modal-actions">
                            <button className="btn btn-secondary" onClick={cancelNavigation}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmNavigation}>
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatDemo
