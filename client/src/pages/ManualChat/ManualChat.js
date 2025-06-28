import { useEffect, useMemo, useState, useCallback } from "react"
import "./chat.css"
import { MdAttachment, MdSend, MdArrowBack, MdSearch, MdPhone, MdExpandMore, MdUndo, MdClear, MdBrush } from "react-icons/md"
import ScrollToBottom from "react-scroll-to-bottom"
import axios from "axios"
import { GetData } from "../../utils/sessionStoreage"
import toast from "react-hot-toast"
import AccessDenied from "../../components/AccessDenied/AccessDenied"
import { useSocket } from "../../context/SocketContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Modal, Button, Dropdown, ButtonGroup } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import CanvasDraw from "react-canvas-draw"
import { useRef } from "react"

const ENDPOINT = "https://api.helpubuild.in/"
const MAX_FILE_SIZE = 5 * 1024 * 1024

const GroupChat = () => {
  // State Management
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isFetchingChatStatus, setIsFetchingChatStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [socketId, setSocketId] = useState("")
  const [isChatBoxActive, setIsChatBoxActive] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [status, setStatus] = useState("offline")
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedProviderIds, setSelectedProviderIds] = useState([])
  const [isChatStarted, setIsChatStarted] = useState(false)
  const [isAbleToJoinChat, setIsAbleToJoinChat] = useState(false)
  const [allGroupChats, setAllGroupChats] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentRoomId, setCurrentRoomId] = useState(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [isChatOnGoing, setIsChatOnGoing] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [nextPath, setNextPath] = useState(null)
  const [isUserConfirming, setIsUserConfirming] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [connectedProviders, setConnectedProviders] = useState(new Set())
  const [groupMembers, setGroupMembers] = useState([])
  const [isChatEnded, setIsChatEnded] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null);
  // Canvas annotation states
  const [brushColor, setBrushColor] = useState("#ff0000")
  const [brushRadius, setBrushRadius] = useState(2)
  const [isAnnotating, setIsAnnotating] = useState(false)

  const canvasRef = useRef()
  const navigate = useNavigate()
  const location = useLocation()

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle canvas actions
  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo()
    }
  }
  useEffect(() => {
    if (!selectedImage?.content) return;

    let url;

    // CASE 1: Already a base64 data URL
    if (typeof selectedImage.content === "string" && selectedImage.content.startsWith("data:image")) {
      url = selectedImage.content;
    }

    // CASE 2: Buffer content (Array of numbers)
    else if (Array.isArray(selectedImage.content)) {
      const byteArray = new Uint8Array(selectedImage.content);
      const blob = new Blob([byteArray], { type: selectedImage.type || "image/jpeg" });
      url = URL.createObjectURL(blob);
    }

    setDownloadUrl(url);

    // Cleanup Blob URL when component unmounts or changes
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [selectedImage]);

  const handleBase64Download = () => {
    try {
      const base64Data = downloadUrl;
      console.log("Step 1: Received base64Data", base64Data);

      if (!base64Data || typeof base64Data !== "string" || !base64Data.startsWith("data:")) {
        console.error("❌ Step 2: Invalid base64 data");
        return;
      }

      const parts = base64Data.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      console.log("✅ Step 3: Decoded base64 to byte string");
      console.log("MIME Type:", mimeString);

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      console.log("✅ Step 4: Converted to Uint8Array");

      const blob = new Blob([ia], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
      console.log("✅ Step 5: Created Blob URL", blobUrl);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'annotated-image.png';
      link.target = '_blank'; // Important for some browsers

      document.body.appendChild(link);

      // Use requestAnimationFrame for natural user-triggered behavior
      requestAnimationFrame(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        console.log("✅ Step 7: Cleanup complete");
      });

      console.log("✅ Step 6: Download triggered");
    } catch (error) {
      console.error("❌ Error during base64 download:", error);
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
  }

  const handleSendAnnotation = async () => {
    setLoading(true)
    if (!canvasRef.current || !selectedImage?.content) return;

    try {
      // Access both canvas layers
      const drawingCanvas = canvasRef.current.canvas.drawing; // user drawing
      const width = drawingCanvas.width;
      const height = drawingCanvas.height;

      // Create an off-screen canvas to merge background and drawing
      const mergedCanvas = document.createElement("canvas");
      mergedCanvas.width = width;
      mergedCanvas.height = height;
      const ctx = mergedCanvas.getContext("2d");

      // Load the background image
      const backgroundImg = new Image();
      backgroundImg.src = selectedImage.content;

      backgroundImg.onload = () => {
        // Draw background image
        ctx.drawImage(backgroundImg, 0, 0, width, height);

        // Draw the drawing canvas on top
        ctx.drawImage(drawingCanvas, 0, 0, width, height);

        // Export the merged result
        const mergedDataUrl = mergedCanvas.toDataURL("image/png");

        const annotatedFile = {
          name: `annotated_${selectedImage?.name || "image.png"}`,
          type: "image/png",
          content: mergedDataUrl,
        };

        console.log("Sending merged image", annotatedFile?.content);

        socket.emit("manual_file_upload", {
          room: currentRoomId,
          fileData: annotatedFile,
          senderId: userData._id,
          timestamp: new Date().toISOString(),
        });

        toast.success("Annotated image sent to chat!");
        setShowModal(false);
        setIsAnnotating(false);
      };

      backgroundImg.onerror = () => {
        toast.error("Failed to load background image");
      };
    } catch (error) {
      toast.error("Failed to send annotated image");
      console.error("Error sending annotation:", error);
    } finally {
      setLoading(false)

    }
  };



  // User data from session storage
  const userData = useMemo(() => {
    const data = GetData("user")
    return data ? JSON.parse(data) : null
  }, [])

  const handleImageClick = (image) => {
    setSelectedImage(image)
    setShowModal(true)
    setIsAnnotating(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setIsAnnotating(false)
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
  }

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
        return await axios.get(url)
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise((resolve) => setTimeout(resolve, delay))
        console.log(`Retrying fetch attempt ${i + 1}...`)
      }
    }
  }

  // Fetch group chat status
  useEffect(() => {
    const fetchGroupChatStatus = async () => {
      setLoading(true)

      if (!currentRoomId) return

      setIsFetchingChatStatus(true)
      try {
        const { data } = await fetchWithRetry(
          `${ENDPOINT}api/v1/get-chat-by-id/${currentRoomId}?role=${userData?.role}`,
        )
        const chatData = data.data
        setIsAbleToJoinChat(chatData.isChatStarted)
      } catch (error) {
        console.log("Internal server error", error)
        toast.error("Failed to fetch chat status")
        setIsAbleToJoinChat(false)
      } finally {
        setLoading(false)

        setIsFetchingChatStatus(false)
      }
    }

    if (currentRoomId) {
      fetchGroupChatStatus()
    }
  }, [currentRoomId])

  // Fetch group chat history
  const fetchGroupChatHistory = useCallback(async () => {
        setLoading(true)

    if (!userData) {
      toast.error("Please login first")
      return
    }

    try {
      const url =
        userData?.role === "provider"
          ? `${ENDPOINT}api/v1/get_manual_chat_by_providerId/${userData._id}`
          : `${ENDPOINT}api/v1/get_manual_chat_by_userId/${userData._id}`

      const { data } = await axios.get(url)
      setAllGroupChats(data.data.reverse())
    } catch (error) {
      toast.error("Failed to load group chat history")
    }finally{
          setLoading(false)

    }
  }, [userData])

  useEffect(() => {
    fetchGroupChatHistory()
  }, [fetchGroupChatHistory])

  const handleDeleteGroupChatByRoom = async () => {
    try {
      await axios.delete(`${ENDPOINT}api/v1/delete-messages-by-room/${currentRoomId}?role=${userData?.role}`)
      toast.success("Group chat deleted successfully")
      fetchGroupChatHistory()
      setIsChatBoxActive(false)
      setShowChatList(true)
    } catch (error) {
      toast.error("Failed to delete group chat")
      console.log("Internal server error", error)
    }
  }

  // Get group members excluding current user
  const getGroupMembers = useCallback(
    (chat) => {
      if (!chat || !userData) return []

      const members = []

      // Add user if current user is not the user
      if (chat.userId && chat.userId._id !== userData._id) {
        members.push({
          id: chat.userId._id,
          name: chat.userId.name,
          role: "user",
          phoneNumber: chat.userId.PhoneNumber,
        })
      }

      // Add providers if current user is not in the provider list
      if (chat.providerIds && Array.isArray(chat.providerIds)) {
        chat.providerIds.forEach((provider) => {
          if (provider._id !== userData._id) {
            members.push({
              id: provider._id,
              name: provider.name,
              role: "provider",
              phoneNumber: provider.mobileNumber,
            })
          }
        })
      }

      return members
    },
    [userData],
  )

  const handleCallMember = useCallback(async (member, selectedChat) => {
    setLoading(true)

    if (!userData) {
      toast.error("Please login first")
      return
    }

    let phoneNumber = member?.phoneNumber;

    if (!phoneNumber) {
      toast.error(`No phone number available for ${member?.name || 'this member'}`);
      return;
    }

    const cleanedNumber = phoneNumber.replace(/[^+\d]/g, '');

    try {
      if (cleanedNumber) {
        const room = selectedChat?._id
        const callFrom = userData.mobileNumber || userData.PhoneNumber
        const callTo = member?.phoneNumber
        console.log("all detail =", room, callFrom, callTo)
        const res = await axios.post(`${ENDPOINT}api/v1/create_call_for_free`, { roomId: room, callFrom, callTo });
        toast.success(`Calling ${member.name}...`);
      } else {
        toast.error("Invalid phone number");
      }
    } catch (error) {
      console.log("Internal server error", error)
    }finally{
          setLoading(false)

    }
  }, []);

  // Handle selecting a group chat from the sidebar
  const handleChatStart = useCallback(
    async (chatId) => {
      if (!chatId) return

      try {
        const { data } = await axios.get(`${ENDPOINT}api/v1/get-chat-by-id/${chatId}?role=${userData?.role}`)

        const chatData = data.data

        if (!chatData) {
          toast.error("Group chat not found")
          return
        }

        const userId = chatData?.userId?._id
        const providerIds = chatData?.providerIds?.map((provider) => provider._id) || []

        setMessages(chatData.messages || [])
        setSelectedUserId(userId)
        setSelectedProviderIds(providerIds)
        setIsChatBoxActive(true)
        setCurrentRoomId(chatId)
        setIsChatStarted(true)
        setIsChatOnGoing(true)
        setGroupMembers(getGroupMembers(chatData))
        setIsChatEnded(chatData?.isGroupChatEnded)

        // Auto-join the room
        if (userData?.role === "provider") {
          socket.emit("join_manual_room", {
            userId: userId,
            astrologerId: userData._id,
            role: "provider",
            room: chatId,
          })
        } else {
          socket.emit("join_manual_room", {
            userId: userId,
            astrologerId: providerIds[0],
            role: userData.role,
            room: chatId,
          })
        }
      } catch (error) {
        toast.error("Failed to load group chat details")
      }
    },
    [userData, socket, getGroupMembers],
  )

  const endGroupChat = useCallback(() => {
    try {
      socket.emit("manual_end_chat", {
        userId: selectedUserId,
        astrologerId: userData?.role === "provider" ? userData._id : selectedProviderIds[0],
        role: userData?.role,
        room: currentRoomId,
      })

      setIsChatStarted(false)
      setIsChatBoxActive(false)
      setIsActive(false)
      setIsChatOnGoing(false)
      setConnectedProviders(new Set())
      setGroupMembers([])
      fetchGroupChatHistory()
    } catch (error) {
      toast.error("Failed to end group chat properly")
      console.error("Error ending group chat:", error)
    }
  }, [socket, selectedUserId, selectedProviderIds, userData, currentRoomId, fetchGroupChatHistory])

  // Enhanced version that includes role information
  const getSenderInfo = useCallback((senderId) => {
    if (senderId === userData?._id) {
      return { name: "You", role: userData?.role, isCurrentUser: true };
    }

    // Check if sender is the user in the chat
    if (selectedChat?.userId?._id === senderId) {
      return {
        name: selectedChat.userId.name,
        role: "user",
        isCurrentUser: false
      };
    }

    // Check if sender is one of the providers
    const provider = selectedChat?.providerIds?.find(p => p._id === senderId);
    if (provider) {
      return {
        name: provider.name,
        role: "provider",
        isCurrentUser: false
      };
    }

    return { name: "Unknown User", role: "unknown", isCurrentUser: false };
  }, [userData, selectedChat]);

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
    await endGroupChat()
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

  // Socket event listeners for group chat
  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id)
      socket.emit("send_socket_id", {
        socketId: socket.id,
        role: userData?.role,
        userId: id,
      })
    })

    // Enhanced message handler to properly handle files
    socket.on("return_message", (data) => {
      console.log("Received message from others:", data)

      // Create message object with proper structure
      const messageObj = {
        ...data,
        senderId: data.sender || data.senderId,
        sender: data.sender || data.senderId,
      }

      // If it's a file message, ensure file structure is correct
      if (data.file) {
        messageObj.file = {
          name: data.file.name,
          type: data.file.type,
          content: data.file.content
        }
      }

      setMessages((prev) => [...prev, messageObj])
    })

    socket.on("user_status", ({ userId, astrologerId, status, role }) => {
      if (role === "provider") {
        setConnectedProviders((prev) => {
          const newSet = new Set(prev)
          if (status === "online") {
            newSet.add(astrologerId)
          } else {
            newSet.delete(astrologerId)
          }
          return newSet
        })
      }
      setStatus(status)
    })

    socket.on("room_joined", (data) => {
      console.log("Room joined:", data.message)
    })

    socket.on("error_message", (data) => {
      toast.error(data.message)
      setIsChatBoxActive(false)
    })

    socket.on("wrong_message", (data) => {
      toast.error(data.message)
    })

    socket.on("message_sent", (data) => {
      console.log("Message sent confirmation:", data)
    })

    socket.on("chat_ended", (data) => {
      if (data.success) {
        setIsChatStarted(false)
        setIsChatBoxActive(false)
        setIsActive(false)
        setIsAbleToJoinChat(false)
        setConnectedProviders(new Set())
        setGroupMembers([])
        toast.success("Group chat ended successfully")
      } else {
        toast.error(data.message || "Error ending group chat")
      }
    })

    return () => {
      socket.off("connect")
      socket.off("return_message")
      socket.off("message_sent")
      socket.off("user_status")
      socket.off("room_joined")
      socket.off("error_message")
      socket.off("wrong_message")
      socket.off("message_sent")
      socket.off("file_upload_success")
      socket.off("file_upload_error")
      socket.off("chat_ended")
    }
  }, [id, socket, userData, selectedProviderIds])

  // Content validation for messages
  const validateMessageContent = useCallback((messageText) => {
    if (!messageText || typeof messageText !== "string" || messageText.trim() === "") {
      return false
    }

    const prohibitedPatterns = [
      /\b\d{10}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
      /18\+|\bsex\b|\bxxx\b|\bcall\b|\bphone\b|\bmobile|\bteliphone\b|\bnudes\b|\bporn\b|\bsex\scall\b|\btext\b|\bwhatsapp\b|\bskype\b|\btelegram\b|\bfacetime\b|\bvideo\schat\b|\bdial\snumber\b|\bmessage\b/i,
    ]

    return !prohibitedPatterns.some((pattern) => pattern.test(messageText))
  }, [])

  // Enhanced file upload handler
  const handleFileChange = useCallback(
    (event) => {
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

      const uploadingToast = toast.loading("Uploading file...")

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const fileData = {
            name: file.name,
            type: file.type,
            content: reader.result,
          }

          socket.emit("manual_file_upload", {
            room: currentRoomId,
            fileData,
            senderId: userData._id,
            timestamp: new Date().toISOString(),
          })

          toast.dismiss(uploadingToast)

        } catch (error) {
          toast.dismiss(uploadingToast)
          toast.error("Failed to process file")
        }
      }

      reader.onerror = () => {
        toast.dismiss(uploadingToast)
        toast.error("Failed to read file")
      }

      reader.readAsDataURL(file)
      event.target.value = ""
    },
    [userData, currentRoomId, socket],
  )

  // Handle message submission
  const handleSubmit = useCallback(
    (e) => {
      
      e.preventDefault()

      const trimmedMessage = message && typeof message === "string" ? message.trim() : ""

      if (!trimmedMessage) {
        toast.error("Please enter a message")
        return
      }

      if (!validateMessageContent(trimmedMessage)) {
        toast.error("Your message contains prohibited content")
        return
      }

      try {
        const payload = {
          room: currentRoomId,
          message: trimmedMessage,
          senderId: userData._id,
          timestamp: new Date().toISOString(),
          role: userData.role,
        }

        socket.emit("manual_message", payload)
        setMessage("")
      } catch (error) {
        toast.error("Failed to send message")
      }
    },
    [message, userData, currentRoomId, socket, validateMessageContent],
  )

  // Filter group chats based on search term
  const filteredChats = useMemo(() => {
    return allGroupChats.filter((chat) => {
      const groupName = chat?.groupName || "Group Chat"
      return groupName.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [allGroupChats, searchTerm])

  // Get participant names for display
  const getParticipantNames = (chat) => {
    if (userData?.role === "provider") {
      return chat?.userId?.name || "User"
    } else {
      const providerNames = chat?.providerIds?.map((provider) => provider.name).join(", ") || "Providers"
      return providerNames
    }
  }
  const isMobile = window.innerWidth <= 710;

  if (!userData) {
    return <AccessDenied />
  }
if (loading) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center bg-light"
      style={{ height: '100dvh', textAlign: 'center' }}
    >
      <div
        className="spinner-border"
        role="status"
        style={{
          width: '3rem',
          height: '3rem',
          borderColor: '#eab936',
          borderRightColor: 'transparent',
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>

      <h5 className="fw-semibold mb-1 mt-4" style={{ color: '#eab936' }}>
        Fetching Live Projects...
      </h5>
      <small className="text-muted">Please wait while we prepare your workspace.</small>
    </div>
  );
}



  return (
    <div className="modern-chat-container">
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Group Chat List */}
          {(!isMobileView || showChatList) && (
            <div className="col-md-4 chat-list-container">
              <div className="chat-list-header">
                <h3>Group Chats</h3>
                <div className="search-container">
                  <input
                    type="search"
                    className="form-control search-input"
                    placeholder="Search group chats..."
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
                      className={`chat-list-item ${currentRoomId === chat._id ? "active" : ""}`}
                      onClick={() => handleChatSelection(chat._id, chat)}
                    >
                      <div className="avatar">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.groupName || "Group")}&background=random`}
                          alt={chat?.groupName || "Group Chat"}
                        />
                        <span
                          className={`status-indicator ${connectedProviders.size > 0 ? "online" : "offline"}`}
                        ></span>
                      </div>
                      <div className="chat-info">
                        <div className="chat-name">{chat?.groupName || "Group Chat"}</div>
                        <div className="participants">{getParticipantNames(chat)}</div>
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
                        {userData?.role === "user" && (
                          <div className="provider-count">
                            {connectedProviders.size}/{selectedProviderIds.length} online
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-chats">
                    <p>No group chats found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Group Chat Window */}
          {(!isMobileView || !showChatList) && (
            <div className="col-md-8 chat-window-container">
              {isChatBoxActive ? (
                <>
                  <div className="chatn-header">
                    {isMobileView && (
                      <button className="chatn-back-button" onClick={handleBackToList}>
                        <MdArrowBack size={20} />
                      </button>
                    )}

                    <div className="chatn-user-info">
                      <div className="chatn-avatar">
                        {selectedChat && (
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              selectedChat?.groupName || "Group"
                            )}&background=random`}
                            alt={selectedChat?.groupName || "Group Chat"}
                          />
                        )}
                      </div>
                      <div className="chatn-user-details">
                        <div className="chatn-user-name">{selectedChat?.groupName || "Group Chat"}</div>
                        <div className="chatn-user-status">
                          {userData?.role === "user"
                            ? `${connectedProviders.size}/${selectedProviderIds.length} providers online`
                            : `Group Chat`}
                        </div>
                      </div>
                    </div>

                    <div className="chatn-actions">
                      {groupMembers.length > 0 && (
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-primary"
                            id="call-members-dropdown"
                            className="chatn-call-dropdown"
                          >
                            <MdPhone className="me-1" />
                            Call Member
                            <MdExpandMore className="ms-1" />
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Header>Group Members</Dropdown.Header>
                            {groupMembers.map((member) => (
                              <Dropdown.Item
                                key={member.id}
                                onClick={() => handleCallMember(member, selectedChat)}
                                className="d-flex justify-content-between align-items-center"
                              >
                                <div>
                                  <div className="fw-semibold">{member.name}</div>
                                  <small className="text-muted text-capitalize">{member.role}</small>
                                </div>
                                <MdPhone className="text-success" />
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  </div>


                  <ScrollToBottom className="messages-container" initialScrollBehavior="smooth">
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        <p>Send a message to start the group conversation</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div key={idx} className={`message-wrapper ${msg.sender === id ? "outgoing" : "incoming"}`}>
                          {/* Add sender name for incoming messages */}
                          {msg.sender !== id && (
                            <div className={`sender-name ${getSenderInfo(msg.sender || msg.senderId).role}`}>
                              {getSenderInfo(msg.sender || msg.senderId).name}
                            </div>
                          )}

                          {msg.file ? (
                            <div
                              onClick={() => handleImageClick(msg.file)}
                              style={{ cursor: "pointer" }}
                              className="message-bubble file-message"
                            >
                              <img
                                src={msg.file.content || "/placeholder.svg"}
                                alt={msg.file.name}
                                className="message-image img-thumbnail"
                                style={{ maxWidth: "200px", maxHeight: "150px" }}
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg"
                                }}
                              />
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

                  {/* Enhanced Image Annotation Modal */}
                  <Modal
                    show={showModal}
                    onHide={handleCloseModal}
                    centered
                    size="xl"
                    className="chat-screen-image-annotation-modal"
                  >
                    <Modal.Header closeButton className="chat-screen-modal-header">
                      <Modal.Title className="chat-screen-modal-title">
                        <MdBrush className="chat-screen-title-icon" />
                        {isAnnotating ? 'Annotate Image' : 'View Image'} - {selectedImage?.name}
                      </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="chat-screen-modal-body">
                      {selectedImage && (
                        <div className="chat-screen-annotation-container">
                          {/* Annotation Controls */}
                          {isAnnotating && (
                            <div className="chat-screen-annotation-controls">
                              <div className="chat-screen-controls-row">
                                <div className="chat-screen-controls-left">
                                  <div className="chat-screen-control-group">
                                    <label className="chat-screen-label">Color:</label>
                                    <input
                                      type="color"
                                      value={brushColor}
                                      onChange={(e) => setBrushColor(e.target.value)}
                                      className="chat-screen-color-input"
                                    />
                                  </div>
                                  <div className="chat-screen-control-group">
                                    <label className="chat-screen-label">Size:</label>
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={brushRadius}
                                      onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                                      className="chat-screen-range-input"
                                    />
                                    <span className="chat-screen-size-badge">{brushRadius}px</span>
                                  </div>
                                </div>
                                <div className="chat-screen-controls-right">
                                  <button className="chat-screen-button chat-screen-button-warning" onClick={handleUndo}>
                                    <MdUndo className="chat-screen-icon" />
                                    <span className="chat-screen-button-text">Undo</span>
                                  </button>
                                  <button className="chat-screen-button chat-screen-button-danger" onClick={handleClear}>
                                    <MdClear className="chat-screen-icon" />
                                    <span className="chat-screen-button-text">Clear</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Canvas Container */}
                          <div className="chat-screen-canvas-wrapper">
                            {isAnnotating ? (
                              <div className="chat-screen-canvas-container">
                                <CanvasDraw
                                  ref={canvasRef}
                                  imgSrc={selectedImage?.content}
                                  canvasWidth={Math.min(800, window.innerWidth - 50)}
                                  canvasHeight={isMobile ? 170 : Math.min(600, window.innerHeight - 100)}
                                  loadTimeOffset={10}
                                  brushRadius={brushRadius}
                                  brushColor={brushColor}
                                  lazyRadius={0}
                                  className="chat-screen-canvas"
                                />
                              </div>
                            ) : (
                              <div className="chat-screen-image-container">
                                <img
                                  src={selectedImage?.content || "/placeholder.svg"}
                                  alt={selectedImage?.name}
                                  className="chat-screen-preview-image"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Modal.Body>

                    <Modal.Footer className="chatn-footer">
                      <div className="chatn-footer-container">
                        <div>
                          {!isAnnotating ? (
                            <button
                              onClick={() => setIsAnnotating(true)}
                              className="chatn-button chatn-button-primary"
                            >
                              <MdBrush className="chatn-icon" />
                              Start Annotating
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsAnnotating(false)}
                              className="chatn-button chatn-button-secondary-outline"
                            >
                              View Only
                            </button>
                          )}
                        </div>

                        <div className="chatn-footer-actions">
                          {isAnnotating && (
                            <button
                              onClick={handleSendAnnotation}
                              className="chatn-button chatn-button-success"
                            >
                              <MdSend className="chatn-icon" />
                              Send to Chat
                            </button>
                          )}

                          <button
                            className="chatn-button chatn-button-outline"
                            onClick={handleBase64Download}
                          >
                            <MdAttachment className="chatn-icon" />
                            Download Annotated Image
                          </button>

                          <button
                            onClick={handleCloseModal}
                            className="chatn-button chatn-button-secondary"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </Modal.Footer>

                  </Modal>
                  <form className="message-input-container" onSubmit={handleSubmit}>
                    <input
                      type="file"
                      id="fileUpload"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      disabled={isChatEnded}
                      accept="image/*"
                    />
                    <label htmlFor="fileUpload" className={`attachment-button ${isChatEnded ? "disabled" : ""}`}>
                      <MdAttachment />
                    </label>
                    <input
                      type="text"
                      className="form-control message-input"
                      placeholder="Type your message..."
                      value={message}
                      disabled={isChatEnded}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" className={`send-button ${isChatEnded ? "disabled" : ""}`}>
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
                    <h3>Group Messages</h3>
                    <p>Select a group chat to start the conversation</p>
                    {isMobileView && (
                      <button className="btn btn-primary mt-3" onClick={handleBackToList}>
                        View Group Chats
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupChat
