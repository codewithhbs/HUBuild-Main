"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import "./chat.css"
import {
  MdAttachment,
  MdSend,
  MdArrowBack,
  MdSearch,
  MdPhone,
  MdExpandMore,
  MdUndo,
  MdClear,
  MdBrush,
  MdPinEnd,
  MdFormatSize,
  MdColorize,
  MdReply,
  MdClose,
} from "react-icons/md"
import ScrollToBottom from "react-scroll-to-bottom"
import axios from "axios"
import { GetData } from "../../utils/sessionStoreage"
import toast from "react-hot-toast"
import AccessDenied from "../../components/AccessDenied/AccessDenied"
import { useSocket } from "../../context/SocketContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Modal, Dropdown } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import CanvasDraw from "react-canvas-draw"

const ENDPOINT = "https://www.testapi.helpubuild.in/"
const MAX_FILE_SIZE = 5 * 1024 * 1024

const ManualChat = () => {
  // Existing state management
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isFetchingChatStatus, setIsFetchingChatStatus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [chatData, setChatData] = useState([])
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
  const [downloadUrl, setDownloadUrl] = useState(null)

  // Enhanced Reply functionality states
  const [replyingTo, setReplyingTo] = useState(null)
  const [showReplyOptions, setShowReplyOptions] = useState({})

  // Enhanced Canvas annotation states
  const [brushColor, setBrushColor] = useState("#ff0000")
  const [brushRadius, setBrushRadius] = useState(2)
  const [isAnnotating, setIsAnnotating] = useState(false)
  const canvasRef = useRef()

  // Enhanced Text Annotation States
  const [textElements, setTextElements] = useState([])
  const [isAddingText, setIsAddingText] = useState(false)
  const [selectedTextId, setSelectedTextId] = useState(null)
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState(null)
  const [textSettings, setTextSettings] = useState({
    fontSize: 18,
    color: "#000000",
    fontFamily: "Arial",
  })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [textHistory, setTextHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Add participants mapping for better sender resolution
  const [participantsMap, setParticipantsMap] = useState(new Map())

  const navigate = useNavigate()
  const location = useLocation()
  const textCanvasRef = useRef(null)
  const modalRef = useRef(null)

  // User data from session storage
  const userData = useMemo(() => {
    const data = GetData("user")
    return data ? JSON.parse(data) : null
  }, [])

  const socket = useSocket()

  // Enhanced function to build participants map
  const buildParticipantsMap = useCallback(
    (chatData) => {
      const map = new Map()

      // Add current user
      if (userData) {
        map.set(userData._id, {
          name: "You",
          role: userData.role,
          isCurrentUser: true,
        })
      }

      // Add chat user
      if (chatData?.userId) {
        map.set(chatData.userId._id, {
          name: chatData.userId.name,
          role: "user",
          isCurrentUser: chatData.userId._id === userData?._id,
        })
      }

      // Add providers
      if (chatData?.providerIds && Array.isArray(chatData.providerIds)) {
        chatData.providerIds.forEach((provider) => {
          map.set(provider._id, {
            name: provider.name,
            role: "provider",
            isCurrentUser: provider._id === userData?._id,
          })
        })
      }

      setParticipantsMap(map)
      return map
    },
    [userData],
  )

  // Enhanced getSenderInfo function
  const getSenderInfo = useCallback(
    (senderId) => {
      // First check the participants map
      if (participantsMap.has(senderId)) {
        return participantsMap.get(senderId)
      }

      // Fallback to current user check
      if (senderId === userData?._id) {
        return { name: "You", role: userData?.role, isCurrentUser: true }
      }

      // Fallback to selectedChat check
      if (selectedChat?.userId?._id === senderId) {
        return {
          name: selectedChat.userId.name,
          role: "user",
          isCurrentUser: false,
        }
      }

      // Check providers in selectedChat
      const provider = selectedChat?.providerIds?.find((p) => p._id === senderId)
      if (provider) {
        return {
          name: provider.name,
          role: "provider",
          isCurrentUser: false,
        }
      }

      // Last resort - try to find in messages for any stored sender info
      const messageWithSender = messages.find(
        (msg) => (msg.sender === senderId || msg.senderId === senderId) && msg.senderName,
      )
      if (messageWithSender) {
        return {
          name: messageWithSender.senderName,
          role: messageWithSender.senderRole || "unknown",
          isCurrentUser: false,
        }
      }

      return { name: "Unknown User", role: "unknown", isCurrentUser: false }
    },
    [participantsMap, userData, selectedChat, messages],
  )

  // Enhanced Reply functionality functions
  const handleReplyClick = useCallback(
    (message, messageIndex) => {
      const senderInfo = getSenderInfo(message.sender || message.senderId)

      setReplyingTo({
        ...message,
        messageIndex,
        senderName: senderInfo.name,
        senderRole: senderInfo.role,
        originalTimestamp: message.timestamp,
      })
      setShowReplyOptions({})
    },
    [getSenderInfo],
  )

  const cancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const toggleReplyOptions = useCallback((messageIndex) => {
    setShowReplyOptions((prev) => ({
      ...prev,
      [messageIndex]: !prev[messageIndex],
    }))
  }, [])

  // Enhanced Text Management Functions
  const addTextToHistory = useCallback(
    (elements) => {
      const newHistory = textHistory.slice(0, historyIndex + 1)
      newHistory.push([...elements])
      setTextHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [textHistory, historyIndex],
  )

  const generateTextId = () => `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addTextElement = useCallback(
    (x, y, text) => {
      if (!text.trim()) return

      const newElement = {
        id: generateTextId(),
        text: text.trim(),
        x,
        y,
        fontSize: textSettings.fontSize,
        color: textSettings.color,
        fontFamily: textSettings.fontFamily,
        zIndex: textElements.length + 1,
      }

      const newElements = [...textElements, newElement]
      setTextElements(newElements)
      addTextToHistory(newElements)
      setTextInput("")
      setTextPosition(null)
      setIsAddingText(false)
    },
    [textElements, textSettings, addTextToHistory],
  )

  const updateTextElement = useCallback(
    (id, updates) => {
      const newElements = textElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
      setTextElements(newElements)
      addTextToHistory(newElements)
    },
    [textElements, addTextToHistory],
  )

  const deleteTextElement = useCallback(
    (id) => {
      const newElements = textElements.filter((el) => el.id !== id)
      setTextElements(newElements)
      addTextToHistory(newElements)
    },
    [textElements, addTextToHistory],
  )

  const undoTextAction = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setTextElements([...textHistory[historyIndex - 1]])
    } else if (historyIndex === 0) {
      setHistoryIndex(-1)
      setTextElements([])
    }
  }, [historyIndex, textHistory])

  const redoTextAction = useCallback(() => {
    if (historyIndex < textHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setTextElements([...textHistory[historyIndex + 1]])
    }
  }, [historyIndex, textHistory])

  // Enhanced Canvas Click Handler
  const handleCanvasClick = useCallback(
    (e) => {
      if (!isAddingText) return

      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      setTextPosition({ x, y })
    },
    [isAddingText],
  )

  // Enhanced Text Drag Handlers
  const handleTextMouseDown = useCallback(
    (e, textId) => {
      e.preventDefault()
      e.stopPropagation()

      const textElement = textElements.find((el) => el.id === textId)
      if (!textElement) return

      const rect = e.currentTarget.getBoundingClientRect()
      const offsetX = e.clientX - rect.left - textElement.x
      const offsetY = e.clientY - rect.top - textElement.y

      setDragOffset({ x: offsetX, y: offsetY })
      setSelectedTextId(textId)
      updateTextElement(textId, { isDragging: true })

      const handleMouseMove = (moveEvent) => {
        const canvas = textCanvasRef.current
        if (!canvas) return

        const canvasRect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / canvasRect.width
        const scaleY = canvas.height / canvasRect.height

        const newX = Math.max(0, Math.min(canvas.width, (moveEvent.clientX - canvasRect.left) * scaleX - dragOffset.x))
        const newY = Math.max(
          textSettings.fontSize,
          Math.min(canvas.height, (moveEvent.clientY - canvasRect.top) * scaleY - dragOffset.y),
        )

        updateTextElement(textId, { x: newX, y: newY })
      }

      const handleMouseUp = () => {
        updateTextElement(textId, { isDragging: false })
        setSelectedTextId(null)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [textElements, dragOffset, textSettings.fontSize, updateTextElement],
  )

  // Enhanced Canvas Rendering
  const renderTextOnCanvas = useCallback(() => {
    const canvas = textCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sort by zIndex for proper layering
    const sortedElements = [...textElements].sort((a, b) => a.zIndex - b.zIndex)

    sortedElements.forEach((element) => {
      ctx.font = `${element.fontSize}px ${element.fontFamily}`
      ctx.fillStyle = element.color
      ctx.textBaseline = "top"

      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.fillText(element.text, element.x, element.y)

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Highlight selected text
      if (element.id === selectedTextId) {
        ctx.strokeStyle = "#007bff"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        const textMetrics = ctx.measureText(element.text)
        ctx.strokeRect(element.x - 2, element.y - 2, textMetrics.width + 4, element.fontSize + 4)
        ctx.setLineDash([])
      }
    })
  }, [textElements, selectedTextId])

  // Re-render text when elements change
  useEffect(() => {
    renderTextOnCanvas()
  }, [renderTextOnCanvas])

  // Enhanced Send Annotation Function
  const handleSendAnnotation = async () => {
    setLoading(true)
    if (!canvasRef.current || !selectedImage?.content) return

    try {
      const drawingCanvas = canvasRef.current.canvas.drawing
      const textCanvas = textCanvasRef.current
      const width = drawingCanvas.width
      const height = drawingCanvas.height

      // Create merged canvas
      const mergedCanvas = document.createElement("canvas")
      mergedCanvas.width = width
      mergedCanvas.height = height
      const ctx = mergedCanvas.getContext("2d")

      const backgroundImg = new Image()
      backgroundImg.crossOrigin = "anonymous"
      backgroundImg.src = selectedImage.content

      backgroundImg.onload = () => {
        // Draw background image
        ctx.drawImage(backgroundImg, 0, 0, width, height)

        // Draw drawing annotations
        ctx.drawImage(drawingCanvas, 0, 0, width, height)

        // Draw text annotations
        if (textCanvas) {
          ctx.drawImage(textCanvas, 0, 0, width, height)
        }

        const mergedDataUrl = mergedCanvas.toDataURL("image/png")

        const annotatedFile = {
          name: `annotated_${selectedImage?.name || "image.png"}`,
          type: "image/png",
          content: mergedDataUrl,
        }

        // Get current user info for sender details
        const currentUserInfo = getSenderInfo(userData._id)

        socket.emit("manual_file_upload", {
          room: currentRoomId,
          fileData: annotatedFile,
          senderId: userData._id,
          senderName: currentUserInfo.name,
          senderRole: currentUserInfo.role,
          timestamp: new Date().toISOString(),
          ...(replyingTo && {
            replyTo: {
              messageId: replyingTo.messageIndex.toString(),
              text: replyingTo.text || (replyingTo.file ? "Image" : ""),
              senderName: replyingTo.senderName,
              senderRole: replyingTo.senderRole,
              isFile: !!replyingTo.file,
              timestamp: replyingTo.originalTimestamp,
            },
          }),
        })

        toast.success("Annotated image sent to chat!")
        setShowModal(false)
        setIsAnnotating(false)
        setTextElements([])
        setTextHistory([])
        setHistoryIndex(-1)
        if (replyingTo) cancelReply()
      }

      backgroundImg.onerror = () => {
        toast.error("Failed to load background image")
      }
    } catch (error) {
      toast.error("Failed to send annotated image")
      console.error("Error sending annotation:", error)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced Clear Function
  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
    setTextElements([])
    setTextHistory([])
    setHistoryIndex(-1)
  }

  // Enhanced Undo Function
  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo()
    }
    undoTextAction()
  }

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle image click
  const handleImageClick = (image) => {
    setSelectedImage(image)
    setShowModal(true)
    setIsAnnotating(false)
    setTextElements([])
    setTextHistory([])
    setHistoryIndex(-1)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false)
    setIsAnnotating(false)
    setTextElements([])
    setTextHistory([])
    setHistoryIndex(-1)
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
  }

  // Download URL effect
  useEffect(() => {
    if (!selectedImage?.content) return

    let url
    if (typeof selectedImage.content === "string" && selectedImage.content.startsWith("data:image")) {
      url = selectedImage.content
    } else if (Array.isArray(selectedImage.content)) {
      const byteArray = new Uint8Array(selectedImage.content)
      const blob = new Blob([byteArray], { type: selectedImage.type || "image/jpeg" })
      url = URL.createObjectURL(blob)
    }

    setDownloadUrl(url)

    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
    }
  }, [selectedImage])

  // Enhanced download function
  const handleBase64Download = () => {
    try {
      const base64Data = downloadUrl
      if (!base64Data || typeof base64Data !== "string" || !base64Data.startsWith("data:")) {
        console.error("Invalid base64 data")
        return
      }

      const parts = base64Data.split(",")
      const byteString = atob(parts[1])
      const mimeString = parts[0].split(":")[1].split(";")[0]

      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }

      const blob = new Blob([ia], { type: mimeString })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = "annotated-image.png"
      link.target = "_blank"
      document.body.appendChild(link)

      requestAnimationFrame(() => {
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      })
    } catch (error) {
      console.error("Error during base64 download:", error)
    }
  }

  const id = userData?._id || ""
  const role = userData?.role || ""

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
      toast.error(error?.response?.data?.message)
    } finally {
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

    const phoneNumber = member?.phoneNumber

    if (!phoneNumber) {
      toast.error(`No phone number available for ${member?.name || "this member"}`)
      return
    }

    const cleanedNumber = phoneNumber.replace(/[^+\d]/g, "")

    try {
      if (cleanedNumber) {
        const room = selectedChat?._id
        const callFrom = userData.mobileNumber || userData.PhoneNumber
        const callTo = member?.phoneNumber

        console.log("all detail =", room, callFrom, callTo)

        const res = await axios.post(`${ENDPOINT}api/v1/create_call_for_free`, { roomId: room, callFrom, callTo })
        toast.success(`Calling ${member.name}...`)
      } else {
        toast.error("Invalid phone number")
      }
    } catch (error) {
      console.log("Internal server error", error)
    } finally {
      setLoading(false)
    }
  }, [])

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

        setChatData(chatData || {})
        setSelectedChat(chatData) // Set this before setting messages

        // Build participants map first
        buildParticipantsMap(chatData)

        // Then set messages with enhanced sender info
        const enhancedMessages = (chatData.messages || []).map((msg) => {
          const senderInfo = getSenderInfo(msg.sender)
          return {
            ...msg,
            senderName: senderInfo.name,
            senderRole: senderInfo.role,
          }
        })

        setMessages(enhancedMessages)
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
    [userData, socket, getGroupMembers, buildParticipantsMap, getSenderInfo],
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

    // Enhanced message handler to properly handle files and replies
    socket.on("return_message", (data) => {
      console.log("Received message from others:", data)

      // Get sender info for the incoming message
      const senderInfo = getSenderInfo(data.sender || data.senderId)

      // Create message object with proper structure and sender info
      const messageObj = {
        ...data,
        senderId: data.sender || data.senderId,
        sender: data.sender || data.senderId,
        senderName: data.senderName || senderInfo.name,
        senderRole: data.senderRole || senderInfo.role,
      }

      // If it's a file message, ensure file structure is correct
      if (data.file) {
        messageObj.file = {
          name: data.file.name,
          type: data.file.type,
          content: data.file.content,
        }
      }

      // Handle reply data
      if (data.replyTo) {
        messageObj.replyTo = data.replyTo
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
  }, [id, socket, userData, selectedProviderIds, getSenderInfo])

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

          // Get current user info for sender details
          const currentUserInfo = getSenderInfo(userData._id)

          socket.emit("manual_file_upload", {
            room: currentRoomId,
            fileData,
            senderId: userData._id,
            senderName: currentUserInfo.name,
            senderRole: currentUserInfo.role,
            timestamp: new Date().toISOString(),
            ...(replyingTo && {
              replyTo: {
                messageId: replyingTo.messageIndex.toString(),
                text: replyingTo.text || (replyingTo.file ? "Image" : ""),
                senderName: replyingTo.senderName,
                senderRole: replyingTo.senderRole,
                isFile: !!replyingTo.file,
                timestamp: replyingTo.originalTimestamp,
              },
            }),
          })

          toast.dismiss(uploadingToast)
          if (replyingTo) cancelReply()
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
    [userData, currentRoomId, socket, replyingTo, cancelReply, getSenderInfo],
  )

  // Handle message submission with reply support
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
        // Get current user info for sender details
        const currentUserInfo = getSenderInfo(userData._id)

        const payload = {
          room: currentRoomId,
          message: trimmedMessage,
          senderId: userData._id,
          senderName: currentUserInfo.name,
          senderRole: currentUserInfo.role,
          timestamp: new Date().toISOString(),
          role: userData.role,
          ...(replyingTo && {
            replyTo: {
              messageId: replyingTo.messageIndex.toString(),
              text: replyingTo.text || (replyingTo.file ? "Image" : ""),
              senderName: replyingTo.senderName,
              senderRole: replyingTo.senderRole,
              isFile: !!replyingTo.file,
              timestamp: replyingTo.originalTimestamp,
            },
          }),
        }

        socket.emit("manual_message", payload)
        setMessage("")
        if (replyingTo) cancelReply()
      } catch (error) {
        toast.error("Failed to send message")
      }
    },
    [message, userData, currentRoomId, socket, validateMessageContent, replyingTo, cancelReply, getSenderInfo],
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

  const isMobile = window.innerWidth <= 710
  const canvasWidth = Math.min(800, window.innerWidth - 50)
  const canvasHeight = isMobile ? 170 : Math.min(600, window.innerHeight - 100)

  if (!userData) {
    return <AccessDenied />
  }

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center bg-light"
        style={{ height: "100dvh", textAlign: "center" }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{
            width: "3rem",
            height: "3rem",
            borderColor: "#eab936",
            borderRightColor: "transparent",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="fw-semibold mb-1 mt-4" style={{ color: "#eab936" }}>
          Fetching Live Projects...
        </h5>
        <small className="text-muted">Please wait while we prepare your workspace.</small>
      </div>
    )
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
                              selectedChat?.groupName || "Group",
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

                  {chatData?.PaymentStatus?.toLowerCase() !== "paid" ? (
                    <div className="chatn-payment-warning">
                      <div className="chatn-payment-box">
                        <h2 className="chatn-warning-title">Access Restricted</h2>
                        <p className="chatn-warning-text">
                          To join this group conversation, please complete your payment.
                        </p>
                        <p className="chatn-warning-text-muted">
                          Contact our <strong>support team</strong> for assistance.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ScrollToBottom className="chatn-messages-container" initialScrollBehavior="smooth">
                      {messages.length === 0 ? (
                        <div className="chatn-no-messages">
                          <p className="chatn-no-messages-text">Send a message to start the group conversation.</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const isOwn = msg.sender === id
                          const senderInfo = getSenderInfo(msg.sender || msg.senderId)

                          return (
                            <div key={idx} className={`chatn-message ${isOwn ? "chatn-outgoing" : "chatn-incoming"}`}>
                              {!isOwn && (
                                <div className={`chatn-sender-name ${senderInfo.role}`}>{senderInfo.name}</div>
                              )}

                              {/* Enhanced Reply indicator - WhatsApp style */}
                              {msg.replyTo && (
                                <div className="chatn-reply-indicator">
                                  <div className="chatn-reply-line"></div>
                                  <div className="chatn-reply-content">
                                    <div className="chatn-reply-sender">{msg.replyTo.senderName}</div>
                                    <div className="chatn-reply-text">
                                      {msg.replyTo.isFile ? "📷 Image" : msg.replyTo.text}
                                    </div>
                                    <div className="chatn-reply-time">
                                      {new Date(msg.replyTo.timestamp).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {msg.file ? (
                                <div className="chatn-message-bubble chatn-file-message">
                                  <img
                                    src={msg.file.content || "/placeholder.svg"}
                                    alt={msg.file.name}
                                    className="chatn-message-image"
                                    onClick={() => handleImageClick(msg.file)}
                                    style={{ cursor: "pointer" }}
                                    onError={(e) => (e.target.src = "/placeholder.svg")}
                                  />
                                  <div className="chatn-message-actions">
                                    <div className="chatn-message-time">
                                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                    <button
                                      className="chatn-reply-button"
                                      onClick={() => handleReplyClick(msg, idx)}
                                      title="Reply to this message"
                                    >
                                      <MdReply size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="chatn-message-bubble">
                                  <div className="chatn-message-text">{msg.text}</div>
                                  <div className="chatn-message-actions">
                                    <div className="chatn-message-time">
                                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                    <button
                                      className="chatn-reply-button"
                                      onClick={() => handleReplyClick(msg, idx)}
                                      title="Reply to this message"
                                    >
                                      <MdReply size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </ScrollToBottom>
                  )}

                  {/* Enhanced Image Annotation Modal */}
                  <Modal
                    show={showModal}
                    onHide={handleCloseModal}
                    centered
                    size="xl"
                    className="chat-screen-image-annotation-modal"
                    ref={modalRef}
                  >
                    <Modal.Header closeButton className="chat-screen-modal-header">
                      <Modal.Title className="chat-screen-modal-title">
                        <MdBrush className="chat-screen-title-icon" />
                        {isAnnotating ? "Annotate Image" : "View Image"} - {selectedImage?.name}
                      </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="chat-screen-modal-body">
                      {selectedImage && (
                        <div className="chat-screen-annotation-container">
                          {/* Enhanced Annotation Controls */}
                          {isAnnotating && (
                            <div className="chat-screen-annotation-controls">
                              <div className="chat-screen-controls-row">
                                <div className="chat-screen-controls-left">
                                  {/* Drawing Controls */}
                                  <div className="chat-screen-control-group">
                                    <label className="chat-screen-label">
                                      <MdColorize className="me-1" />
                                      Brush Color:
                                    </label>
                                    <input
                                      type="color"
                                      value={brushColor}
                                      onChange={(e) => setBrushColor(e.target.value)}
                                      className="chat-screen-color-input"
                                    />
                                  </div>

                                  <div className="chat-screen-control-group">
                                    <label className="chat-screen-label">Brush Size:</label>
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={brushRadius}
                                      onChange={(e) => setBrushRadius(Number.parseInt(e.target.value))}
                                      className="chat-screen-range-input"
                                    />
                                    <span className="chat-screen-size-badge">{brushRadius}px</span>
                                  </div>

                                  {/* Text Controls */}
                                  <div className="chat-screen-text-controls">
                                    <div className="chat-screen-control-group">
                                      <label className="chat-screen-label">
                                        <MdFormatSize className="me-1" />
                                        Text Size:
                                      </label>
                                      <input
                                        type="range"
                                        min="12"
                                        max="48"
                                        value={textSettings.fontSize}
                                        onChange={(e) =>
                                          setTextSettings((prev) => ({
                                            ...prev,
                                            fontSize: Number.parseInt(e.target.value),
                                          }))
                                        }
                                        className="chat-screen-range-input"
                                      />
                                      <span className="chat-screen-size-badge">{textSettings.fontSize}px</span>
                                    </div>

                                    <div className="chat-screen-control-group">
                                      <label className="chat-screen-label">Text Color:</label>
                                      <input
                                        type="color"
                                        value={textSettings.color}
                                        onChange={(e) =>
                                          setTextSettings((prev) => ({ ...prev, color: e.target.value }))
                                        }
                                        className="chat-screen-color-input"
                                      />
                                    </div>

                                    <div className="chat-screen-control-group">
                                      <label className="chat-screen-label">Font:</label>
                                      <select
                                        value={textSettings.fontFamily}
                                        onChange={(e) =>
                                          setTextSettings((prev) => ({ ...prev, fontFamily: e.target.value }))
                                        }
                                        className="form-select form-select-sm"
                                      >
                                        <option value="Arial">Arial</option>
                                        <option value="Helvetica">Helvetica</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Georgia">Georgia</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div className="chat-screen-controls-right">
                                  <button
                                    className={`chat-screen-button ${isAddingText ? "chat-screen-button-success" : "chat-screen-button-primary"}`}
                                    onClick={() => setIsAddingText(!isAddingText)}
                                  >
                                    <MdPinEnd className="chat-screen-icon" />
                                    <span className="chat-screen-button-text">
                                      {isAddingText ? "Adding Text..." : "Add Text"}
                                    </span>
                                  </button>

                                  <button
                                    className="chat-screen-button chat-screen-button-warning"
                                    onClick={handleUndo}
                                  >
                                    <MdUndo className="chat-screen-icon" />
                                    <span className="chat-screen-button-text">Undo</span>
                                  </button>

                                  <button
                                    className="chat-screen-button chat-screen-button-danger"
                                    onClick={handleClear}
                                  >
                                    <MdClear className="chat-screen-icon" />
                                    <span className="chat-screen-button-text">Clear All</span>
                                  </button>
                                </div>
                              </div>

                              {/* Text Elements List */}
                              {textElements.length > 0 && (
                                <div className="chat-screen-text-elements-list">
                                  <h6 className="mb-2">Text Elements:</h6>
                                  <div className="d-flex flex-wrap gap-2">
                                    {textElements.map((element) => (
                                      <div
                                        key={element.id}
                                        className={`chat-screen-text-element-item ${selectedTextId === element.id ? "selected" : ""}`}
                                        onClick={() => setSelectedTextId(element.id)}
                                      >
                                        <span className="text-truncate" style={{ maxWidth: "100px" }}>
                                          {element.text}
                                        </span>
                                        <button
                                          className="btn btn-sm btn-outline-danger ms-1"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            deleteTextElement(element.id)
                                          }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="chat-screen-canvas-wrapper" style={{ position: "relative" }}>
                            {isAnnotating ? (
                              <div className="chat-screen-canvas-container" style={{ position: "relative" }}>
                                {/* Drawing Canvas */}
                                <CanvasDraw
                                  ref={canvasRef}
                                  imgSrc={selectedImage?.content}
                                  canvasWidth={canvasWidth}
                                  canvasHeight={canvasHeight}
                                  loadTimeOffset={10}
                                  brushRadius={brushRadius}
                                  brushColor={brushColor}
                                  lazyRadius={0}
                                  className="chat-screen-canvas"
                                />

                                {/* Text Overlay Canvas (only for placing input) */}
                                <canvas
                                  ref={textCanvasRef}
                                  width={canvasWidth}
                                  height={canvasHeight}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    pointerEvents: isAddingText ? "auto" : "none",
                                    zIndex: 10,
                                    cursor: isAddingText ? "crosshair" : "default",
                                  }}
                                  onClick={handleCanvasClick}
                                />

                                {/* Text Input Field */}
                                {textPosition && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: textPosition.y,
                                      left: textPosition.x,
                                      zIndex: 20,
                                    }}
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={textInput}
                                      onChange={(e) => setTextInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && textInput.trim()) {
                                          addTextElement(textPosition.x, textPosition.y, textInput)
                                        } else if (e.key === "Escape") {
                                          setTextInput("")
                                          setTextPosition(null)
                                          setIsAddingText(false)
                                        }
                                      }}
                                      onBlur={() => {
                                        if (textInput.trim()) {
                                          addTextElement(textPosition.x, textPosition.y, textInput)
                                        } else {
                                          setTextPosition(null)
                                          setIsAddingText(false)
                                        }
                                      }}
                                      className="form-control form-control-sm"
                                      style={{
                                        fontSize: `${textSettings.fontSize}px`,
                                        fontFamily: textSettings.fontFamily,
                                        color: textSettings.color,
                                        minWidth: "150px",
                                      }}
                                      placeholder="Enter text..."
                                    />
                                  </div>
                                )}
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
                            <button onClick={() => setIsAnnotating(true)} className="chatn-button chatn-button-primary">
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
                              disabled={loading}
                            >
                              <MdSend className="chatn-icon" />
                              {loading ? "Sending..." : "Send to Chat"}
                            </button>
                          )}
                          <button className="chatn-button chatn-button-outline" onClick={handleBase64Download}>
                            <MdAttachment className="chatn-icon" />
                            Download
                          </button>
                          <button onClick={handleCloseModal} className="chatn-button chatn-button-secondary">
                            Close
                          </button>
                        </div>
                      </div>
                    </Modal.Footer>
                  </Modal>

                  {/* Enhanced Reply Bar - WhatsApp style */}
                  {replyingTo && (
                    <div className="chatn-reply-bar">
                      <div className="chatn-reply-info">
                        <div className="chatn-reply-header">
                          <MdReply className="chatn-reply-icon" />
                          <span className="chatn-reply-label">Replying to {replyingTo.senderName}</span>
                        </div>
                        <div className="chatn-reply-preview">{replyingTo.file ? "📷 Image" : replyingTo.text}</div>
                        <div className="chatn-reply-original-time">
                          {new Date(replyingTo.originalTimestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <button className="chatn-reply-cancel" onClick={cancelReply}>
                        <MdClose size={18} />
                      </button>
                    </div>
                  )}

                  <form className="chatn-input-wrapper" onSubmit={handleSubmit}>
                    <input
                      type="file"
                      id="chatnFileUpload"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      disabled={isChatEnded || chatData?.PaymentStatus?.toLowerCase() !== "paid"}
                      accept="image/*"
                    />

                    <label
                      htmlFor="chatnFileUpload"
                      className={`chatn-attachment-button ${
                        isChatEnded || chatData?.PaymentStatus?.toLowerCase() !== "paid" ? "disabled" : ""
                      }`}
                    >
                      <MdAttachment />
                    </label>

                    <input
                      type="text"
                      className="chatn-text-input"
                      placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : "Type your message..."}
                      value={message}
                      disabled={isChatEnded || chatData?.PaymentStatus?.toLowerCase() !== "paid"}
                      onChange={(e) => setMessage(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="chatn-send-button"
                      disabled={isChatEnded || chatData?.PaymentStatus?.toLowerCase() !== "paid" || !message.trim()}
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

export default ManualChat
