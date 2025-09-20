"use client"
import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { debounce } from "lodash"
import "./chat.css"
import {
  MdAttachment,
  MdSend,
  MdArrowBack,
  MdSearch,
  MdPhone,
  MdExpandMore,
  MdUndo,
  MdRedo,
  MdClear,
  MdBrush,
  MdPinEnd,
  MdReply,
  MdClose,
  MdRectangle,
  MdCircle,
  MdArrowForward,
  MdZoomIn,
  MdZoomOut,
  MdCenterFocusWeak,
  MdOutlineSettings
} from "react-icons/md"
import { IoMdArrowRoundBack } from "react-icons/io";
import { TfiText } from "react-icons/tfi"
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
import { Pencil, Hand, Eye } from "lucide-react"
import VoiceRecorder from "./VoiceRecorder" // Adjust the path as needed

const ENDPOINT = "https://testapi.dessobuild.com/"
const MAX_FILE_SIZE = 5 * 1024 * 1024

const useAdjustedMousePosition = (containerRef, zoomLevel, panOffset) => {
  const getAdjustedMousePosition = (e) => {
    const container = containerRef.current
    if (!container) return { x: 0, y: 0 }

    const rect = container.getBoundingClientRect()
    const point = e && e.touches && e.touches[0] ? e.touches[0] : e
    console.log("Point", point)

    const clientX = point && typeof point.clientX === "number" ? point.clientX : 0
    const clientY = point && typeof point.clientY === "number" ? point.clientY : 0

    console.log("ClientX:", clientX, "ClientY:", clientY)

    // Default calculation for desktop or larger screens
    let x = (clientX - rect.left - panOffset.x) / zoomLevel
    let y = (clientY - rect.top - panOffset.y) / zoomLevel

    console.log("Initial X:", x, "Initial Y:", y)

    if (window.innerWidth < 361) {
      // Extra small screens
      console.log("361 Extra Small Mobile detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 240; // push more for very small screens

      console.log("After Adjustments (XS) - X:", x, "Y:", y);

    } else if (window.innerWidth < 376) {
      // Extra small screens
      console.log("376 Extra Small Mobile detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 140; // push more for very small screens

      console.log("After Adjustments (XS) - X:", x, "Y:", y);

    } else if (window.innerWidth < 391) {
      // Extra small screens
      console.log("391 Extra Small Mobile detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 400; // push more for very small screens

      console.log("After Adjustments (XS) - X:", x, "Y:", y);

    } else if (window.innerWidth < 415) {
      // Extra small screens
      console.log("415 Extra Small Mobile detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 500; // push more for very small screens

      console.log("After Adjustments (XS) - X:", x, "Y:", y);

    } else if (window.innerWidth < 431) {
      // Extra small screens
      console.log("431 Extra Small Mobile detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 620; // push more for very small screens

      console.log("After Adjustments (XS) - X:", x, "Y:", y);

    } else if (window.innerWidth < 468) {
      // Extra small screens
      console.log("Extra Small Mobile detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 120; // push more for very small screens

      console.log("After Adjustments (XS) - X:", x, "Y:", y);

    } else if (window.innerWidth < 768) {
      // Regular mobile
      console.log("Mobile screen detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 350; // normal mobile shift

      console.log("After Adjustments (SM) - X:", x, "Y:", y);

    } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      // Tablets
      console.log("Tablet screen detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y -= 200; // smaller shift for tablets

      console.log("After Adjustments (MD) - X:", x, "Y:", y);

    } else {
      // Desktops
      console.log("Large screen detected. Adjusting position...");
      console.log("Before Adjustments - X:", x, "Y:", y);

      x -= 0;
      y += 50; // maybe move down slightly on big screens

      console.log("After Adjustments (LG) - X:", x, "Y:", y);
    }




    console.log("Final X:", x, "Final Y:", y)
    return { x, y }
  }

  return getAdjustedMousePosition
}



const ManualChat = () => {
  // Existing state management
  // const navigate = useNavigate();
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
  const [activeMobileToolSection, setActiveMobileToolSection] = useState(null)
  const [isChatOnGoing, setIsChatOnGoing] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [nextPath, setNextPath] = useState(null)
  const [isUserConfirming, setIsUserConfirming] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [connectedProviders, setConnectedProviders] = useState(new Set())
  const [groupMembers, setGroupMembers] = useState([])
  const [isChatEnded, setIsChatEnded] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)

  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Add state for dynamic canvas dimensions
  const [originalWidth, setOriginalWidth] = useState(800)
  const [originalHeight, setOriginalHeight] = useState(600)

  // Add new state for unified history
  const [annotationHistory, setAnnotationHistory] = useState([])
  const [pendingDataURL, setPendingDataURL] = useState(null)
  const [annotationHistoryIndex, setAnnotationHistoryIndex] = useState(-1)
  const [hasErased, setHasErased] = useState(false)
  // Add state to track ongoing drawing action
  const [isAnnotating, setIsAnnotating] = useState(false)
  const [isDrawing, setIsDrawing] = useState(isAnnotating)

  // Enhanced Reply functionality states
  const [replyingTo, setReplyingTo] = useState(null)
  const [showReplyOptions, setShowReplyOptions] = useState({})

  // Enhanced Canvas annotation states
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushRadius, setBrushRadius] = useState(2)
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
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    textAlign: "left",
    backgroundColor: "transparent",
    padding: 4,
  })
  useEffect(() => {
    if (selectedImage?.content && showModal && containerRef.current) {
      const img = new Image()
      img.src = selectedImage.content
      img.onload = () => {
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const containerWidth = rect.width
        const containerHeight = rect.height
        const imgWidth = img.naturalWidth
        const imgHeight = img.naturalHeight

        // Calculate zoom to fit image within container, capped at 100%
        const zoomToFitWidth = (containerWidth - 20) / imgWidth // Add padding
        const zoomToFitHeight = (containerHeight - 20) / imgHeight // Add padding
        const newZoom = Math.min(zoomToFitWidth, zoomToFitHeight, 1)

        // Set canvas dimensions to image's natural size
        setOriginalWidth(imgWidth)
        setOriginalHeight(imgHeight)

        // Center the image
        const scaledWidth = imgWidth * newZoom
        const scaledHeight = imgHeight * newZoom
        const offsetX = (containerWidth - scaledWidth) / 2
        const offsetY = (containerHeight - scaledHeight) / 2

        setZoomLevel(newZoom)
        setPanOffset({ x: offsetX, y: offsetY })
      }
      img.onerror = () => {
        console.error("Failed to load image for sizing")
        setOriginalWidth(800)
        setOriginalHeight(600)
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const offsetX = (rect.width - 800) / 2
        const offsetY = (rect.height - 600) / 2
        setZoomLevel(1)
        setPanOffset({ x: offsetX, y: offsetY })
      }
    }
  }, [selectedImage, showModal])

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [textHistory, setTextHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditingText, setIsEditingText] = useState(false)
  const [editingTextId, setEditingTextId] = useState(null)
  const [editingTextValue, setEditingTextValue] = useState("")
  const [groupName, setGroupName] = useState("")
  const [isEditingGroupName, setIsEditingGroupName] = useState(false)

  // Enhanced Drawing Tool States
  const [drawingTool, setDrawingTool] = useState("brush") // brush, rectangle, circle, arrow, line, eraser
  const [shapes, setShapes] = useState([])
  const [isDrawingShape, setIsDrawingShape] = useState(false)
  const [shapeStart, setShapeStart] = useState(null)
  const [currentShape, setCurrentShape] = useState(null)

  // Enhanced Eraser States
  const [eraserRadius, setEraserRadius] = useState(10)

  // Zoom functionality states
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  // Add ref for previous zoom level
  const prevZoomRef = useRef(1)

  // Add temp canvas ref for synchronous bitmap preservation during zoom
  const tempCanvasRef = useRef(null)

  // Pinch zoom states
  const [isPinching, setIsPinching] = useState(false)
  const [lastPinchDistance, setLastPinchDistance] = useState(0)
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 })

  // Add participants mapping for better sender resolution
  const [participantsMap, setParticipantsMap] = useState(new Map())

  const navigate = useNavigate()
  const location = useLocation()
  const textCanvasRef = useRef()
  const modalRef = useRef()
  const editTextInputRef = useRef()
  const containerRef = useRef()
  const shapeCanvasRef = useRef()

  // Custom hook for adjusted mouse position
  const getAdjustedMousePosition = useAdjustedMousePosition(containerRef, zoomLevel, panOffset)

  // User data from session storage
  const userData = useMemo(() => {
    const data = GetData("user")
    return data ? JSON.parse(data) : null
  }, [])

  const socket = useSocket()

  // Stable refs to avoid stale closures in debounced saver
  const annotationHistoryIndexRef = useRef(-1)
  const suppressHistoryRef = useRef(false)
  const stateForHistoryRef = useRef({
    textElements: [],
    shapes: [],
    zoomLevel: 1,
    panOffset: { x: 0, y: 0 },
    brushColor: "#000000",
    brushRadius: 2,
    eraserRadius: 10,
    drawingTool: "brush",
    textSettings: {
      fontSize: 18,
      color: "#000000",
      fontFamily: "Arial",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "left",
      backgroundColor: "transparent",
      padding: 4,
    },
  })

  useEffect(() => {
    annotationHistoryIndexRef.current = annotationHistoryIndex
  }, [annotationHistoryIndex])

  useEffect(() => {
    stateForHistoryRef.current = {
      textElements,
      shapes,
      zoomLevel,
      panOffset,
      brushColor,
      brushRadius,
      eraserRadius,
      drawingTool,
      textSettings,
    }
  }, [textElements, shapes, zoomLevel, panOffset, brushColor, brushRadius, eraserRadius, drawingTool, textSettings])

  // Stable debounced save function that reads from refs and avoids auto-increment loops
  const saveAnnotationState = useRef(
    debounce(() => {
      if (suppressHistoryRef.current) return
      console.log("Saving annotation state...")

      const {
        textElements: te,
        shapes: sh,
        zoomLevel: zl,
        panOffset: po,
        brushColor: bc,
        brushRadius: br,
        eraserRadius: er,
        drawingTool: dt,
        textSettings: ts,
      } = stateForHistoryRef.current

      const canvasVector = canvasRef.current ? canvasRef.current.getSaveData() : null
      const canvasRaster = hasErased && canvasRef.current
        ? canvasRef.current.canvas.drawing.toDataURL("image/png")
        : null

      const currentState = {
        canvasVector,
        canvasRaster,
        textElements: [...te],
        shapes: [...sh],
        zoom: zl,
        panOffset: { ...po },
        brushColor: bc,
        brushRadius: br,
        eraserRadius: er,
        drawingTool: dt,
        textSettings: { ...ts },
      }

      setAnnotationHistory((prev) => {
        const baseIndex = Math.min(
          Math.max(annotationHistoryIndexRef.current, -1),
          prev.length - 1,
        )
        const effective = baseIndex >= 0 ? prev.slice(0, baseIndex + 1) : []
        const last = effective.length > 0 ? effective[effective.length - 1] : null
        const hasChanged =
          !last || JSON.stringify(last) !== JSON.stringify(currentState)
        if (!hasChanged) return prev

        const next = [...effective, currentState]
        const capped = next.slice(-50)
        const nextIndex = capped.length - 1
        if (annotationHistoryIndexRef.current !== nextIndex) {
          annotationHistoryIndexRef.current = nextIndex
          setAnnotationHistoryIndex(nextIndex)
        }
        console.log("New history length:", capped.length, "index:", nextIndex)
        return capped
      })

      if (!currentState.canvasRaster) setHasErased(false)
    }, 150)
  ).current

  // Scale canvas drawings when zoom changes
  useEffect(() => {
    if (pendingDataURL && canvasRef.current && isAnnotating) {
      const drawingCanvas = canvasRef.current.canvas.drawing
      const ctx = drawingCanvas.getContext("2d")
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
      const img = new Image()
      img.src = pendingDataURL
      img.onload = () => {
        ctx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height)
        setPendingDataURL(null)
      }
      img.onerror = () => {
        console.error("Failed to load pending image")
        setPendingDataURL(null)
      }
    }
  }, [pendingDataURL, isAnnotating])

  // Handle zoom changes - preserve all content properly
  useEffect(() => {
    if (suppressHistoryRef.current) return
    if (canvasRef.current && isAnnotating) {
      const oldZoom = prevZoomRef.current;
      if (zoomLevel !== oldZoom) {
        // Always scale the vector data first
        const saveDataStr = canvasRef.current.getSaveData();
        if (saveDataStr && saveDataStr !== '{"lines":[]}') {
          try {
            const saveData = JSON.parse(saveDataStr);
            if (saveData && Array.isArray(saveData.lines)) {
              const scaleFactor = zoomLevel / oldZoom;
              saveData.lines.forEach((line) => {
                if (line && Array.isArray(line.points)) {
                  line.points.forEach((pt) => {
                    if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
                      pt.x *= scaleFactor;
                      pt.y *= scaleFactor;
                    }
                  });
                }
                if (line && typeof line.brushRadius === 'number') {
                  line.brushRadius *= scaleFactor;
                }
              });
              canvasRef.current.loadSaveData(JSON.stringify(saveData), true);
            }
          } catch (e) {
            console.error("Failed to scale canvas data", e);
          }
        }

        // If there's erased content, overlay it on top of the scaled vector data
        if (hasErased && tempCanvasRef.current) {
          const drawingCanvas = canvasRef.current.canvas.drawing;
          const ctx = drawingCanvas.getContext("2d");
          // Draw the preserved erased content on top of the scaled vector data
          ctx.drawImage(tempCanvasRef.current, 0, 0, drawingCanvas.width, drawingCanvas.height);
          tempCanvasRef.current = null;
        }

        prevZoomRef.current = zoomLevel;
      }
    }
  }, [zoomLevel, isAnnotating, hasErased]);

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

  // Modified addTextToHistory to integrate with unified history
  const addTextToHistory = useCallback(
    (elements) => {
      setTextElements(elements)
      saveAnnotationState()
    },
    [saveAnnotationState],
  )

  // Update relevant useEffect and event handlers to save state after changes
  useEffect(() => {
    // Save initial state when starting annotation
    if (isAnnotating && annotationHistory.length === 0) {
      saveAnnotationState()
    }
  }, [isAnnotating, saveAnnotationState])

  const generateTextId = () => `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Modified addTextElement to save state only once
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
        fontWeight: textSettings.fontWeight,
        fontStyle: textSettings.fontStyle,
        textDecoration: textSettings.textDecoration,
        textAlign: textSettings.textAlign,
        backgroundColor: textSettings.backgroundColor,
        padding: textSettings.padding,
        zIndex: textElements.length + 1,
        rotation: 0,
      }

      const newElements = [...textElements, newElement]
      setTextElements(newElements)
      saveAnnotationState()
      setTextInput("")
      setTextPosition(null)
      setIsAddingText(false)
    },
    [textElements, textSettings, saveAnnotationState],
  )

  // Modified updateTextElement to save state only once
  const updateTextElement = useCallback(
    (id, updates) => {
      const newElements = textElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
      setTextElements(newElements)
      saveAnnotationState()
    },
    [textElements, saveAnnotationState],
  )

  // Modified deleteTextElement to save state only once
  const deleteTextElement = useCallback(
    (id) => {
      const newElements = textElements.filter((el) => el.id !== id)
      setTextElements(newElements)
      saveAnnotationState()
      setSelectedTextId(null)
    },
    [textElements, saveAnnotationState],
  )

  // Handle drag enter
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)

      const file = e.dataTransfer.files[0]
      if (!file) {
        toast.error("No file dropped")
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size should not exceed 5MB")
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
          setSelectedImage(fileData)
          setIsAnnotating(true) // Enable annotation mode for the new image
          setTextElements([])
          setShapes([])
          setAnnotationHistory([])
          setAnnotationHistoryIndex(-1)
          if (canvasRef.current) {
            canvasRef.current.clear()
          }
        } catch (error) {
          toast.error("Failed to process dropped image")
          console.error("Error processing dropped image:", error)
        }
      }

      reader.onerror = () => {
        toast.error("Failed to read dropped image")
      }

      reader.readAsDataURL(file)
    },
    [MAX_FILE_SIZE],
  )

  // Modified duplicateTextElement to save state only once
  const duplicateTextElement = useCallback(
    (id) => {
      const element = textElements.find((el) => el.id === id)
      if (!element) return

      const newElement = {
        ...element,
        id: generateTextId(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: textElements.length + 1,
      }

      const newElements = [...textElements, newElement]
      setTextElements(newElements)
      saveAnnotationState()
    },
    [textElements, saveAnnotationState],
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

  // Enhanced Eraser Functions
  const checkShapeCollision = useCallback(
    (x, y, radius) => {
      return shapes.filter((shape) => {
        switch (shape.type) {
          case "rectangle":
            const rectLeft = Math.min(shape.startX, shape.endX)
            const rectRight = Math.max(shape.startX, shape.endX)
            const rectTop = Math.min(shape.startY, shape.endY)
            const rectBottom = Math.max(shape.startY, shape.endY)

            return (
              x + radius >= rectLeft && x - radius <= rectRight && y + radius >= rectTop && y - radius <= rectBottom
            )

          case "circle":
            const centerX = shape.startX
            const centerY = shape.startY
            const shapeRadius = Math.sqrt(
              Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2),
            )
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
            return distance <= shapeRadius + radius

          case "line":
          case "arrow":
            // Distance from point to line segment
            const A = x - shape.startX
            const B = y - shape.startY
            const C = shape.endX - shape.startX
            const D = shape.endY - shape.startY

            const dot = A * C + B * D
            const lenSq = C * C + D * D
            let param = -1
            if (lenSq !== 0) param = dot / lenSq

            let xx, yy
            if (param < 0) {
              xx = shape.startX
              yy = shape.startY
            } else if (param > 1) {
              xx = shape.endX
              yy = shape.endY
            } else {
              xx = shape.startX + param * C
              yy = shape.startY + param * D
            }

            const dx = x - xx
            const dy = y - yy
            const distanceToLine = Math.sqrt(dx * dx + dy * dy)
            return distanceToLine <= radius + shape.radius

          default:
            return false
        }
      })
    },
    [shapes],
  )

  // Handle zoom with proper content preservation
  const handleZoom = useCallback(
    (delta, mouseX = null, mouseY = null) => {
      const zoomFactor = delta > 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(zoomLevel * zoomFactor, 0.1), 5);

      if (newZoom !== zoomLevel) {
        // Always preserve current canvas state before zoom if there's any content
        if (canvasRef.current && isAnnotating) {
          const drawingCanvas = canvasRef.current.canvas.drawing;
          const oldWidth = drawingCanvas.width;
          const oldHeight = drawingCanvas.height;

          // Create a temporary canvas to preserve the current state
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = oldWidth;
          tempCanvasRef.current.height = oldHeight;
          const tempCtx = tempCanvasRef.current.getContext("2d");
          tempCtx.drawImage(drawingCanvas, 0, 0);
        }

        // Calculate new pan offset
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          if (mouseX === null || mouseY === null) {
            mouseX = rect.left + rect.width / 2;
            mouseY = rect.top + rect.height / 2;
          }
          const px = mouseX - rect.left;
          const py = mouseY - rect.top;

          const newPanOffset = {
            x: px - newZoom * ((px - panOffset.x) / zoomLevel),
            y: py - newZoom * ((py - panOffset.y) / zoomLevel),
          };
          setPanOffset(newPanOffset);
        }

        // Update zoom level - this will trigger the useEffect to handle the canvas redrawing
        setZoomLevel(newZoom);
      }
    },
    [zoomLevel, panOffset, isAnnotating],
  );


  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      handleZoom(-e.deltaY, e.clientX, e.clientY)
    },
    [handleZoom],
  )


  const handleFitToScreen = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const containerWidth = rect.width
      const containerHeight = rect.height

      // Add inner padding so the image doesn't touch edges
      const padding = 24 // px on each side
      const usableWidth = Math.max(containerWidth - padding * 2, 0)
      const usableHeight = Math.max(containerHeight - padding * 2, 0)

      // Compute zoom to fit within padded area (bounded to max 5x)
      const scaleToFit = Math.min(usableWidth / originalWidth, usableHeight / originalHeight)
      const newZoom = Math.min(scaleToFit, 5)

      // Center the image within the container
      const scaledWidth = originalWidth * newZoom
      const scaledHeight = originalHeight * newZoom
      const offsetX = Math.round((containerWidth - scaledWidth) / 2)
      let offsetY = Math.round((containerHeight - scaledHeight) / 2) - 70

      // if (window.innerWidth < 768) {
      //   console.log("Mobile screen detected. Adjusting position...")

      //   // Log the calculation before adjustments
      //   offsetY -= 0 // Adjust this value as needed for mobile

      //   // Log the adjusted values for mobile
      // } else if (window.innerWidth < 468) {
      //   offsetY -= 200
      // }
      // else if (window.innerWidth > 768) {
      //   offsetY += 50
      // } else {
      //   offsetY -= 0
      // }

      if (window.innerWidth < 361) {
        console.log("361 Extra Small Mobile detected (offsetY). Before:", offsetY);
        offsetY -= 20;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 376) {
        console.log("376 Extra Small Mobile detected (offsetY). Before:", offsetY);
        offsetY -= 0;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 391) {
        console.log("391 Extra Small Mobile detected (offsetY). Before:", offsetY);
        offsetY -= 58;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 415) {
        console.log("415 Extra Small Mobile detected (offsetY). Before:", offsetY);
        offsetY -= 75;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 431) {
        console.log("431 Extra Small Mobile detected (offsetY). Before:", offsetY);
        offsetY -= 75;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 468) {
        console.log("468 Small Mobile detected (offsetY). Before:", offsetY);
        offsetY -= 120;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 768) {
        console.log("Mobile screen detected (offsetY). Before:", offsetY);
        offsetY -= 350;
        console.log("After:", offsetY);

      } else if (window.innerWidth < 1024) {
        console.log("Tablet screen detected (offsetY). Before:", offsetY);
        offsetY -= 200;
        console.log("After:", offsetY);

      } else {
        console.log("Desktop screen detected (offsetY). Before:", offsetY);
        offsetY += 45;
        console.log("After:", offsetY);
      }



      setIsPanning(false)
      setZoomLevel(newZoom)
      setPanOffset({ x: offsetX, y: offsetY })
    }
  }, [originalWidth, originalHeight])

  const resetZoom = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const offsetX = (rect.width - originalWidth) / 2
      const offsetY = (rect.height - originalHeight) / 2
      setPanOffset({ x: offsetX, y: offsetY })
    }
    setZoomLevel(1)
  }, [originalWidth, originalHeight])

  // Unified event handler for both mouse and touch
  const getEventPosition = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  // Calculate distance between two touch points
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate center point between two touch points
  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  // Pan functionality
  const handleMouseDown = useCallback(
    (e) => {
      const pos = getEventPosition(e)
      const isTouch = e.touches && e.touches.length > 0
      const isMiddleMouse = e.button === 1
      const isLeftClickWithCtrl = e.button === 0 && e.ctrlKey
      const isPanMode = drawingTool === "pan"
      const isPreviewMode = !isAnnotating

      if (isMiddleMouse || isLeftClickWithCtrl || isPanMode || isPreviewMode) {
        setIsPanning(true)
        setLastPanPoint({ x: pos.x, y: pos.y })
        e.preventDefault()
      }
    },
    [isAnnotating, drawingTool],
  )

  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        const pos = getEventPosition(e)
        const deltaX = pos.x - lastPanPoint.x
        const deltaY = pos.y - lastPanPoint.y
        setPanOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))
        setLastPanPoint({ x: pos.x, y: pos.y })
      }
    },
    [isPanning, lastPanPoint],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Shape drawing functions
  const drawShape = useCallback(
    (ctx, shape) => {
      // Use original coordinates without scaling - let CSS transform handle the scaling
      const startX = shape.startX
      const startY = shape.startY
      const endX = shape.endX
      const endY = shape.endY
      const radius = shape.radius

      ctx.strokeStyle = shape.color
      ctx.lineWidth = radius
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      switch (shape.type) {
        case "rectangle":
          ctx.strokeRect(startX, startY, endX - startX, endY - startY)
          break
        case "circle":
          const circleRadius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
          ctx.beginPath()
          ctx.arc(startX, startY, circleRadius, 0, 2 * Math.PI)
          ctx.stroke()
          break
        case "arrow":
          const headlen = 10
          const dx = endX - startX
          const dy = endY - startY
          const angle = Math.atan2(dy, dx)
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.lineTo(
            endX - headlen * Math.cos(angle - Math.PI / 6),
            endY - headlen * Math.sin(angle - Math.PI / 6),
          )
          ctx.moveTo(endX, endY)
          ctx.lineTo(
            endX - headlen * Math.cos(angle + Math.PI / 6),
            endY - headlen * Math.sin(angle + Math.PI / 6),
          )
          ctx.stroke()
          break
        case "line":
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
          break
      }
    },
    [],
  )

  const renderShapes = useCallback(() => {
    const canvas = shapeCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    shapes.forEach((shape) => {
      drawShape(ctx, shape)
    })

    if (currentShape) {
      drawShape(ctx, currentShape)
    }
  }, [shapes, currentShape, drawShape])

  useEffect(() => {
    renderShapes()
  }, [renderShapes])

  const getEraserCursor = useCallback(() => {
    const cursorCanvas = document.createElement("canvas")
    cursorCanvas.width = eraserRadius * 2 + 2
    cursorCanvas.height = eraserRadius * 2 + 2
    const ctx = cursorCanvas.getContext("2d")
    ctx.beginPath()
    ctx.arc(eraserRadius + 1, eraserRadius + 1, eraserRadius, 0, 2 * Math.PI)
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 1
    ctx.stroke()
    return `url(${cursorCanvas.toDataURL()}) ${eraserRadius + 1} ${eraserRadius + 1}, auto`
  }, [eraserRadius])

  // Enhanced Canvas Click Handler
  const handleCanvasClick = useCallback(
    (e) => {
      console.log("Canvas click triggered, isAddingText:", isAddingText, "event type:", e.type, "drawingTool:", drawingTool)
      if (isAddingText) {
        e.preventDefault()
        e.stopPropagation()

        const canvas = e.currentTarget
        const rect = canvas.getBoundingClientRect()
        const pos = getEventPosition(e)
        const x = (pos.x - rect.left) / zoomLevel
        const y = (pos.y - rect.top) / zoomLevel
        console.log("Setting text position:", { x, y })
        setTextPosition({ x, y })
      } else {
        console.log("Canvas click ignored - not in text adding mode")
      }
    },
    [isAddingText, drawingTool, zoomLevel],
  )

  // Modified handleShapeMouseDown to handle eraser for brush strokes and shapes
  const handleShapeMouseDown = useCallback(
    (e) => {
      if (e.touches && e.touches.length > 0) {
        e.preventDefault()
        e.stopPropagation()
      } else {
        e.stopPropagation()
      }
      if (e.pointerId && e.currentTarget && e.currentTarget.setPointerCapture) {
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) { }
      }
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const pos = getEventPosition(e)
      const visual_x = pos.x - rect.left
      const visual_y = pos.y - rect.top
      // Convert to logical coordinates by dividing by zoom level
      const logical_x = visual_x / zoomLevel
      const logical_y = visual_y / zoomLevel

      if (drawingTool === "eraser") {
        setIsDrawing(true) // Start continuous erasing
        if (canvasRef.current) {
          const drawingCanvas = canvasRef.current.canvas.drawing
          const ctx = drawingCanvas.getContext("2d")
          ctx.save()
          ctx.beginPath()
          ctx.arc(visual_x, visual_y, eraserRadius, 0, 2 * Math.PI)
          ctx.clip()
          ctx.clearRect(visual_x - eraserRadius, visual_y - eraserRadius, eraserRadius * 2, eraserRadius * 2)
          ctx.restore()
        }

        // Erase shapes
        const collidingShapes = checkShapeCollision(logical_x, logical_y, eraserRadius)
        if (collidingShapes.length > 0) {
          let topIndex = -1
          let topShape = null
          collidingShapes.forEach((shape) => {
            const idx = shapes.indexOf(shape)
            if (idx > topIndex) {
              topIndex = idx
              topShape = shape
            }
          })

          if (topShape) {
            setShapes((prev) => prev.filter((s) => s !== topShape))
            saveAnnotationState()
          }
        }
      } else if (["rectangle", "circle", "arrow", "line"].includes(drawingTool)) {
        setIsDrawingShape(true)
        setShapeStart({ x: logical_x, y: logical_y })
        setCurrentShape({
          type: drawingTool,
          startX: logical_x,
          startY: logical_y,
          endX: logical_x,
          endY: logical_y,
          color: brushColor,
          radius: brushRadius,
        })
      }
    },
    [drawingTool, brushColor, brushRadius, eraserRadius, checkShapeCollision, shapes, saveAnnotationState, zoomLevel],
  )

  // Modified handleShapeMouseMove to handle continuous erasing
  const handleShapeMouseMove = useCallback(
    (e) => {
      if (e.touches && e.touches.length > 0) {
        e.preventDefault()
        e.stopPropagation()
      } else {
        e.stopPropagation()
      }
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const pos = getEventPosition(e)
      const visual_x = pos.x - rect.left
      const visual_y = pos.y - rect.top
      // Convert to logical coordinates by dividing by zoom level
      const logical_x = visual_x / zoomLevel
      const logical_y = visual_y / zoomLevel

      if (isDrawingShape && shapeStart) {
        setCurrentShape((prev) => ({
          ...prev,
          endX: logical_x,
          endY: logical_y,
        }))
      } else if (drawingTool === "eraser" && isDrawing) {
        // Continuous erasing for brush strokes
        if (canvasRef.current) {
          const drawingCanvas = canvasRef.current.canvas.drawing
          const ctx = drawingCanvas.getContext("2d")
          ctx.save()
          ctx.beginPath()
          ctx.arc(visual_x, visual_y, eraserRadius, 0, 2 * Math.PI)
          ctx.clip()
          ctx.clearRect(visual_x - eraserRadius, visual_y - eraserRadius, eraserRadius * 2, eraserRadius * 2)
          ctx.restore()
        }

        // Continuous erasing for shapes
        const collidingShapes = checkShapeCollision(logical_x, logical_y, eraserRadius)
        if (collidingShapes.length > 0) {
          let topIndex = -1
          let topShape = null
          collidingShapes.forEach((shape) => {
            const idx = shapes.indexOf(shape)
            if (idx > topIndex) {
              topIndex = idx
              topShape = shape
            }
          })

          if (topShape) {
            setShapes((prev) => prev.filter((s) => s !== topShape))
            saveAnnotationState()
          }
        }
      }
    },
    [
      isDrawingShape,
      shapeStart,
      drawingTool,
      eraserRadius,
      checkShapeCollision,
      shapes,
      isDrawing,
      saveAnnotationState,
      zoomLevel,
    ],
  )

  // Ensure rasterization after erase in handleShapeMouseUp
  const handleShapeMouseUp = useCallback((e) => {
    if (e && e.touches) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (e && e.pointerId && e.currentTarget && e.currentTarget.releasePointerCapture) {
      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) { }
    }
    if (isDrawingShape && currentShape) {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setIsDrawingShape(false);
      setShapeStart(null);
      saveAnnotationState();
    }
    if (drawingTool === "eraser") {
      setIsDrawing(false);
      if (canvasRef.current) {
        const drawingCanvas = canvasRef.current.canvas.drawing;
        const width = drawingCanvas.width;
        const height = drawingCanvas.height;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(drawingCanvas, 0, 0);

        canvasRef.current.clear();

        const ctx = drawingCanvas.getContext("2d");
        ctx.drawImage(tempCanvas, 0, 0);
      }
      setHasErased(true);
      saveAnnotationState();
    }
  }, [isDrawingShape, currentShape, drawingTool, saveAnnotationState]);

  // Touch event handlers for pinch zoom
  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        // Two finger pinch
        e.preventDefault()
        e.stopPropagation()

        const distance = getTouchDistance(e.touches[0], e.touches[1])
        const center = getTouchCenter(e.touches[0], e.touches[1])

        setIsPinching(true)
        setLastPinchDistance(distance)
        setPinchCenter(center)
      } else if (e.touches.length === 1) {
        // Single touch - handle as pan or drawing
        const pos = getEventPosition(e)
        const isPanMode = drawingTool === "pan"
        const isPreviewMode = !isAnnotating

        if (isPanMode || isPreviewMode) {
          setIsPanning(true)
          setLastPanPoint({ x: pos.x, y: pos.y })
          e.preventDefault()
        } else if (isAnnotating && drawingTool !== "text") {
          // Handle drawing tools
          handleShapeMouseDown(e)
        }
      }
    },
    [drawingTool, isAnnotating, handleShapeMouseDown],
  )

  const handleTouchMove = useCallback(
    (e) => {
      if (isPinching && e.touches.length === 2) {
        // Handle pinch zoom
        e.preventDefault()
        e.stopPropagation()

        const distance = getTouchDistance(e.touches[0], e.touches[1])
        const center = getTouchCenter(e.touches[0], e.touches[1])

        if (lastPinchDistance > 0) {
          const scale = distance / lastPinchDistance
          const delta = (scale - 1) * 100 // Convert to wheel delta equivalent
          handleZoom(delta, center.x, center.y)
        }

        setLastPinchDistance(distance)
        setPinchCenter(center)
      } else if (isPanning && e.touches.length === 1) {
        // Handle pan
        const pos = getEventPosition(e)
        const deltaX = pos.x - lastPanPoint.x
        const deltaY = pos.y - lastPanPoint.y
        setPanOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))
        setLastPanPoint({ x: pos.x, y: pos.y })
        e.preventDefault()
      } else if (isAnnotating && drawingTool !== "text" && e.touches.length === 1) {
        // Handle drawing
        handleShapeMouseMove(e)
      }
    },
    [isPinching, isPanning, lastPinchDistance, lastPanPoint, handleZoom, handleShapeMouseMove, drawingTool, isAnnotating],
  )

  const handleTouchEnd = useCallback(
    (e) => {
      if (isPinching) {
        setIsPinching(false)
        setLastPinchDistance(0)
        setPinchCenter({ x: 0, y: 0 })
      }

      if (isPanning) {
        setIsPanning(false)
      }

      if (isAnnotating && drawingTool !== "text") {
        handleShapeMouseUp(e)
      }
    },
    [isPinching, isPanning, handleShapeMouseUp, drawingTool, isAnnotating],
  )

  // Enhanced Text Drag Handlers
  const handleTextMouseDown = useCallback(
    (e, textId) => {
      e.preventDefault()
      e.stopPropagation()

      const textElement = textElements.find((el) => el.id === textId)
      if (!textElement) return

      const canvas = textCanvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const pos = getEventPosition(e)
      const canvasX = (pos.x - rect.left) / zoomLevel
      const canvasY = (pos.y - rect.top) / zoomLevel

      const offsetX = canvasX - textElement.x
      const offsetY = canvasY - textElement.y

      setDragOffset({ x: offsetX, y: offsetY })
      setSelectedTextId(textId)
      setIsDragging(true)

      const handleMouseMove = (moveEvent) => {
        if (!canvas) return

        const canvasRect = canvas.getBoundingClientRect()
        const movePos = getEventPosition(moveEvent)
        const newCanvasX = (movePos.x - canvasRect.left) / zoomLevel
        const newCanvasY = (movePos.y - canvasRect.top) / zoomLevel

        const newX = Math.max(0, Math.min(originalWidth - 100, newCanvasX - offsetX))
        const newY = Math.max(
          textElement.fontSize,
          Math.min(originalHeight - textElement.fontSize, newCanvasY - offsetY),
        )

        updateTextElement(textId, { x: newX, y: newY })
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleMouseMove)
        document.removeEventListener("touchend", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleMouseMove)
      document.addEventListener("touchend", handleMouseUp)
    },
    [textElements, updateTextElement, zoomLevel, originalWidth, originalHeight],
  )

  // Text Double Click Handler for Editing
  const handleTextDoubleClick = useCallback(
    (textId) => {
      const element = textElements.find((el) => el.id === textId)
      if (!element) return

      setIsEditingText(true)
      setEditingTextId(textId)
      setEditingTextValue(element.text)
      setSelectedTextId(textId)
      // Set text settings based on the selected element
      setTextSettings({
        fontSize: element.fontSize,
        color: element.color,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textDecoration: element.textDecoration,
        textAlign: element.textAlign,
        backgroundColor: element.backgroundColor,
        padding: element.padding,
      })

      setTimeout(() => {
        if (editTextInputRef.current) {
          editTextInputRef.current.focus()
          editTextInputRef.current.select()
        }
      }, 100)
    },
    [textElements],
  )

  // Save Text Edit
  const saveTextEdit = useCallback(() => {
    if (editingTextId && editingTextValue.trim()) {
      updateTextElement(editingTextId, {
        text: editingTextValue.trim(),
        fontSize: textSettings.fontSize,
        color: textSettings.color,
        fontFamily: textSettings.fontFamily,
      })
    }
    setIsEditingText(false)
    setEditingTextId(null)
    setEditingTextValue("")
  }, [editingTextId, editingTextValue, textSettings, updateTextElement])

  // Cancel Text Edit
  const cancelTextEdit = useCallback(() => {
    setIsEditingText(false)
    setEditingTextId(null)
    setEditingTextValue("")
  }, [])

  // Modified handleSendAnnotation to use dynamic canvas dimensions
  const handleSendAnnotation = async () => {
    setLoading(true)
    if (!canvasRef.current || !selectedImage?.content) return

    try {
      const drawingCanvas = canvasRef.current.canvas.drawing
      const textCanvas = textCanvasRef.current
      const shapeCanvas = shapeCanvasRef.current

      const width = originalWidth // Use dynamic width
      const height = originalHeight // Use dynamic height

      // Create merged canvas
      const mergedCanvas = document.createElement("canvas")
      mergedCanvas.width = width
      mergedCanvas.height = height
      const ctx = mergedCanvas.getContext("2d")

      const backgroundImg = new Image()
      backgroundImg.crossOrigin = "anonymous"
      backgroundImg.src = selectedImage.content

      backgroundImg.onload = async () => {
        // Draw background image at original size
        ctx.drawImage(backgroundImg, 0, 0, width, height)

        // Draw shapes
        if (shapeCanvas) {
          ctx.drawImage(shapeCanvas, 0, 0, width, height)
        }

        // Draw drawing annotations
        ctx.drawImage(drawingCanvas, 0, 0, width, height)

        // Draw text annotations
        textElements.forEach((element) => {
          ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`
          ctx.fillStyle = element.color
          ctx.textAlign = element.textAlign
          ctx.textBaseline = "top"

          let textX = element.x
          if (element.textAlign === "center") {
            textX += element.padding + (element.width || ctx.measureText(element.text).width) / 2
          } else if (element.textAlign === "right") {
            textX += element.padding + (element.width || ctx.measureText(element.text).width)
          } else {
            textX += element.padding
          }

          const textY = element.y + element.padding

          if (element.backgroundColor !== "transparent") {
            const textWidth = ctx.measureText(element.text).width
            const textHeight = element.fontSize
            ctx.fillStyle = element.backgroundColor
            ctx.fillRect(element.x, element.y, textWidth + element.padding * 2, textHeight + element.padding * 2)
            ctx.fillStyle = element.color
          }

          ctx.fillText(element.text, textX, textY)

          if (element.textDecoration === "underline") {
            const textWidth = ctx.measureText(element.text).width
            const underlineY = textY + element.fontSize + 2
            ctx.fillRect(textX, underlineY, textWidth, 1)
          }
        })

        // Downscale and compress to reduce payload size to avoid socket disconnects due to large frames
        const estimateBytesFromDataUrl = (dataUrl) => {
          const commaIdx = dataUrl.indexOf(',')
          const b64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl
          return Math.ceil(b64.length * 0.75)
        }

        const buildScaled = (targetMaxDim, quality) => {
          const scale = Math.min(1, targetMaxDim / Math.max(width, height))
          const c = document.createElement("canvas")
          c.width = Math.round(width * scale)
          c.height = Math.round(height * scale)
          const cctx = c.getContext("2d")
          cctx.drawImage(mergedCanvas, 0, 0, c.width, c.height)
          return c.toDataURL("image/jpeg", quality)
        }

        const targets = [
          { dim: 1280, quality: 0.8 },
          { dim: 1280, quality: 0.7 },
          { dim: 1024, quality: 0.7 },
          { dim: 1024, quality: 0.6 },
          { dim: 800, quality: 0.6 },
          { dim: 800, quality: 0.5 },
        ]

        let uploadDataUrl = ""
        for (const t of targets) {
          uploadDataUrl = buildScaled(t.dim, t.quality)
          if (estimateBytesFromDataUrl(uploadDataUrl) <= 700_000) break
        }

        const annotatedFile = {
          name: `annotated_${selectedImage?.name || "image.jpg"}`,
          type: "image/jpeg",
          content: uploadDataUrl,
        }

        const currentUserInfo = getSenderInfo(userData._id)

        // Ensure socket is connected before emit
        if (!socket.connected) {
          try {
            socket.connect()
            await new Promise((resolve, reject) => {
              const to = setTimeout(() => reject(new Error("connect timeout")), 5000)
              socket.once("connect", () => { clearTimeout(to); resolve() })
            })
          } catch (e) {
            toast.error("Connection lost. Retrying upload failed.")
            throw e
          }
        }

        // Emit without ack timeout to avoid clearing acks upon reconnect
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
        setShapes([])
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

  // Modified handleClear to reset history
  const handleClear = useCallback(() => {
    suppressHistoryRef.current = true
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
    setTextElements([])
    setShapes([])
    setCurrentShape(null)
    setAnnotationHistory([])
    setAnnotationHistoryIndex(-1)
    annotationHistoryIndexRef.current = -1
    setHasErased(false)
    if (typeof saveAnnotationState === "function") {
      // ensure not to immediately re-add after clear
      setTimeout(() => {
        suppressHistoryRef.current = false
      }, 0)
    } else {
      suppressHistoryRef.current = false
    }
  }, [saveAnnotationState])

  // Enhanced handleUndo to work with all annotation tools
  const handleUndo = useCallback(() => {
    console.log("Undo called - History index:", annotationHistoryIndex, "History length:", annotationHistory.length)

    // Correct index if out of bounds
    if (annotationHistoryIndex > annotationHistory.length - 1) {
      console.log("Correcting index from", annotationHistoryIndex, "to", annotationHistory.length - 1)
      setAnnotationHistoryIndex(annotationHistory.length - 1)
      return
    }

    if (annotationHistoryIndex <= 0) {
      console.log("Clearing everything - at beginning of history")
      // Clear everything if we're at the beginning
      suppressHistoryRef.current = true
      if (canvasRef.current) {
        canvasRef.current.clear()
      }
      setTextElements([])
      setShapes([])
      setAnnotationHistoryIndex(-1)  // Set to -1 for empty state
      setBrushColor("#000000")
      setBrushRadius(2)
      setEraserRadius(10)
      setDrawingTool("brush")
      setZoomLevel(1)
      setPanOffset({ x: 0, y: 0 })
      setTextSettings({
        fontSize: 18,
        color: "#000000",
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "left",
        backgroundColor: "transparent",
        padding: 4,
      })
      annotationHistoryIndexRef.current = -1
      suppressHistoryRef.current = false
      return
    }

    const previousIndex = annotationHistoryIndex - 1
    const previousState = annotationHistory[previousIndex]

    // Restore zoom/pan before canvas so coordinates match
    suppressHistoryRef.current = true
    if (previousState.zoom) setZoomLevel(previousState.zoom)
    if (previousState.panOffset) setPanOffset(previousState.panOffset)

    // Restore canvas state
    if (canvasRef.current) {
      const drawingCanvas = canvasRef.current.canvas.drawing
      const ctx = drawingCanvas.getContext("2d")
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)

      if (previousState.canvasRaster) {
        const img = new Image()
        img.src = previousState.canvasRaster
        img.onload = () => {
          ctx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height)
          canvasRef.current.loadSaveData('{"lines":[]}', false)
          setHasErased(true)
        }
      } else if (previousState.canvasVector) {
        try {
          const saveData = JSON.parse(previousState.canvasVector)
          if (saveData) {
            canvasRef.current.loadSaveData(JSON.stringify(saveData), true)
            setHasErased(false)
          }
        } catch (error) {
          console.error("Failed to restore canvas:", error)
          canvasRef.current.clear()
          setHasErased(false)
        }
      }
    }

    // Restore all annotation states
    setTextElements([...previousState.textElements])
    setShapes([...previousState.shapes])

    // Restore tool settings
    if (previousState.brushColor) setBrushColor(previousState.brushColor)
    if (previousState.brushRadius) setBrushRadius(previousState.brushRadius)
    if (previousState.eraserRadius) setEraserRadius(previousState.eraserRadius)
    if (previousState.drawingTool) setDrawingTool(previousState.drawingTool)
    // zoom & pan already restored above to ensure correct positions
    if (previousState.textSettings) setTextSettings(previousState.textSettings)

    setAnnotationHistoryIndex(previousIndex)
    annotationHistoryIndexRef.current = previousIndex
    suppressHistoryRef.current = false
  }, [annotationHistory, annotationHistoryIndex, zoomLevel])

  // Enhanced handleRedo to restore undone steps for all annotation tools
  const handleRedo = useCallback(() => {
    console.log("Redo called - History index:", annotationHistoryIndex, "History length:", annotationHistory.length)

    // Correct index if out of bounds
    if (annotationHistoryIndex < -1) {
      setAnnotationHistoryIndex(-1)
      return
    }

    if (annotationHistoryIndex >= annotationHistory.length - 1) {
      console.log("Cannot redo - at end of history")
      return
    }

    const nextIndex = annotationHistoryIndex + 1
    const nextState = annotationHistory[nextIndex]

    // Restore zoom/pan before canvas so coordinates match
    suppressHistoryRef.current = true
    if (nextState.zoom) setZoomLevel(nextState.zoom)
    if (nextState.panOffset) setPanOffset(nextState.panOffset)

    // Restore canvas state
    if (canvasRef.current) {
      const drawingCanvas = canvasRef.current.canvas.drawing
      const ctx = drawingCanvas.getContext("2d")
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)

      if (nextState.canvasRaster) {
        const img = new Image()
        img.src = nextState.canvasRaster
        img.onload = () => {
          ctx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height)
          canvasRef.current.loadSaveData('{"lines":[]}', false)
          setHasErased(true)
        }
      } else if (nextState.canvasVector) {
        try {
          const saveData = JSON.parse(nextState.canvasVector)
          if (saveData) {
            canvasRef.current.loadSaveData(JSON.stringify(saveData), true)
            setHasErased(false)
          }
        } catch (error) {
          console.error("Failed to restore canvas:", error)
          canvasRef.current.clear()
          setHasErased(false)
        }
      }
    }

    // Restore all annotation states
    setTextElements([...nextState.textElements])
    setShapes([...nextState.shapes])

    // Restore tool settings
    if (nextState.brushColor) setBrushColor(nextState.brushColor)
    if (nextState.brushRadius) setBrushRadius(nextState.brushRadius)
    if (nextState.eraserRadius) setEraserRadius(nextState.eraserRadius)
    if (nextState.drawingTool) setDrawingTool(nextState.drawingTool)
    // zoom & pan already restored above to ensure correct positions
    if (nextState.textSettings) setTextSettings(nextState.textSettings)

    setAnnotationHistoryIndex(nextIndex)
    annotationHistoryIndexRef.current = nextIndex
    suppressHistoryRef.current = false
  }, [annotationHistory, annotationHistoryIndex, zoomLevel])

  // Handle click outside text elements to unselect
  const handleCanvasWrapperClick = useCallback(
    (e) => {
      console.log("handleCanvasWrapperClick triggered, isDragging:", isDragging, "isAddingText:", isAddingText, "textInput:", textInput)
      if (isDragging) {
        console.log("handleCanvasWrapperClick: Ignored due to dragging")
        return
      }

      const clickedOnTextElement = e.target.closest(".text-element")
      const clickedOnTextInput = e.target.closest(".form-control") || e.target.closest(".input-group")
      const clickedOnEditTextModalContent = e.target.closest(".chat-screen-text-edit-modal")

      console.log("Clicked elements:", { clickedOnTextElement, clickedOnTextInput, clickedOnEditTextModalContent })

      if (!clickedOnTextElement && !clickedOnTextInput && !clickedOnEditTextModalContent) {
        setSelectedTextId(null)
        if (isAddingText && !textInput.trim()) {
          console.log("handleCanvasWrapperClick: Resetting text position and isAddingText")
          setTextPosition(null)
          setIsAddingText(false)
        } else {
          console.log("handleCanvasWrapperClick: Not resetting - isAddingText:", isAddingText, "textInput:", textInput)
        }
      } else {
        console.log("handleCanvasWrapperClick: Clicked on text element/input - not resetting")
      }
    },
    [isDragging, isAddingText, textInput],
  )

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Debug text position changes
  useEffect(() => {
    console.log("Text position changed:", textPosition)
  }, [textPosition])

  // Debug isAddingText changes
  useEffect(() => {
    console.log("isAddingText changed:", isAddingText)
    if (isAddingText === false) {
      console.trace("isAddingText set to false")
    }
  }, [isAddingText])

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when modal is open and user is not typing in input fields
      if (!showModal) return

      const isInputFocused = document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.contentEditable === 'true'

      if (isInputFocused) return

      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }

      // Ctrl+Y or Cmd+Y for redo (or Ctrl+Shift+Z)
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        handleRedo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showModal, handleUndo, handleRedo])

  // Save initial state when annotation mode is enabled
  useEffect(() => {
    if (isAnnotating && showModal && canvasRef.current) {
      // Small delay to ensure canvas is ready
      const timer = setTimeout(() => {
        saveAnnotationState()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isAnnotating, showModal, saveAnnotationState])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.canvas.drawing;
      const handleDrawStart = () => {
        setIsDrawing(true);
      };
      const handleDrawEnd = () => {
        if (isDrawing) {
          if (drawingTool === "brush" && hasErased) {
            const drawingCanvas = canvasRef.current.canvas.drawing;
            const width = drawingCanvas.width;
            const height = drawingCanvas.height;

            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(drawingCanvas, 0, 0);

            canvasRef.current.clear();

            const ctx = drawingCanvas.getContext("2d");
            ctx.drawImage(tempCanvas, 0, 0);
          }
          saveAnnotationState();
          setIsDrawing(false);
        }
      };

      canvas.addEventListener("mousedown", handleDrawStart);
      canvas.addEventListener("mouseup", handleDrawEnd);
      canvas.addEventListener("mouseleave", handleDrawEnd);

      return () => {
        canvas.removeEventListener("mousedown", handleDrawStart);
        canvas.removeEventListener("mouseup", handleDrawEnd);
        canvas.removeEventListener("mouseleave", handleDrawEnd);
      };
    }
  }, [isDrawing, saveAnnotationState, drawingTool, hasErased]);

  // Handle image click
  const handleImageClick = (image) => {
    setSelectedImage(image)
    setShowModal(true)
    setIsAnnotating(false)
    setTextElements([])
    setTextHistory([])
    setHistoryIndex(-1)
    setShapes([])
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    // Reset annotation history
    setAnnotationHistory([])
    setAnnotationHistoryIndex(-1)
    setHasErased(false)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false)
    setIsAnnotating(false)
    setTextElements([])
    setTextHistory([])
    setHistoryIndex(-1)
    setShapes([])
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
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

  const handleCallMember = useCallback(
    async (member, selectedChat) => {
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
          const res = await axios.post(`${ENDPOINT}api/v1/create_call_for_free`, {
            roomId: room,
            callFrom,
            callTo,
          })
          toast.success(`Calling ${member.name}...`)
        } else {
          toast.error("Invalid phone number")
        }
      } catch (error) {
        console.log("Internal server error", error)
      } finally {
        setLoading(false)
      }
    },
    [userData],
  )

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
        setSelectedChat(chatData)
        setGroupName(chatData?.groupName || "Group Chat")

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

    socket.on("return_message", (data) => {
      console.log("Received message from others:", data)
      const senderInfo = getSenderInfo(data.sender || data.senderId)

      const messageObj = {
        ...data,
        senderId: data.sender || data.senderId,
        sender: data.sender || data.senderId,
        senderName: data.senderName || senderInfo.name,
        senderRole: data.senderRole || senderInfo.role,
      }

      if (data.file) {
        messageObj.file = {
          name: data.file.name,
          type: data.file.type,
          content: data.file.content,
        }
      }

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

  const handleUpdateGroupName = useCallback(
    async (newGroupName) => {
      if (!newGroupName || typeof newGroupName !== "string") {
        toast.error("Invalid group name")
        return
      }

      try {
        const response = await axios.put(`${ENDPOINT}api/v1/update_group_name/${currentRoomId}`, {
          groupName: newGroupName,
        })

        if (response.data.success) {
          toast.success("Group name updated successfully")
          setGroupName(newGroupName)
        } else {
          toast.error("Failed to update group name")
        }
      } catch (error) {
        toast.error("An error occurred while updating group name")
      }
    },
    [currentRoomId],
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

  // const isMobile = window.innerWidth <= 710;
  // const canvasWidth = Math.min(800, window.innerWidth - 50);
  // const canvasHeight = isMobile ? 170 : Math.min(600, window.innerHeight - 100);

  // Compact Color Picker Component
  const CompactColorPicker = ({ brushColor, setBrushColor, brushRadius, setBrushRadius, isEraser }) => {
    const quickColors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#000000",
      "#ffffff",
      "#808080",
      "#ff8000",
    ]

    return (
      <div className="compact-brush-controls">
        <div className="color-size-row">
          {!isEraser && (
            <div className="color-section">
              <label>Color:</label>
              <div className="color-options">
                {quickColors.map((color) => (
                  <div
                    key={color}
                    className={`color-dot ${brushColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBrushColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="size-section">
            <label>
              {isEraser ? "Eraser" : ""} Size: {brushRadius}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushRadius}
              onChange={(e) => setBrushRadius(Number.parseInt(e.target.value))}
              className="size-slider"
            />
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return <AccessDenied />
  }

  // if (loading) {
  //   return (
  //     <div
  //       className="flex-column justify-content-center align-items-center bg-light"
  //       style={{ height: "80vh", textAlign: "center", display:'flex' }}
  //     >
  //       <div
  //         className="spinner-border"
  //         role="status"
  //         style={{
  //           width: "3rem",
  //           height: "3rem",
  //           borderColor: "#eab936",
  //           borderRightColor: "transparent",
  //         }}
  //       >
  //         <span className="visually-hidden">Loading...</span>
  //       </div>
  //       <h5 className="fw-semibold mb-1 mt-4" style={{ color: "#eab936" }}>
  //         Fetching Live Projects...
  //       </h5>
  //       <small className="text-muted">Please wait while we prepare your workspace.</small>
  //     </div>
  //   )
  // }

  if (loading) {
    return (
      <div
        className="col-md-4 chat-list-container flex-column justify-content-center align-items-center bg-light"
        style={{ height: "100vh", textAlign: "center", display: 'flex' }}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px' }}>
                  <IoMdArrowRoundBack style={{ marginBottom: '1rem', fontSize: '24px' }} onClick={() => navigate(-1)} />
                  <h3>Group Chats</h3>
                </div>
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
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            chat?.groupName || "Group",
                          )}&background=random`}
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
                              groupName || selectedChat?.groupName || "Group",
                            )}&background=random`}
                            alt={groupName || selectedChat?.groupName || "Group Chat"}
                          />
                        )}
                      </div>
                      <div className="chatn-user-details">
                        <div className="chatn-user-name" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isEditingGroupName ? (
                            <>
                              <input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateGroupName(groupName)
                                    setIsEditingGroupName(false)
                                  }
                                }}
                                autoFocus
                                className="group-name-input"
                              />
                              <button
                                onClick={() => {
                                  handleUpdateGroupName(groupName)
                                  setIsEditingGroupName(false)
                                }}
                              >
                                ✅
                              </button>
                            </>
                          ) : (
                            <>
                              <span>{groupName || selectedChat?.groupName || "Group Chat"}</span>
                              <Pencil
                                size={16}
                                style={{ cursor: "pointer" }}
                                onClick={() => setIsEditingGroupName(true)}
                                title="Edit Group Name"
                              />
                            </>
                          )}
                        </div>
                        <div className="chatn-user-status">
                          {userData?.role === "user"
                            ? `${connectedProviders.size}/${selectedProviderIds.length} providers online`
                            : `Group Chat`}
                        </div>
                      </div>
                    </div>
                    <div className="chatn-actions">
                      {groupMembers.length > 0 &&
                        (isChatEnded ? (
                          <></>
                        ) : (
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
                                  className="forDisplayFlex justify-content-between align-items-center"
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
                        ))}
                    </div>
                  </div>

                  {chatData?.PaymentStatus?.toLowerCase() !== "paid" ? (
                    <div className="no-messages">
                      <p>Send a message to start a conversation</p>
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

                              {msg.replyTo && (
                                <div className="chatn-reply-indicator">
                                  <div className="chatn-reply-line"></div>
                                  <div className="chatn-reply-content">
                                    <div className="chatn-reply-sender">{msg.replyTo.senderName}</div>
                                    <div className="chatn-reply-text">
                                      {msg.replyTo.isFile
                                        ? msg.replyTo.isAudio
                                          ? "🎙️ Voice Note"
                                          : "📷 Image"
                                        : msg.replyTo.text}
                                    </div>
                                    <div className="chatn-reply-time">
                                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {msg.file && msg.isAudio ? (
                                <div className="chatn-message-bubble chatn-audio-message">
                                  <audio
                                    controls
                                    src={msg.file.content}
                                    className="chatn-message-audio"
                                    onError={(e) => console.error("Audio playback error:", e)}
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
                              ) : msg.file ? (
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

                  {/* Enhanced Image Annotation Modal with Sidebar Layout */}
                  <Modal
                    show={showModal}
                    onHide={handleCloseModal}
                    centered
                    size={isMobileView ? "lg" : "xl"}
                    className="image-annotation-modal forzindex"
                    ref={modalRef}
                    fullscreen={isMobileView ? "sm-down" : false}
                  >
                    <Modal.Header closeButton style={{ backgroundColor: "#EDBE3A" }} className="border-0 text-white">
                      <div style={{ display: "flex" }} className="w-100 align-items-center justify-content-between">
                        <Modal.Title className="forDisplayFlex align-items-center gap-2 fw-bold fs-5 mb-0">
                          <MdBrush style={{ fontSize: isMobileView ? 18 : 20 }} />
                          {isAnnotating ? "Image" : "View Image"}
                        </Modal.Title>

                        <div className="forDisplayFlex align-items-center gap-2">
                          {!isChatEnded &&
                            (!isAnnotating ? (
                              <button
                                onClick={() => {
                                  setIsAnnotating(true)
                                  // Optional: Reset zoom when entering annotation mode
                                  // resetZoom()
                                  // Save initial state when entering annotation mode
                                  setTimeout(() => {
                                    saveAnnotationState()
                                  }, 100)
                                }}
                                className="btn btn-light btn-sm btn-sm align-items-center gap-1"
                              >
                                <MdBrush className="fs-6" />
                                <span className="d-none d-sm-inline">Start Editing</span>
                              </button>
                            ) : (
                              <button
                                onClick={handleFitToScreen}
                                className="btn btn-outline-light btn-sm align-items-center gap-1"
                              >
                                <span className="d-none d-sm-inline">Preview Mode</span>
                                <span className="d-sm-none"><Eye size={26} /></span>
                              </button>
                            ))}

                          <button
                            className="btn btn-outline-light btn-sm align-items-center gap-1"
                            onClick={handleBase64Download}
                          >
                            <MdAttachment size={isMobileView ? 26 : 18} />
                            <span className="d-none d-lg-inline">Download</span>
                          </button>

                          {isAnnotating && (
                            <button
                              onClick={handleSendAnnotation}
                              className="btn btn-success btn-sm align-items-center gap-1"
                              disabled={loading}
                            >
                              <MdSend size={isMobileView ? 24 : 18} />
                              {loading ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  <span className="d-none d-sm-inline">Sending...</span>
                                </>
                              ) : (
                                <span className="d-none d-sm-inline">Send</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </Modal.Header>

                    <Modal.Body className="p-0" style={{ height: isMobileView ? "85vh" : "80vh", overflow: "hidden" }}>
                      {selectedImage && (
                        <div className="h-100 d-flex flex-column flex-lg-row">
                          {/* Tools Panel - Left Sidebar on Desktop, Two-row layout on Mobile */}
                          {isAnnotating && (
                            <div
                              className="tools-panel text-white p-3 order-1 tool-height order-lg-0"
                              style={{
                                width: isMobileView ? "100%" : "340px",
                                flex: isMobileView ? "0 0 auto" : "0 0 340px",
                                flexShrink: 0,
                                maxHeight: isMobileView ? "25vh" : "none",
                                overflowY: "auto",
                                fontSize: isMobileView ? "0.85rem" : undefined,
                                gap: isMobileView ? "6px" : undefined
                              }}
                            >
                              {/* Mobile Layout - Two Row System */}
                              {isMobileView ? (
                                <>
                                  {/* First Row - 4 Main Tool Icons */}
                                  <div className="row g-2 mb-3">
                                    {/* Column 1: Drawing Tools */}
                                    <div className="col-3">
                                      <button
                                        className={`btn w-100 ${activeMobileToolSection === 'drawing' ? 'btn-info text-dark' : 'btn-outline-info'}`}
                                        onClick={() => setActiveMobileToolSection(activeMobileToolSection === 'drawing' ? null : 'drawing')}
                                        style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        title="Drawing Tools"
                                      >
                                        <MdBrush size={16} />
                                      </button>
                                    </div>

                                    {/* Column 2: Brush Settings */}
                                    <div className="col-3">
                                      <button
                                        className={`btn w-100 ${activeMobileToolSection === 'brush' ? 'btn-info text-dark' : 'btn-outline-info'}`}
                                        onClick={() => setActiveMobileToolSection(activeMobileToolSection === 'brush' ? null : 'brush')}
                                        style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        title="Brush Settings"
                                      >
                                        <MdOutlineSettings size={18} />
                                      </button>
                                    </div>

                                    {/* Column 3: Zoom Controls */}
                                    <div className="col-3">
                                      <button
                                        className={`btn w-100 ${activeMobileToolSection === 'zoom' ? 'btn-info text-dark' : 'btn-outline-info'}`}
                                        onClick={() => setActiveMobileToolSection(activeMobileToolSection === 'zoom' ? null : 'zoom')}
                                        style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        title="Zoom Controls"
                                      >
                                        <MdZoomIn size={18} />
                                      </button>
                                    </div>

                                    {/* Column 4: Text Settings (only visible when text tool is active) */}
                                    <div className="col-3">
                                      {isAddingText ? (
                                        <button
                                          className={`btn w-100 ${activeMobileToolSection === 'text' ? 'btn-info text-dark' : 'btn-outline-info'}`}
                                          onClick={() => setActiveMobileToolSection(activeMobileToolSection === 'text' ? null : 'text')}
                                          style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                          title="Text Settings"
                                        >
                                          <TfiText size={18} />
                                        </button>
                                      ) : (
                                        <div style={{ height: "50px" }}></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Second Row - Tool Details */}
                                  {activeMobileToolSection && (
                                    <div className="row mb-3">
                                      <div className="col-12">
                                        {activeMobileToolSection === 'drawing' && (
                                          <div className="border rounded p-2 bg-light">
                                            <h6 className="text-black mb-3">Drawing Tools</h6>
                                            <div style={{ display: "flex", gap:'4px' }} className="flex-wrap">
                                              <button
                                                className={`btn ${drawingTool === "brush" ? "btn-info text-dark" : "btn-outline-info"}`}
                                                onClick={() => {
                                                  setDrawingTool("brush")
                                                  if (isAddingText) setIsAddingText(false)
                                                }}
                                                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                title="Brush Tool"
                                              >
                                                <MdBrush size={20} />
                                              </button>
                                              <button
                                                className={`btn ${drawingTool === "rectangle" ? "btn-info text-dark" : "btn-outline-info"}`}
                                                onClick={() => {
                                                  setDrawingTool("rectangle")
                                                  if (isAddingText) setIsAddingText(false)
                                                }}
                                                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                title="Rectangle Tool"
                                              >
                                                <MdRectangle size={20} />
                                              </button>
                                              <button
                                                className={`btn ${drawingTool === "circle" ? "btn-info text-dark" : "btn-outline-info"}`}
                                                onClick={() => {
                                                  setDrawingTool("circle")
                                                  if (isAddingText) setIsAddingText(false)
                                                }}
                                                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                title="Circle Tool"
                                              >
                                                <MdCircle size={20} />
                                              </button>
                                              <button
                                                className={`btn ${drawingTool === "arrow" ? "btn-info text-dark" : "btn-outline-info"}`}
                                                onClick={() => {
                                                  setDrawingTool("arrow")
                                                  if (isAddingText) setIsAddingText(false)
                                                }}
                                                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                title="Arrow Tool"
                                              >
                                                <MdArrowForward size={20} />
                                              </button>
                                              <button
                                                className={`btn ${drawingTool === "text" ? "btn-info text-dark" : "btn-outline-info"}`}
                                                onClick={() => {
                                                  if (isAddingText) {
                                                    setIsAddingText(false)
                                                    setDrawingTool("brush")
                                                  } else {
                                                    setIsAddingText(true)
                                                    setDrawingTool("text")
                                                  }
                                                }}
                                                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                title="Text Tool"
                                              >
                                                <TfiText size={20} />
                                              </button>
                                              <button
                                                className={`btn ${drawingTool === "pan" ? "btn-info text-dark" : "btn-outline-info"}`}
                                                onClick={() => {
                                                  setDrawingTool("pan")
                                                  if (isAddingText) setIsAddingText(false)
                                                }}
                                                style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                title="Pan Tool"
                                              >
                                                <Hand size={20} />
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {activeMobileToolSection === 'brush' && (
                                          <div className="border rounded p-3 bg-light">
                                            <h6 className="text-black mb-3">Brush Settings</h6>
                                            <div style={{ display: "flex" }} className="flex-wrap gap-2">
                                              <div className="mb-3">
                                                <label className="form-label text-black small">Color</label>
                                                <input
                                                  type="color"
                                                  value={brushColor}
                                                  onChange={(e) => setBrushColor(e.target.value)}
                                                  className="form-control border form-control-color"
                                                  style={{ width: "60px", height: "40px" }}
                                                />
                                              </div>
                                              <div className="mb-3">
                                                <label className="form-label text-black small">Size: {brushRadius}px</label>
                                                <input
                                                  type="range"
                                                  min="1"
                                                  max="20"
                                                  value={brushRadius}
                                                  onChange={(e) => setBrushRadius(Number(e.target.value))}
                                                  className="form-range"
                                                />
                                              </div>
                                            </div>

                                          </div>
                                        )}

                                        {activeMobileToolSection === 'zoom' && (
                                          <div className="border rounded p-3 bg-light">
                                            <h6 className="text-black mb-3">Zoom Controls</h6>
                                            <div style={{ display: "flex" }} className=" align-items-center gap-2 mb-3">
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleZoom(100)}
                                                title="Zoom In"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdZoomIn size={20} />
                                              </button>
                                              <span className="badge bg-light text-dark">
                                                {Math.round(zoomLevel * 100)}%
                                              </span>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleZoom(-100)}
                                                title="Zoom Out"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdZoomOut size={20} />
                                              </button>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={handleFitToScreen}
                                                title="Reset Zoom"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdCenterFocusWeak size={20} />
                                              </button>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={handleUndo}
                                                disabled={annotationHistoryIndex <= 0}
                                                title="Undo"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdUndo size={20} />
                                              </button>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={handleRedo}
                                                disabled={annotationHistoryIndex >= annotationHistory.length - 1}
                                                title="Redo"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdRedo size={20} />
                                              </button>
                                            </div>
                                            <div style={{ display: "flex" }} className="align-items-center gap-2">
                                              {/* <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={handleUndo}
                                                disabled={annotationHistoryIndex <= 0}
                                                title="Undo"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdUndo size={20} />
                                              </button>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={handleRedo}
                                                disabled={annotationHistoryIndex >= annotationHistory.length - 1}
                                                title="Redo"
                                                style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                              >
                                                <MdRedo size={20} />
                                              </button> */}
                                            </div>
                                          </div>
                                        )}

                                        {activeMobileToolSection === 'text' && isAddingText && (
                                          <div className="border rounded p-3 bg-light">
                                            <h6 className="text-black mb-3">Text Settings</h6>
                                            <div style={{ display: "flex" }} className=" align-items-center gap-2 mb-3">
                                              <div className="mb-3">
                                                <label className="form-label text-black small">Text Color</label>
                                                <input
                                                  type="color"
                                                  value={textSettings.color}
                                                  onChange={(e) => setTextSettings((prev) => ({ ...prev, color: e.target.value }))}
                                                  className="form-control border form-control-color"
                                                  style={{ width: "60px", height: "40px" }}
                                                />
                                              </div>
                                              <div className="mb-3">
                                                <label className="form-label text-black small">Font Size: {textSettings.fontSize}px</label>
                                                <input
                                                  type="range"
                                                  min="12"
                                                  max="48"
                                                  value={textSettings.fontSize}
                                                  onChange={(e) => setTextSettings((prev) => ({ ...prev, fontSize: Number.parseInt(e.target.value) }))}
                                                  className="form-range"
                                                />
                                              </div>
                                            </div>

                                            <div className="mb-3">
                                              <label className="form-label text-black small">Font Family</label>
                                              <select
                                                value={textSettings.fontFamily}
                                                onChange={(e) => setTextSettings((prev) => ({ ...prev, fontFamily: e.target.value }))}
                                                className="form-select form-select-sm text-black border-secondary"
                                              >
                                                <option value="Arial">Arial</option>
                                                <option value="Helvetica">Helvetica</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Courier New">Courier New</option>
                                              </select>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                /* Desktop Layout - Original Structure */
                                <>
                                  {/* Drawing Tools Section */}
                                  <div className="mb-4">
                                    <h6 style={{ display: "flex" }} className="text-black mb-3 align-items-center gap-2">
                                      <MdBrush className="text-info" /> Drawing Tools
                                    </h6>

                                    {/* First Row */}
                                    <div style={{ display: "flex" }} className="gap-2 mb-2 flex-wrap">
                                      <button
                                        className={`btn ${drawingTool === "brush" ? "btn-info text-dark" : "btn-outline-info"}`}
                                        onClick={() => {
                                          console.log("Brush tool clicked, current isAddingText:", isAddingText)
                                          setDrawingTool("brush")
                                          if (isAddingText) {
                                            console.log("Brush tool: Setting isAddingText to false")
                                            setIsAddingText(false)
                                          }
                                        }}
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        title="Brush Tool - Draw freehand"
                                      >
                                        <MdBrush size={20} />
                                      </button>

                                      <button
                                        className={`btn ${drawingTool === "rectangle" ? "btn-info text-dark" : "btn-outline-info"}`}
                                        onClick={() => {
                                          setDrawingTool("rectangle")
                                          if (isAddingText) setIsAddingText(false)
                                        }}
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        title="Rectangle Tool - Draw rectangles"
                                      >
                                        <MdRectangle size={20} />
                                      </button>

                                      <button
                                        className={`btn ${drawingTool === "circle" ? "btn-info text-dark" : "btn-outline-info"}`}
                                        onClick={() => {
                                          setDrawingTool("circle")
                                          if (isAddingText) setIsAddingText(false)
                                        }}
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        title="Circle Tool - Draw circles"
                                      >
                                        <MdCircle size={20} />
                                      </button>

                                      <button
                                        className={`btn ${drawingTool === "arrow" ? "btn-info text-dark" : "btn-outline-info"}`}
                                        onClick={() => {
                                          setDrawingTool("arrow")
                                          if (isAddingText) setIsAddingText(false)
                                        }}
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        title="Arrow Tool - Draw arrows"
                                      >
                                        <MdArrowForward size={20} />
                                      </button>

                                      <button
                                        className={`btn ${drawingTool === "text" ? "btn-info text-dark" : "btn-outline-info"}`}
                                        onClick={() => {
                                          console.log("Text tool button clicked, current isAddingText:", isAddingText)
                                          if (isAddingText) {
                                            console.log("Text tool: Disabling text mode")
                                            setIsAddingText(false)
                                            setDrawingTool("brush")
                                            console.log("Text mode disabled")
                                          } else {
                                            console.log("Text tool: Enabling text mode")
                                            setIsAddingText(true)
                                            setDrawingTool("text")
                                            console.log("Text mode enabled")
                                          }
                                        }}
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        title="Text Tool - Add text"
                                      >
                                        <TfiText size={20} />
                                      </button>

                                      <button
                                        className={`btn ${drawingTool === "pan" ? "btn-info text-dark" : "btn-outline-info"}`}
                                        onClick={() => {
                                          setDrawingTool("pan")
                                          if (isAddingText) setIsAddingText(false)
                                        }}
                                        style={{
                                          width: "45px",
                                          height: "45px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        title="Pan Tool - Drag to move"
                                      >
                                        <Hand size={20} />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Desktop-only sections for brush settings, text settings, and zoom controls */}
                              {!isMobileView && (
                                <>
                                  {/* Brush Settings */}
                                  <details className="mb-3" open>
                                    <summary className="text-black mb-2" style={{ cursor: "pointer", userSelect: "none" }}>
                                      {drawingTool === "eraser" ? "Eraser Settings" : "Brush Settings"}
                                    </summary>
                                    <div className="canvas-flex gap-3">
                                      {drawingTool !== "eraser" && (
                                        <div className="mb-2">
                                          <label className="form-label text-black small">Color</label>
                                          <div className="d-flex align-items-center gap-2">
                                            <input
                                              type="color"
                                              value={brushColor}
                                              onChange={(e) => setBrushColor(e.target.value)}
                                              className="form-control border form-control-color"
                                              style={{ width: "50px", height: "40px" }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      <div className="mb-2">
                                        <label className="form-label text-black small">
                                          Size: {drawingTool === "eraser" ? eraserRadius : brushRadius}px
                                        </label>
                                        <input
                                          type="range"
                                          min="1"
                                          max={drawingTool === "eraser" ? "50" : "20"}
                                          value={drawingTool === "eraser" ? eraserRadius : brushRadius}
                                          onChange={(e) =>
                                            drawingTool === "eraser"
                                              ? setEraserRadius(Number(e.target.value))
                                              : setBrushRadius(Number(e.target.value))
                                          }
                                          className="form-range"
                                          style={{ height: "6px" }}
                                        />
                                      </div>
                                    </div>
                                  </details>

                                  {/* Text Settings */}
                                  {isAddingText && (
                                    <details className="mb-3" open>
                                      <summary className="text-black forDisplayFlex mb-2 align-items-center gap-2" style={{ cursor: "pointer", userSelect: "none" }}>
                                        <MdPinEnd className="text-warning" size={20} /> Text Settings
                                      </summary>
                                      <div className="canvas-flex gap-3">
                                        <div className="mb-2">
                                          <label className="form-label text-black small">Text Color</label>
                                          <input
                                            type="color"
                                            value={textSettings.color}
                                            onChange={(e) =>
                                              setTextSettings((prev) => ({ ...prev, color: e.target.value }))
                                            }
                                            className="form-control border form-control-color w-100"
                                            style={{ height: "40px", width: "auto" }}
                                          />
                                        </div>

                                        <div className="mb-2">
                                          <label className="form-label text-black small">
                                            Font Size: {textSettings.fontSize}px
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
                                            className="form-range"
                                            style={{ height: "6px" }}
                                          />
                                        </div>
                                      </div>

                                      <div className="mb-2">
                                        <label className="form-label text-black small">Font Family</label>
                                        <select
                                          value={textSettings.fontFamily}
                                          onChange={(e) =>
                                            setTextSettings((prev) => ({ ...prev, fontFamily: e.target.value }))
                                          }
                                          className="form-select form-select-sm text-black border-secondary"
                                        >
                                          <option value="Arial">Arial</option>
                                          <option value="Helvetica">Helvetica</option>
                                          <option value="Times New Roman">Times New Roman</option>
                                          <option value="Courier New">Courier New</option>
                                        </select>
                                      </div>
                                    </details>
                                  )}

                                  {/* Zoom Controls */}
                                  <details className="mb-3" open>
                                    <summary className="text-black mb-2 forDisplayFlex align-items-center gap-2" style={{ cursor: "pointer", userSelect: "none" }}>
                                      <MdZoomIn className="text-primary" size={20} /> Zoom Controls
                                    </summary>
                                    <div className="forDisplayFlex align-items-center gap-2">
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleZoom(100)}
                                        title="Zoom In"
                                        style={{
                                          width: "auto",
                                          height: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <MdZoomIn size={20} />
                                      </button>
                                      <span className="badge bg-light text-dark" style={{ fontSize: "0.75rem" }}>
                                        {Math.round(zoomLevel * 100)}%
                                      </span>
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleZoom(-100)}
                                        title="Zoom Out"
                                        style={{
                                          width: "auto",
                                          height: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <MdZoomOut size={20} />
                                      </button>
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={resetZoom}
                                        title="Reset to 100%"
                                        style={{
                                          width: "auto",
                                          height: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <MdZoomIn size={20} />
                                      </button>
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleUndo}
                                        disabled={annotationHistoryIndex <= 0}
                                        title="Undo (Ctrl+Z)"
                                        style={{
                                          width: "auto",
                                          height: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <MdUndo size={20} />
                                      </button>
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleRedo}
                                        disabled={annotationHistoryIndex >= annotationHistory.length - 1}
                                        title="Redo (Ctrl+Y)"
                                        style={{
                                          width: "auto",
                                          height: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <MdRedo size={20} />
                                      </button>
                                      <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleFitToScreen}
                                        title="Fit to Screen"
                                        style={{
                                          width: "auto",
                                          height: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <MdCenterFocusWeak size={20} />
                                      </button>
                                    </div>
                                    <p className="text-black small mt-2">
                                      Tip: Hold Ctrl + Click and drag to pan the image
                                    </p>
                                    {/* Debug info for undo/redo */}
                                    <div className="text-muted small mt-1">
                                      History: {annotationHistoryIndex + 1}/{annotationHistory.length}
                                      {annotationHistory.length > 0 && (
                                        <span className="ms-2">
                                          (Undo: {annotationHistoryIndex > 0 ? "✓" : "✗"},
                                          Redo: {annotationHistoryIndex < annotationHistory.length - 1 ? "✓" : "✗"})
                                        </span>
                                      )}
                                    </div>
                                  </details>
                                </>
                              )}
                            </div>
                          )}

                          {/* Canvas Area - Right Side on Desktop, Bottom on Mobile */}
                          <div className="canvas-area flex-grow-1 bg-light position-relative order-0 order-lg-1" style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", display: "flex" }}>
                            <div
                              className={`canvas-wrapper position-relative overflow-hidden h-100 align-items-center justify-content-center ${isDraggingOver ? "drag-over" : ""}`}
                              onClick={isAddingText ? undefined : handleCanvasWrapperClick}
                              onWheel={handleWheel}
                              onMouseDown={isAddingText ? undefined : handleMouseDown}
                              onMouseMove={isAddingText ? undefined : handleMouseMove}
                              onMouseUp={isAddingText ? undefined : handleMouseUp}
                              onTouchStart={isAddingText ? undefined : handleTouchStart}
                              onTouchMove={isAddingText ? undefined : handleTouchMove}
                              onTouchEnd={isAddingText ? undefined : handleTouchEnd}
                              onDragEnter={handleDragEnter}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              ref={containerRef}
                              style={{
                                display: "flex",
                                touchAction: isAddingText ? "auto" : "manipulation",
                                userSelect: "none"
                              }}
                            >
                              {isAnnotating ? (
                                <div
                                  className="canvas-container position-relative"
                                  style={{
                                    position: "absolute",
                                    left: `${panOffset.x}px`,
                                    top: `${panOffset.y}px`,
                                    width: `${originalWidth * zoomLevel}px`,
                                    height: `${originalHeight * zoomLevel}px`,
                                    maxWidth: isMobileView ? "100vw" : "none",
                                    maxHeight: isMobileView ? "60vh" : "none",
                                    cursor: isPanning
                                      ? "grabbing"
                                      : drawingTool === "pan"
                                        ? "grab"
                                        : isAddingText
                                          ? "crosshair"
                                          : drawingTool === "eraser"
                                            ? getEraserCursor()
                                            : "default",
                                    touchAction: isAddingText ? "auto" : "none",
                                    userSelect: "none"
                                  }}
                                  onClick={isAddingText ? handleCanvasClick : undefined}
                                  onTouchStart={(e) => {
                                    if (isAddingText) {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleCanvasClick(e)
                                    }
                                  }}
                                >
                                  <>
                                    {/* Drawing Canvas */}
                                    <CanvasDraw
                                      ref={canvasRef}
                                      imgSrc={selectedImage?.content}
                                      canvasWidth={originalWidth * zoomLevel}
                                      canvasHeight={originalHeight * zoomLevel}
                                      loadTimeOffset={10}
                                      brushRadius={drawingTool === "eraser" ? eraserRadius : brushRadius}
                                      brushColor={drawingTool === "eraser" ? "#FFFFFF" : brushColor}
                                      lazyRadius={0}
                                      className="shadow rounded"
                                      disabled={drawingTool !== "brush"}
                                      onChange={() => {
                                        // Save state when drawing changes
                                        saveAnnotationState()
                                      }}
                                    />

                                    {/* Shape Canvas */}
                                    <canvas
                                      ref={shapeCanvasRef}
                                      width={originalWidth}
                                      height={originalHeight}
                                      className="position-absolute top-0 start-0 shadow rounded"
                                      style={{
                                        pointerEvents: ["rectangle", "circle", "arrow", "line", "eraser"].includes(
                                          drawingTool,
                                        )
                                          ? "auto"
                                          : "none",
                                        zIndex: 5,
                                        cursor: drawingTool === "eraser" ? getEraserCursor() : "default",
                                        touchAction: "none",
                                        userSelect: "none",
                                        transform: `scale(${zoomLevel})`,
                                        transformOrigin: "top left"
                                      }}
                                      onMouseDown={handleShapeMouseDown}
                                      onMouseMove={handleShapeMouseMove}
                                      onMouseUp={handleShapeMouseUp}
                                      onPointerDown={handleShapeMouseDown}
                                      onPointerMove={handleShapeMouseMove}
                                      onPointerUp={handleShapeMouseUp}
                                      onTouchStart={handleShapeMouseDown}
                                      onTouchMove={handleShapeMouseMove}
                                      onTouchEnd={handleShapeMouseUp}
                                      onTouchCancel={handleShapeMouseUp}
                                    />

                                    {/* Text Overlay Canvas */}
                                    <canvas
                                      ref={textCanvasRef}
                                      width={originalWidth * zoomLevel}
                                      height={originalHeight * zoomLevel}
                                      className="position-absolute top-0 start-0"
                                      style={{
                                        pointerEvents: isAddingText ? "auto" : "none",
                                        zIndex: isAddingText ? 15 : 10,
                                        cursor: isAddingText ? "crosshair" : "default",
                                        touchAction: isAddingText ? "auto" : "none",
                                        userSelect: "none",
                                        backgroundColor: isAddingText ? "rgba(0,0,0,0.1)" : "transparent"
                                      }}
                                      onClick={handleCanvasClick}
                                      onTouchStart={(e) => {
                                        // Only handle touch if not clicking on text input
                                        const target = e.target
                                        const isTextInput = target.closest('.form-control') || target.closest('.input-group')

                                        if (!isTextInput) {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleCanvasClick(e)
                                        }
                                      }}
                                    />

                                    {/* Interactive Text Elements */}
                                    {textElements.map((element) => (
                                      <div
                                        key={element.id}
                                        className={`text-element position-absolute user-select-none ${selectedTextId === element.id ? "selected" : ""}`}
                                        style={{
                                          left: element.x * zoomLevel,
                                          top: element.y * zoomLevel,
                                          fontSize: `${element.fontSize * zoomLevel}px`,
                                          fontFamily: element.fontFamily,
                                          fontWeight: element.fontWeight,
                                          fontStyle: element.fontStyle,
                                          textDecoration: element.textDecoration,
                                          color: element.color,
                                          backgroundColor: element.backgroundColor,
                                          padding: `${element.padding * zoomLevel}px`,
                                          cursor: isDragging ? "grabbing" : "grab",
                                          zIndex: element.zIndex + 10,
                                          transform: `rotate(${element.rotation || 0}deg)`,
                                          textAlign: element.textAlign,
                                          border:
                                            selectedTextId === element.id
                                              ? "2px dashed #0d6efd"
                                              : "1px solid transparent",
                                          borderRadius: "6px",
                                          minWidth: "20px",
                                          minHeight: `${element.fontSize * zoomLevel}px`,
                                          boxShadow:
                                            selectedTextId === element.id
                                              ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
                                              : "0 0.25rem 0.5rem rgba(0,0,0,0.1)",
                                          transition: "all 0.2s ease-in-out",
                                          whiteSpace: "nowrap",
                                          overflow: "visible",
                                        }}
                                        onMouseDown={(e) => handleTextMouseDown(e, element.id)}
                                        onTouchStart={(e) => handleTextMouseDown(e, element.id)}
                                        onDoubleClick={() => handleTextDoubleClick(element.id)}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedTextId(element.id)
                                        }}
                                        onTouchEnd={(e) => {
                                          e.stopPropagation()
                                          setSelectedTextId(element.id)
                                        }}
                                      >
                                        {element.text}
                                        {selectedTextId === element.id && (
                                          <div className="position-absolute top-0 end-0">
                                            <div
                                              className="btn-group-vertical btn-group-sm shadow"
                                              style={{ transform: "translate(50%, -50%)" }}
                                            >
                                              <button
                                                className="btn btn-primary btn-sm"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleTextDoubleClick(element.id)
                                                }}
                                                title="Edit text"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                className="btn btn-danger btn-sm"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  deleteTextElement(element.id)
                                                }}
                                                title="Delete text"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    {/* Text Input Field */}
                                    {textPosition && (
                                      <div
                                        className="position-absolute"
                                        style={{
                                          top: textPosition.y * zoomLevel,
                                          left: textPosition.x * zoomLevel,
                                          zIndex: 20,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onTouchEnd={(e) => e.stopPropagation()}
                                      >
                                        <div
                                          className="input-group shadow-lg"
                                          onClick={(e) => e.stopPropagation()}
                                          onTouchStart={(e) => e.stopPropagation()}
                                          onTouchEnd={(e) => e.stopPropagation()}
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
                                            onClick={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            onTouchEnd={(e) => e.stopPropagation()}
                                            className="form-control border-primary"
                                            style={{
                                              fontSize: `${textSettings.fontSize * zoomLevel}px`,
                                              fontFamily: textSettings.fontFamily,
                                              fontWeight: textSettings.fontWeight,
                                              fontStyle: textSettings.fontStyle,
                                              color: textSettings.color,
                                              backgroundColor: textSettings.backgroundColor,
                                              minWidth: isMobileView ? "200px" : "250px",
                                              maxWidth: isMobileView ? "90vw" : "none",
                                              borderWidth: "2px",
                                            }}
                                            placeholder="Type your text and press Enter..."
                                          />
                                          <span className="input-group-text bg-primary text-white">⌨️</span>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                </div>
                              ) : (
                                <img
                                  src={selectedImage?.content || "/placeholder.svg"}
                                  alt={selectedImage?.name}
                                  className="shadow rounded"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                  }}
                                />
                              )}
                            </div>

                            {/* Floating Status Bar */}
                            {isAnnotating && (
                              <div className="position-absolute bottom-0 end-0 m-3">
                                <div className="badge bg-dark text-light px-3 py-2 shadow">
                                  Tool: <span className="text-info fw-bold">{drawingTool}</span>
                                  {drawingTool !== "eraser" && (
                                    <>
                                      | Color: <span style={{ color: brushColor }}>●</span>| Size: {brushRadius}px
                                    </>
                                  )}
                                  {drawingTool === "eraser" && <> | Size: {eraserRadius}px</>}| Zoom:{" "}
                                  {Math.round(zoomLevel * 100)}%
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Text Editing Modal */}
                          {isEditingText && (
                            <div
                              className="position-fixed top-0 start-0 w-100 h-100 forDisplayFlex align-items-center justify-content-center bg-dark bg-opacity-75"
                              style={{ zIndex: 9999 }}
                            >
                              <div
                                className="bg-white rounded-3 shadow-lg shadow p-4 mx-3"
                                style={{ minWidth: "350px", maxWidth: "90vw" }}
                              >
                                <div className="forDisplayFlex align-items-center gap-2 mb-3">
                                  <div className="bg-primary text-white rounded-circle p-2">
                                    <MdPinEnd />
                                  </div>
                                  <h5 className="mb-0 text-primary fw-bold">Edit Text</h5>
                                </div>
                                {/* Text Content Input */}
                                <div className="mb-3">
                                  <label className="form-label text-black small">Text Content</label>
                                  <input
                                    ref={editTextInputRef}
                                    type="text"
                                    value={editingTextValue}
                                    onChange={(e) => setEditingTextValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && editingTextValue.trim()) {
                                        saveTextEdit()
                                      } else if (e.key === "Escape") {
                                        cancelTextEdit()
                                      }
                                    }}
                                    className="form-control form-control-lg border-primary"
                                    placeholder="Enter your text..."
                                    style={{
                                      fontSize: `${textSettings.fontSize}px`,
                                      fontFamily: textSettings.fontFamily,
                                      fontWeight: textSettings.fontWeight,
                                      fontStyle: textSettings.fontStyle,
                                      color: textSettings.color,
                                    }}
                                  />
                                </div>
                                {/* Text Settings Section */}
                                <div className="mb-3">
                                  <h6 className="text-black mb-3 forDisplayFlex align-items-center gap-2">
                                    <MdPinEnd className="text-warning" /> Text Settings
                                  </h6>
                                  <div className="forDisplayFlex flex-column gap-3">
                                    <div>
                                      <label className="form-label text-black small">Text Color</label>
                                      <input
                                        type="color"
                                        value={textSettings.color}
                                        onChange={(e) =>
                                          setTextSettings((prev) => ({ ...prev, color: e.target.value }))
                                        }
                                        className="form-control border form-control-color w-100"
                                        style={{ height: "40px" }}
                                      />
                                    </div>
                                    <div>
                                      <label className="form-label text-black small">
                                        Font Size: {textSettings.fontSize}px
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
                                        className="form-range"
                                      />
                                    </div>
                                    <div>
                                      <label className="form-label text-black small">Font Family</label>
                                      <select
                                        value={textSettings.fontFamily}
                                        onChange={(e) =>
                                          setTextSettings((prev) => ({ ...prev, fontFamily: e.target.value }))
                                        }
                                        className="form-select form-select-sm text-black border-secondary"
                                      >
                                        <option value="Arial">Arial</option>
                                        <option value="Helvetica">Helvetica</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="forDisplayFlex gap-2 justify-content-end">
                                  <button
                                    className="btn btn-success px-4"
                                    onClick={saveTextEdit}
                                    disabled={!editingTextValue.trim()}
                                  >
                                    <MdPinEnd className="me-1" /> Save
                                  </button>
                                  <button className="btn btn-outline-secondary px-4" onClick={cancelTextEdit}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Modal.Body>
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
                    {!isChatEnded && (
                      <VoiceRecorder
                        socket={socket}
                        currentRoomId={currentRoomId}
                        userData={userData}
                        replyingTo={replyingTo}
                        cancelReply={cancelReply}
                        getSenderInfo={getSenderInfo}
                      />
                    )}
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
                      className={`chatn-attachment-button ${isChatEnded || chatData?.PaymentStatus?.toLowerCase() !== "paid" ? "disabled" : ""
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
                <>
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
                        <div
                          className="col-md-4 chat-list-container flex-column justify-content-center align-items-center bg-light"
                          style={{ height: "100vh", textAlign: "center", display: 'flex' }}
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
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManualChat