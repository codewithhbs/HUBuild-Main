"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { 
  MdFormatBold, 
  MdFormatItalic, 
  MdFormatUnderlined, 
  MdFormatAlignLeft, 
  MdFormatAlignCenter, 
  MdFormatAlignRight,
  MdFormatColorFill,
  MdEdit,
  MdDelete,
  MdClose
} from "react-icons/md"

const CompactTextOverlay = ({
  canvasWidth,
  canvasHeight,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
  isAddingText,
  setIsAddingText,
  textSettings,
  onTextAdd,
}) => {
  const [textElements, setTextElements] = useState([])
  const [selectedTextId, setSelectedTextId] = useState(null)
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [showFormatting, setShowFormatting] = useState(false)
  const [currentTextSettings, setCurrentTextSettings] = useState(textSettings)

  const overlayRef = useRef(null)
  const editInputRef = useRef(null)

  // Extended color palette
  const extendedColors = [
    "#ff0000", "#ff4500", "#ff8c00", "#ffd700", "#ffff00", "#adff2f", 
    "#00ff00", "#00fa9a", "#00ffff", "#00bfff", "#0000ff", "#8a2be2", 
    "#ff00ff", "#ff1493", "#c71585", "#800000", "#8b4513", "#006400",
    "#000000", "#696969", "#a9a9a9", "#d3d3d3", "#ffffff", "#f5f5f5"
  ]

  const generateTextId = () => `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const saveTextEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      setTextElements((prev) => prev.map((el) => (el.id === editingId ? { ...el, text: editValue.trim() } : el)))
    }
    setIsEditing(false)
    setEditingId(null)
    setEditValue("")
  }, [editingId, editValue])

  const handleOverlayClick = useCallback(
    (e) => {
      // Check if click is on a text element or its controls
      const clickedElement = e.target.closest(".text-element, .text-controls, input, .formatting-toolbar")

      if (clickedElement) {
        // If clicked on text element, don't unfocus
        return
      }

      // If currently editing, save and exit edit mode
      if (isEditing) {
        if (editValue.trim()) {
          saveTextEdit()
        } else {
          setIsEditing(false)
          setEditingId(null)
          setEditValue("")
        }
        return
      }

      // Hide formatting toolbar when clicking elsewhere
      setShowFormatting(false)

      // Unfocus any selected text
      setSelectedTextId(null)

      // Handle adding new text
      if (isAddingText && !isDragging) {
        const rect = overlayRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - panOffset.x) / zoom
        const y = (e.clientY - rect.top - panOffset.y) / zoom

        // Ensure click is within canvas bounds
        if (x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight) {
          setTextPosition({ x, y })
        }
      }
    },
    [isAddingText, isDragging, isEditing, panOffset, zoom, canvasWidth, canvasHeight, editValue, saveTextEdit],
  )

  const addTextElement = useCallback(
    (x, y, text) => {
      if (!text.trim()) return

      const newElement = {
        id: generateTextId(),
        text: text.trim(),
        x,
        y,
        ...currentTextSettings,
        zIndex: textElements.length + 1,
      }

      const newElements = [...textElements, newElement]
      setTextElements(newElements)
      setTextInput("")
      setTextPosition(null)
      setIsAddingText(false)

      if (onTextAdd) {
        onTextAdd(newElements)
      }
    },
    [textElements, currentTextSettings, setIsAddingText, onTextAdd],
  )

  const handleTextMouseDown = useCallback(
    (e, textId) => {
      e.preventDefault()
      e.stopPropagation()

      setSelectedTextId(textId)
      setIsDragging(true)

      const textElement = textElements.find((el) => el.id === textId)
      if (!textElement) return

      const rect = overlayRef.current.getBoundingClientRect()
      const startX = (e.clientX - rect.left - panOffset.x) / zoom
      const startY = (e.clientY - rect.top - panOffset.y) / zoom
      const offsetX = startX - textElement.x
      const offsetY = startY - textElement.y

      const handleMouseMove = (moveEvent) => {
        const newX = (moveEvent.clientX - rect.left - panOffset.x) / zoom - offsetX
        const newY = (moveEvent.clientY - rect.top - panOffset.y) / zoom - offsetY

        const boundedX = Math.max(0, Math.min(canvasWidth - 50, newX))
        const boundedY = Math.max(textElement.fontSize, Math.min(canvasHeight - 10, newY))

        setTextElements((prev) => prev.map((el) => (el.id === textId ? { ...el, x: boundedX, y: boundedY } : el)))
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [textElements, panOffset, zoom, canvasWidth, canvasHeight],
  )

  const handleTextDoubleClick = useCallback(
    (textId) => {
      const element = textElements.find((el) => el.id === textId)
      if (!element) return

      setIsEditing(true)
      setEditingId(textId)
      setEditValue(element.text)
      setSelectedTextId(textId)
      setCurrentTextSettings({
        fontSize: element.fontSize,
        color: element.color,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textDecoration: element.textDecoration,
        textAlign: element.textAlign || "left",
        backgroundColor: element.backgroundColor,
        padding: element.padding,
      })

      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus()
          editInputRef.current.select()
        }
      }, 100)
    },
    [textElements],
  )

  const deleteTextElement = useCallback((textId) => {
    setTextElements((prev) => prev.filter((el) => el.id !== textId))
    setSelectedTextId(null)
    setShowFormatting(false)
  }, [])

  const clearAllText = useCallback(() => {
    setTextElements([])
    setSelectedTextId(null)
    setTextPosition(null)
    setTextInput("")
    setShowFormatting(false)
  }, [])

  // Update text formatting
  const updateTextFormatting = useCallback((property, value) => {
    if (selectedTextId) {
      setTextElements(prev => 
        prev.map(el => el.id === selectedTextId ? { ...el, [property]: value } : el)
      )
    } else {
      setCurrentTextSettings(prev => ({ ...prev, [property]: value }))
    }
  }, [selectedTextId])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Professional escape handling
        if (isEditing) {
          // Cancel editing without saving
          setIsEditing(false)
          setEditingId(null)
          setEditValue("")
        } else if (selectedTextId) {
          // Unfocus selected text
          setSelectedTextId(null)
          setShowFormatting(false)
        } else if (isAddingText) {
          // Exit text adding mode
          setIsAddingText(false)
          setTextPosition(null)
          setTextInput("")
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isEditing, selectedTextId, isAddingText])

  // Get the current element's settings
  const getSelectedElementSettings = useCallback(() => {
    if (selectedTextId) {
      const element = textElements.find(el => el.id === selectedTextId)
      if (element) {
        return {
          fontWeight: element.fontWeight || "normal",
          fontStyle: element.fontStyle || "normal",
          textDecoration: element.textDecoration || "none",
          textAlign: element.textAlign || "left",
          color: element.color || "#000000",
          backgroundColor: element.backgroundColor || "transparent"
        }
      }
    }
    return {
      fontWeight: currentTextSettings.fontWeight || "normal",
      fontStyle: currentTextSettings.fontStyle || "normal",
      textDecoration: currentTextSettings.textDecoration || "none",
      textAlign: currentTextSettings.textAlign || "left",
      color: currentTextSettings.color || "#000000",
      backgroundColor: currentTextSettings.backgroundColor || "transparent"
    }
  }, [selectedTextId, textElements, currentTextSettings])

  const settings = getSelectedElementSettings()

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: canvasWidth,
        height: canvasHeight,
        zIndex: 10,
        cursor: isAddingText ? "crosshair" : "default",
        transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
        transformOrigin: "0 0",
      }}
      onClick={handleOverlayClick}
    >
      {/* Text Elements */}
      {textElements.map((element) => (
        <div
          key={element.id}
          className="text-element" // Add this className
          style={{
            position: "absolute",
            left: element.x,
            top: element.y,
            fontSize: `${element.fontSize}px`,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            textAlign: element.textAlign || "left",
            color: element.color,
            backgroundColor: element.backgroundColor,
            padding: `${element.padding}px`,
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            zIndex: element.zIndex,
            border: selectedTextId === element.id ? "2px dashed #007bff" : "1px solid transparent",
            borderRadius: "3px",
            minWidth: "20px",
            whiteSpace: "nowrap",
            boxShadow: selectedTextId === element.id ? "0 0 8px rgba(0,123,255,0.4)" : "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          onMouseDown={(e) => handleTextMouseDown(e, element.id)}
          onDoubleClick={() => handleTextDoubleClick(element.id)}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedTextId(element.id)
            setShowFormatting(true)
          }}
        >
          {element.text}
          {selectedTextId === element.id && (
            <div
              className="text-controls" // Add this className
              style={{
                position: "absolute",
                top: "-30px",
                right: "0",
                display: "flex",
                gap: "3px",
                background: "rgba(255,255,255,0.95)",
                padding: "2px",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <button
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTextDoubleClick(element.id)
                }}
                title="Edit text"
              >
                <MdEdit size={14} />
              </button>
              <button
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTextElement(element.id)
                }}
                title="Delete text"
              >
                <MdDelete size={14} />
              </button>
              <button
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTextId(null)
                  setShowFormatting(false)
                }}
                title="Deselect"
              >
                <MdClose size={14} />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Text Formatting Toolbar */}
      {showFormatting && selectedTextId && (
        <div 
          className="formatting-toolbar"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "white",
            padding: "6px",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 100,
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            maxWidth: "300px"
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Text Style Controls */}
          <div style={{ display: "flex", gap: "2px" }}>
            <button
              style={{
                background: settings.fontWeight === "bold" ? "#007bff" : "#f8f9fa",
                color: settings.fontWeight === "bold" ? "white" : "#212529",
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("fontWeight", settings.fontWeight === "bold" ? "normal" : "bold")}
              title="Bold"
            >
              <MdFormatBold size={16} />
            </button>
            <button
              style={{
                background: settings.fontStyle === "italic" ? "#007bff" : "#f8f9fa",
                color: settings.fontStyle === "italic" ? "white" : "#212529",
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("fontStyle", settings.fontStyle === "italic" ? "normal" : "italic")}
              title="Italic"
            >
              <MdFormatItalic size={16} />
            </button>
            <button
              style={{
                background: settings.textDecoration === "underline" ? "#007bff" : "#f8f9fa",
                color: settings.textDecoration === "underline" ? "white" : "#212529",
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("textDecoration", settings.textDecoration === "underline" ? "none" : "underline")}
              title="Underline"
            >
              <MdFormatUnderlined size={16} />
            </button>
          </div>

          {/* Text Alignment */}
          <div style={{ display: "flex", gap: "2px" }}>
            <button
              style={{
                background: settings.textAlign === "left" ? "#007bff" : "#f8f9fa",
                color: settings.textAlign === "left" ? "white" : "#212529",
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("textAlign", "left")}
              title="Align Left"
            >
              <MdFormatAlignLeft size={16} />
            </button>
            <button
              style={{
                background: settings.textAlign === "center" ? "#007bff" : "#f8f9fa",
                color: settings.textAlign === "center" ? "white" : "#212529",
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("textAlign", "center")}
              title="Align Center"
            >
              <MdFormatAlignCenter size={16} />
            </button>
            <button
              style={{
                background: settings.textAlign === "right" ? "#007bff" : "#f8f9fa",
                color: settings.textAlign === "right" ? "white" : "#212529",
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "4px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("textAlign", "right")}
              title="Align Right"
            >
              <MdFormatAlignRight size={16} />
            </button>
          </div>

          {/* Color Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="color"
                value={settings.color}
                onChange={(e) => updateTextFormatting("color", e.target.value)}
                style={{
                  width: "24px",
                  height: "24px",
                  border: "1px solid #dee2e6",
                  borderRadius: "3px",
                  cursor: "pointer",
                  padding: 0,
                }}
                title="Text Color"
              />
            </div>
            <div style={{ position: "relative" }}>
              <button
                style={{
                  background: "#f8f9fa",
                  color: "#212529",
                  border: "1px solid #dee2e6",
                  borderRadius: "3px",
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Background Color"
              >
                <MdFormatColorFill size={16} />
                <input
                  type="color"
                  value={settings.backgroundColor !== "transparent" ? settings.backgroundColor : "#ffffff"}
                  onChange={(e) => updateTextFormatting("backgroundColor", e.target.value)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <select
              value={textElements.find(el => el.id === selectedTextId)?.fontSize || currentTextSettings.fontSize}
              onChange={(e) => updateTextFormatting("fontSize", parseInt(e.target.value))}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "2px",
                fontSize: "12px",
              }}
            >
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          {/* Font Family */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <select
              value={textElements.find(el => el.id === selectedTextId)?.fontFamily || currentTextSettings.fontFamily}
              onChange={(e) => updateTextFormatting("fontFamily", e.target.value)}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "3px",
                padding: "2px",
                fontSize: "12px",
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Impact">Impact</option>
            </select>
          </div>
        </div>
      )}

      {/* Color Palette */}
      {showFormatting && selectedTextId && (
        <div
          className="formatting-toolbar color-palette"
          style={{
            position: "absolute",
            top: "60px",
            left: "10px",
            background: "white",
            padding: "6px",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 100,
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "4px",
            maxWidth: "300px"
          }}
          onClick={e => e.stopPropagation()}
        >
          {extendedColors.map(color => (
            <div
              key={color}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: color,
                border: settings.color === color ? "2px solid #007bff" : "1px solid #dee2e6",
                borderRadius: "3px",
                cursor: "pointer",
              }}
              onClick={() => updateTextFormatting("color", color)}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Text Input Field */}
      {textPosition && (
        <div
          style={{
            position: "absolute",
            top: textPosition.y,
            left: textPosition.x,
            zIndex: 100,
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
            onBlur={(e) => {
              // Only auto-add if there's text and blur wasn't caused by clicking controls
              const relatedTarget = e.relatedTarget
              if (textInput.trim() && !relatedTarget?.closest(".text-controls, .formatting-toolbar")) {
                addTextElement(textPosition.x, textPosition.y, textInput)
              } else if (!textInput.trim()) {
                setTextPosition(null)
                setIsAddingText(false)
              }
            }}
            style={{
              fontSize: `${currentTextSettings.fontSize}px`,
              fontFamily: currentTextSettings.fontFamily,
              fontWeight: currentTextSettings.fontWeight,
              fontStyle: currentTextSettings.fontStyle,
              textDecoration: currentTextSettings.textDecoration,
              textAlign: currentTextSettings.textAlign,
              color: currentTextSettings.color,
              backgroundColor: currentTextSettings.backgroundColor,
              border: "2px solid #007bff",
              borderRadius: "3px",
              padding: "3px 6px",
              minWidth: "120px",
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
            }}
            placeholder="Enter text..."
          />
          <div
            style={{
              position: "absolute",
              top: "-25px",
              left: "0",
              fontSize: "10px",
              color: "#6c757d",
              background: "rgba(255,255,255,0.9)",
              padding: "1px 4px",
              borderRadius: "2px",
              whiteSpace: "nowrap",
            }}
          >
            Press Enter to add, Esc to cancel
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "6px",
              minWidth: "300px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <h6 style={{ margin: "0 0 10px 0" }}>Edit Text</h6>
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveTextEdit()
                } else if (e.key === "Escape") {
                  setIsEditing(false)
                  setEditingId(null)
                  setEditValue("")
                }
              }}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ddd",
                borderRadius: "3px",
                marginBottom: "10px",
                outline: "none",
              }}
              placeholder="Enter text..."
            />
            
            {/* Text Formatting Controls */}
            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                <button
                  onClick={() => setCurrentTextSettings(prev => ({ ...prev, fontWeight: prev.fontWeight === "bold" ? "normal" : "bold" }))}
                  style={{
                    background: currentTextSettings.fontWeight === "bold" ? "#007bff" : "#f8f9fa",
                    color: currentTextSettings.fontWeight === "bold" ? "white" : "#212529",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdFormatBold size={16} />
                </button>
                <button
                  onClick={() => setCurrentTextSettings(prev => ({ ...prev, fontStyle: prev.fontStyle === "italic" ? "normal" : "italic" }))}
                  style={{
                    background: currentTextSettings.fontStyle === "italic" ? "#007bff" : "#f8f9fa",
                    color: currentTextSettings.fontStyle === "italic" ? "white" : "#212529",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdFormatItalic size={16} />
                </button>
                <button
                  onClick={() => setCurrentTextSettings(prev => ({ ...prev, textDecoration: prev.textDecoration === "underline" ? "none" : "underline" }))}
                  style={{
                    background: currentTextSettings.textDecoration === "underline" ? "#007bff" : "#f8f9fa",
                    color: currentTextSettings.textDecoration === "underline" ? "white" : "#212529",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdFormatUnderlined size={16} />
                </button>
              </div>
              
              <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                <button
                  onClick={() => setCurrentTextSettings(prev => ({ ...prev, textAlign: "left" }))}
                  style={{
                    background: currentTextSettings.textAlign === "left" ? "#007bff" : "#f8f9fa",
                    color: currentTextSettings.textAlign === "left" ? "white" : "#212529",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdFormatAlignLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentTextSettings(prev => ({ ...prev, textAlign: "center" }))}
                  style={{
                    background: currentTextSettings.textAlign === "center" ? "#007bff" : "#f8f9fa",
                    color: currentTextSettings.textAlign === "center" ? "white" : "#212529",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdFormatAlignCenter size={16} />
                </button>
                <button
                  onClick={() => setCurrentTextSettings(prev => ({ ...prev, textAlign: "right" }))}
                  style={{
                    background: currentTextSettings.textAlign === "right" ? "#007bff" : "#f8f9fa",
                    color: currentTextSettings.textAlign === "right" ? "white" : "#212529",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdFormatAlignRight size={16} />
                </button>
              </div>
              
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                <label style={{ fontSize: "12px", marginRight: "5px" }}>Color:</label>
                <input
                  type="color"
                  value={currentTextSettings.color}
                  onChange={(e) => setCurrentTextSettings(prev => ({ ...prev, color: e.target.value }))}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                />
                
                <label style={{ fontSize: "12px", marginLeft: "10px", marginRight: "5px" }}>Font:</label>
                <select
                  value={currentTextSettings.fontFamily}
                  onChange={(e) => setCurrentTextSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "3px",
                    padding: "2px",
                    fontSize: "12px",
                  }}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={saveTextEdit}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditingId(null)
                  setEditValue("")
                }}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompactTextOverlay
