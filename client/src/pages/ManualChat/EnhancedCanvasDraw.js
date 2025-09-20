"use client"

import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react"

const EnhancedCanvasDraw = forwardRef(
  ({ imgSrc, canvasWidth, canvasHeight, brushRadius, brushColor, drawingTool, onDrawingChange }, ref) => {
    const canvasRef = useRef(null)
    const backgroundCanvasRef = useRef(null)
    const containerRef = useRef(null)

    const [isDrawing, setIsDrawing] = useState(false)
    const [startPoint, setStartPoint] = useState(null)
    const [currentPath, setCurrentPath] = useState([])
    const [allPaths, setAllPaths] = useState([])
    const [backgroundImage, setBackgroundImage] = useState(null)
    const [isErasing, setIsErasing] = useState(false)

    // Zoom functionality
    const [zoom, setZoom] = useState(1)
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

    // Load background image
    useEffect(() => {
      if (imgSrc && backgroundCanvasRef.current) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const bgCanvas = backgroundCanvasRef.current
          const bgCtx = bgCanvas.getContext("2d")
          bgCanvas.width = canvasWidth
          bgCanvas.height = canvasHeight

          // Calculate scaling to fit image in canvas while maintaining aspect ratio
          const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (canvasWidth - scaledWidth) / 2
          const y = (canvasHeight - scaledHeight) / 2

          bgCtx.clearRect(0, 0, canvasWidth, canvasHeight)
          bgCtx.drawImage(img, x, y, scaledWidth, scaledHeight)
          setBackgroundImage(img)
          redrawCanvas()
        }
        img.src = imgSrc
      }
    }, [imgSrc, canvasWidth, canvasHeight])

    // Redraw canvas with all paths
    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // Save context for zoom and pan
      ctx.save()
      ctx.scale(zoom, zoom)
      ctx.translate(panOffset.x / zoom, panOffset.y / zoom)

      // Draw all completed paths
      allPaths.forEach((path) => {
        if (path && path.points && path.points.length > 0) {
          drawPath(ctx, path)
        }
      })

      ctx.restore()
    }, [allPaths, canvasWidth, canvasHeight, zoom, panOffset])

    // Draw a single path based on its type
    const drawPath = useCallback((ctx, path) => {
      if (!path || !path.points || path.points.length === 0) return

      ctx.save()

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.lineWidth = path.radius * 4 // Eraser is bigger
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = path.color
        ctx.lineWidth = path.radius * 2
      }

      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      switch (path.tool) {
        case "brush":
        case "eraser":
          drawBrushPath(ctx, path.points)
          break
        case "rectangle":
          drawRectangle(ctx, path.points[0], path.points[path.points.length - 1])
          break
        case "circle":
          drawCircle(ctx, path.points[0], path.points[path.points.length - 1])
          break
        case "arrow":
          drawArrow(ctx, path.points[0], path.points[path.points.length - 1])
          break
        case "line":
          drawLine(ctx, path.points[0], path.points[path.points.length - 1])
          break
        default:
          drawBrushPath(ctx, path.points)
      }

      ctx.restore()
    }, [])

    // Draw brush stroke
    const drawBrushPath = (ctx, points) => {
      if (points.length < 2) {
        // Single point
        ctx.beginPath()
        ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, 2 * Math.PI)
        if (ctx.globalCompositeOperation === "destination-out") {
          ctx.fill()
        } else {
          ctx.fill()
        }
        return
      }

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        const point = points[i]
        const prevPoint = points[i - 1]
        const midPoint = {
          x: (point.x + prevPoint.x) / 2,
          y: (point.y + prevPoint.y) / 2,
        }
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midPoint.x, midPoint.y)
      }

      // Draw the last segment
      if (points.length > 1) {
        const lastPoint = points[points.length - 1]
        const secondLastPoint = points[points.length - 2]
        ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y)
      }

      ctx.stroke()
    }

    // Draw rectangle
    const drawRectangle = (ctx, start, end) => {
      const width = end.x - start.x
      const height = end.y - start.y

      ctx.beginPath()
      ctx.rect(start.x, start.y, width, height)
      ctx.stroke()
    }

    // Draw circle
    const drawCircle = (ctx, start, end) => {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))

      ctx.beginPath()
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw line
    const drawLine = (ctx, start, end) => {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    // Draw arrow
    const drawArrow = (ctx, start, end) => {
      const headLength = 20 // Length of the arrow head
      const angle = Math.atan2(end.y - start.y, end.x - start.x)

      // Draw arrow line
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      // Draw arrow head
      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6))
      ctx.stroke()
    }

    // Get mouse position relative to canvas with zoom and pan
    const getMousePos = useCallback(
      (e) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)

        const x = (clientX - rect.left) * scaleX
        const y = (clientY - rect.top) * scaleY

        // Adjust for zoom and pan
        return {
          x: (x - panOffset.x) / zoom,
          y: (y - panOffset.y) / zoom,
        }
      },
      [zoom, panOffset],
    )

    // Mouse down handler
    const handleMouseDown = useCallback(
      (e) => {
        e.preventDefault()

        // Check if it's a pan operation (middle mouse or ctrl+click)
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
          setIsPanning(true)
          setLastPanPoint({ x: e.clientX, y: e.clientY })
          return
        }

        const pos = getMousePos(e)
        setIsDrawing(true)
        setStartPoint(pos)

        if (drawingTool === "brush" || drawingTool === "eraser") {
          setCurrentPath([pos])
        } else {
          setCurrentPath([pos, pos])
        }
      },
      [getMousePos, drawingTool],
    )

    // Mouse move handler
    const handleMouseMove = useCallback(
      (e) => {
        e.preventDefault()

        // Handle panning
        if (isPanning) {
          const deltaX = e.clientX - lastPanPoint.x
          const deltaY = e.clientY - lastPanPoint.y

          setPanOffset((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }))

          setLastPanPoint({ x: e.clientX, y: e.clientY })
          return
        }

        if (!isDrawing) return

        const pos = getMousePos(e)
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        if (drawingTool === "brush" || drawingTool === "eraser") {
          // For brush and eraser, add point to current path
          const newPath = [...currentPath, pos]
          setCurrentPath(newPath)

          // Draw the current stroke without clearing previous drawings
          redrawCanvas()

          // Draw current path being drawn
          ctx.save()
          ctx.scale(zoom, zoom)
          ctx.translate(panOffset.x / zoom, panOffset.y / zoom)

          const tempPath = {
            tool: drawingTool,
            color: brushColor,
            radius: brushRadius,
            points: newPath,
          }
          drawPath(ctx, tempPath)

          ctx.restore()
        } else {
          // For shapes, update end point
          const newPath = [startPoint, pos]
          setCurrentPath(newPath)

          // Redraw everything including current shape
          redrawCanvas()

          const canvas = canvasRef.current
          const ctx = canvas.getContext("2d")

          ctx.save()
          ctx.scale(zoom, zoom)
          ctx.translate(panOffset.x / zoom, panOffset.y / zoom)

          const tempPath = {
            tool: drawingTool,
            color: brushColor,
            radius: brushRadius,
            points: newPath,
          }
          drawPath(ctx, tempPath)

          ctx.restore()
        }
      },
      [
        isDrawing,
        isPanning,
        getMousePos,
        drawingTool,
        brushColor,
        brushRadius,
        startPoint,
        currentPath,
        redrawCanvas,
        zoom,
        panOffset,
        lastPanPoint,
      ],
    )

    // Mouse up handler
    const handleMouseUp = useCallback(
      (e) => {
        e.preventDefault()

        if (isPanning) {
          setIsPanning(false)
          return
        }

        if (!isDrawing) return

        setIsDrawing(false)

        // Add current path to all paths
        if (currentPath.length > 0) {
          const newPath = {
            id: Date.now() + Math.random(),
            tool: drawingTool,
            color: brushColor,
            radius: brushRadius,
            points: [...currentPath],
          }

          const updatedPaths = [...allPaths, newPath]
          setAllPaths(updatedPaths)

          if (onDrawingChange) {
            onDrawingChange(updatedPaths)
          }
        }

        setCurrentPath([])
        setStartPoint(null)
      },
      [isDrawing, isPanning, currentPath, drawingTool, brushColor, brushRadius, allPaths, onDrawingChange],
    )

    // Wheel handler for zoom
    const handleWheel = useCallback(
      (e) => {
        e.preventDefault()

        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.min(Math.max(0.1, zoom * delta), 5)

        // Zoom towards mouse position
        const rect = canvasRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const zoomPoint = {
          x: (mouseX - panOffset.x) / zoom,
          y: (mouseY - panOffset.y) / zoom,
        }

        setPanOffset({
          x: mouseX - zoomPoint.x * newZoom,
          y: mouseY - zoomPoint.y * newZoom,
        })

        setZoom(newZoom)
      },
      [zoom, panOffset],
    )

    // Setup canvas
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Mouse events
      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseup", handleMouseUp)
      canvas.addEventListener("mouseleave", handleMouseUp)
      canvas.addEventListener("wheel", handleWheel)

      // Touch events for mobile (non-passive to allow preventDefault)
      const onTouchStart = (e) => {
        e.preventDefault()
        const touch = e.touches && e.touches[0]
        if (!touch) return
        const mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY,
          button: 0,
        })
        handleMouseDown(mouseEvent)
      }

      const onTouchMove = (e) => {
        e.preventDefault()
        const touch = e.touches && e.touches[0]
        if (!touch) return
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        })
        handleMouseMove(mouseEvent)
      }

      const onTouchEnd = (e) => {
        e.preventDefault()
        const mouseEvent = new MouseEvent("mouseup", { button: 0 })
        handleMouseUp(mouseEvent)
      }

      canvas.addEventListener("touchstart", onTouchStart, { passive: false })
      canvas.addEventListener("touchmove", onTouchMove, { passive: false })
      canvas.addEventListener("touchend", onTouchEnd, { passive: false })

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("mouseleave", handleMouseUp)
        canvas.removeEventListener("wheel", handleWheel)
        canvas.removeEventListener("touchstart", onTouchStart)
        canvas.removeEventListener("touchmove", onTouchMove)
        canvas.removeEventListener("touchend", onTouchEnd)
      }
    }, [canvasWidth, canvasHeight, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel])

    // Redraw when paths change
    useEffect(() => {
      redrawCanvas()
    }, [redrawCanvas])

    // Public methods
    const clear = useCallback(() => {
      setAllPaths([])
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      }
    }, [canvasWidth, canvasHeight])

    const undo = useCallback(() => {
      setAllPaths((prev) => {
        const newPaths = prev.slice(0, -1)
        return newPaths
      })
    }, [])

    const zoomIn = useCallback(() => {
      setZoom((prev) => Math.min(prev * 1.2, 5))
    }, [])

    const zoomOut = useCallback(() => {
      setZoom((prev) => Math.max(prev / 1.2, 0.1))
    }, [])

    const resetZoom = useCallback(() => {
      setZoom(1)
      setPanOffset({ x: 0, y: 0 })
    }, [])

    const getImageData = useCallback(() => {
      const canvas = canvasRef.current
      const bgCanvas = backgroundCanvasRef.current
      if (!canvas || !bgCanvas) return null

      // Create a new canvas to merge background and drawing
      const mergedCanvas = document.createElement("canvas")
      mergedCanvas.width = canvasWidth
      mergedCanvas.height = canvasHeight
      const ctx = mergedCanvas.getContext("2d")

      // Draw background
      ctx.drawImage(bgCanvas, 0, 0)

      // Draw annotations without zoom/pan transformations
      ctx.save()
      allPaths.forEach((path) => {
        if (path && path.points && path.points.length > 0) {
          drawPath(ctx, path)
        }
      })
      ctx.restore()

      return mergedCanvas.toDataURL("image/png")
    }, [canvasWidth, canvasHeight, allPaths, drawPath])

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        clear,
        undo,
        zoomIn,
        zoomOut,
        resetZoom,
        getImageData,
        canvas: {
          drawing: canvasRef.current,
        },
      }),
      [clear, undo, zoomIn, zoomOut, resetZoom, getImageData],
    )

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          overflow: "hidden",
          border: "2px solid #e0e0e0",
          borderRadius: "12px",
          background: "#f8f9fa",
        }}
      >
        {/* Background canvas for image */}
        <canvas
          ref={backgroundCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 1,
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: "0 0",
          }}
        />

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "relative",
            cursor: isPanning
              ? "grabbing"
              : drawingTool === "eraser"
                ? "crosshair"
                : drawingTool === "brush"
                  ? "crosshair"
                  : "crosshair",
            zIndex: 2,
            background: "transparent",
            touchAction: "none",
          }}
          width={canvasWidth}
          height={canvasHeight}
        />

        {/* Zoom indicator */}
        {zoom !== 1 && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 10,
            }}
          >
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
    )
  },
)

EnhancedCanvasDraw.displayName = "EnhancedCanvasDraw"

export default EnhancedCanvasDraw
