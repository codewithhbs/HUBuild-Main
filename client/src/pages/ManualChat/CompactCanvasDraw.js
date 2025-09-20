"use client"

import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react"

const CompactCanvasDraw = forwardRef(
  ({ imgSrc, canvasWidth, canvasHeight, brushRadius, brushColor, drawingTool, onDrawingChange }, ref) => {
    const canvasRef = useRef(null)
    const backgroundCanvasRef = useRef(null)
    const overlayCanvasRef = useRef(null)
    const containerRef = useRef(null)

    const [isDrawing, setIsDrawing] = useState(false)
    const [startPoint, setStartPoint] = useState(null)
    const [currentPath, setCurrentPath] = useState([])
    const [allPaths, setAllPaths] = useState([])
    const [backgroundImage, setBackgroundImage] = useState(null)

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

          const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (canvasWidth - scaledWidth) / 2
          const y = (canvasHeight - scaledHeight) / 2

          bgCtx.clearRect(0, 0, canvasWidth, canvasHeight)
          bgCtx.drawImage(img, x, y, scaledWidth, scaledHeight)
          setBackgroundImage(img)
        }
        img.src = imgSrc
      }
    }, [imgSrc, canvasWidth, canvasHeight])

    // Optimized redraw function - no blinking
    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")

      // Use requestAnimationFrame for smooth rendering
      requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        ctx.save()
        ctx.scale(zoom, zoom)
        ctx.translate(panOffset.x / zoom, panOffset.y / zoom)

        // Draw all paths without blinking
        allPaths.forEach((path) => {
          if (path && path.points && path.points.length > 0) {
            drawPath(ctx, path)
          }
        })

        ctx.restore()
      })
    }, [allPaths, canvasWidth, canvasHeight, zoom, panOffset])

    // Optimized path drawing
    const drawPath = useCallback((ctx, path) => {
      if (!path || !path.points || path.points.length === 0) return

      ctx.save()

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.lineWidth = path.radius * 4
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

    const drawBrushPath = (ctx, points) => {
      if (points.length < 2) {
        ctx.beginPath()
        ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, 2 * Math.PI)
        ctx.fill()
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

      if (points.length > 1) {
        const lastPoint = points[points.length - 1]
        const secondLastPoint = points[points.length - 2]
        ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y)
      }

      ctx.stroke()
    }

    const drawRectangle = (ctx, start, end) => {
      const width = end.x - start.x
      const height = end.y - start.y
      ctx.beginPath()
      ctx.rect(start.x, start.y, width, height)
      ctx.stroke()
    }

    const drawCircle = (ctx, start, end) => {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      ctx.beginPath()
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    const drawLine = (ctx, start, end) => {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    const drawArrow = (ctx, start, end) => {
      const headLength = 20
      const angle = Math.atan2(end.y - start.y, end.x - start.x)

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6))
      ctx.stroke()
    }

    // Get mouse position with zoom and pan
    const getMousePos = useCallback(
      (e) => {
        const canvas = overlayCanvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)

        const x = (clientX - rect.left) * scaleX
        const y = (clientY - rect.top) * scaleY

        return {
          x: (x - panOffset.x) / zoom,
          y: (y - panOffset.y) / zoom,
        }
      },
      [zoom, panOffset],
    )

    // Mouse handlers
    const handleMouseDown = useCallback(
      (e) => {
        e.preventDefault()

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

    const handleMouseMove = useCallback(
      (e) => {
        e.preventDefault()

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

        if (drawingTool === "brush" || drawingTool === "eraser") {
          const newPath = [...currentPath, pos]
          setCurrentPath(newPath)

          // Draw current stroke on overlay canvas to prevent blinking
          const overlayCanvas = overlayCanvasRef.current
          if (overlayCanvas) {
            const overlayCtx = overlayCanvas.getContext("2d")
            overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight)
            overlayCtx.save()
            overlayCtx.scale(zoom, zoom)
            overlayCtx.translate(panOffset.x / zoom, panOffset.y / zoom)

            const tempPath = {
              tool: drawingTool,
              color: brushColor,
              radius: brushRadius,
              points: newPath,
            }
            drawPath(overlayCtx, tempPath)
            overlayCtx.restore()
          }
        } else {
          const newPath = [startPoint, pos]
          setCurrentPath(newPath)

          // Draw current shape on overlay
          const overlayCanvas = overlayCanvasRef.current
          if (overlayCanvas) {
            const overlayCtx = overlayCanvas.getContext("2d")
            overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight)
            overlayCtx.save()
            overlayCtx.scale(zoom, zoom)
            overlayCtx.translate(panOffset.x / zoom, panOffset.y / zoom)

            const tempPath = {
              tool: drawingTool,
              color: brushColor,
              radius: brushRadius,
              points: newPath,
            }
            drawPath(overlayCtx, tempPath)
            overlayCtx.restore()
          }
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
        zoom,
        panOffset,
        lastPanPoint,
        canvasWidth,
        canvasHeight,
        drawPath,
      ],
    )

    const handleMouseUp = useCallback(
      (e) => {
        e.preventDefault()

        if (isPanning) {
          setIsPanning(false)
          return
        }

        if (!isDrawing) return

        setIsDrawing(false)

        // Clear overlay and add to main canvas
        const overlayCanvas = overlayCanvasRef.current
        if (overlayCanvas) {
          const overlayCtx = overlayCanvas.getContext("2d")
          overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        }

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
      [
        isDrawing,
        isPanning,
        currentPath,
        drawingTool,
        brushColor,
        brushRadius,
        allPaths,
        onDrawingChange,
        canvasWidth,
        canvasHeight,
      ],
    )

    // Wheel handler for zoom
    const handleWheel = useCallback(
      (e) => {
        e.preventDefault()

        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.min(Math.max(0.1, zoom * delta), 5)

        const rect = overlayCanvasRef.current.getBoundingClientRect()
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
      const overlayCanvas = overlayCanvasRef.current
      if (!canvas || !overlayCanvas) return

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      overlayCanvas.width = canvasWidth
      overlayCanvas.height = canvasHeight

      // Event listeners for overlay canvas only (this is the key fix)
      const events = [
        ["mousedown", handleMouseDown],
        ["mousemove", handleMouseMove],
        ["mouseup", handleMouseUp],
        ["mouseleave", handleMouseUp],
        ["wheel", handleWheel],
      ]

      events.forEach(([event, handler]) => {
        overlayCanvas.addEventListener(event, handler)
      })

      // Touch events
      const touchStart = (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        const mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY,
          button: 0,
        })
        handleMouseDown(mouseEvent)
      }

      const touchMove = (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        })
        handleMouseMove(mouseEvent)
      }

      const touchEnd = (e) => {
        e.preventDefault()
        const mouseEvent = new MouseEvent("mouseup", {})
        handleMouseUp(mouseEvent)
      }

      overlayCanvas.addEventListener("touchstart", touchStart)
      overlayCanvas.addEventListener("touchmove", touchMove)
      overlayCanvas.addEventListener("touchend", touchEnd)

      return () => {
        events.forEach(([event, handler]) => {
          overlayCanvas.removeEventListener(event, handler)
        })
        overlayCanvas.removeEventListener("touchstart", touchStart)
        overlayCanvas.removeEventListener("touchmove", touchMove)
        overlayCanvas.removeEventListener("touchend", touchEnd)
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
      const overlayCanvas = overlayCanvasRef.current
      if (canvas && overlayCanvas) {
        const ctx = canvas.getContext("2d")
        const overlayCtx = overlayCanvas.getContext("2d")
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight)
      }
    }, [canvasWidth, canvasHeight])

    const undo = useCallback(() => {
      setAllPaths((prev) => prev.slice(0, -1))
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

      const mergedCanvas = document.createElement("canvas")
      mergedCanvas.width = canvasWidth
      mergedCanvas.height = canvasHeight
      const ctx = mergedCanvas.getContext("2d")

      ctx.drawImage(bgCanvas, 0, 0)

      ctx.save()
      allPaths.forEach((path) => {
        if (path && path.points && path.points.length > 0) {
          drawPath(ctx, path)
        }
      })
      ctx.restore()

      return mergedCanvas.toDataURL("image/png")
    }, [canvasWidth, canvasHeight, allPaths, drawPath])

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
          borderRadius: "8px",
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          width: canvasWidth,
          height: canvasHeight,
        }}
      >
        {/* Background canvas */}
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
          width={canvasWidth}
          height={canvasHeight}
        />

        {/* Main drawing canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            pointerEvents: "none",
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: "0 0",
          }}
          width={canvasWidth}
          height={canvasHeight}
        />

        {/* Overlay canvas for current drawing */}
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 3,
            cursor: isPanning ? "grabbing" : drawingTool === "eraser" ? "crosshair" : "crosshair",
          }}
          width={canvasWidth}
          height={canvasHeight}
        />

        {/* Zoom indicator */}
        {zoom !== 1 && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "11px",
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

CompactCanvasDraw.displayName = "CompactCanvasDraw"

export default CompactCanvasDraw
