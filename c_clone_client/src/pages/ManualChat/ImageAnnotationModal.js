"use client"

import { useState, useRef, useEffect } from "react"
import { Modal, Button, ButtonGroup } from "react-bootstrap"
import { MdBrush, MdUndo, MdClear, MdSend, MdAttachment } from "react-icons/md"
import CanvasDraw from "react-canvas-draw"



const ImageAnnotationModal = ({ show, onHide, selectedImage, onSendAnnotation }) => {
  const [brushColor, setBrushColor] = useState("#ff0000")
  const [brushRadius, setBrushRadius] = useState(2)
  const [isAnnotating, setIsAnnotating] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const canvasRef = useRef(null)

  // Calculate responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768
      const maxWidth = isMobile ? window.innerWidth - 40 : Math.min(800, window.innerWidth - 100)
      const maxHeight = isMobile ? window.innerHeight - 200 : Math.min(600, window.innerHeight - 300)

      setCanvasSize({ width: maxWidth, height: maxHeight })
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo()
    }
  }

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
  }

  const handleSendAnnotation = async () => {
    if (!canvasRef.current) return

    try {
      // Get the canvas element and create a new canvas to combine image + annotations
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // Create image element
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx?.drawImage(img, 0, 0)

        // Get annotation data and draw it on top
        const annotationCanvas = canvasRef.current.canvas.drawing
        if (annotationCanvas) {
          ctx?.drawImage(annotationCanvas, 0, 0, canvas.width, canvas.height)
        }

        // Get final annotated image as data URL
        const annotatedDataUrl = canvas.toDataURL("image/png")
        onSendAnnotation(annotatedDataUrl)
      }

      img.src = selectedImage?.content || ""
    } catch (error) {
      console.error("Error creating annotated image:", error)
    }
  }

  const handleCloseModal = () => {
    setIsAnnotating(false)
    if (canvasRef.current) {
      canvasRef.current.clear()
    }
    onHide()
  }

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      centered
      size="xl"
      className="image-annotation-modal"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <MdBrush className="me-2 text-primary" />
          {isAnnotating ? "Annotate Image" : "View Image"} - {selectedImage?.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 position-relative">
        {selectedImage && (
          <div className="annotation-container">
            {/* Annotation Controls */}
            {isAnnotating && (
              <div className="annotation-controls bg-light p-2 p-md-3 border-bottom">
                <div className="row align-items-center g-2">
                  <div className="col-12 col-md-8">
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 gap-md-3">
                      <div className="d-flex align-items-center">
                        <label className="form-label me-2 mb-0 fw-semibold small">Color:</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={brushColor}
                          onChange={(e) => setBrushColor(e.target.value)}
                          style={{ width: "35px", height: "35px" }}
                        />
                      </div>
                      <div className="d-flex align-items-center flex-grow-1">
                        <label className="form-label me-2 mb-0 fw-semibold small">Size:</label>
                        <input
                          type="range"
                          className="form-range me-2"
                          min="1"
                          max="10"
                          value={brushRadius}
                          onChange={(e) => setBrushRadius(Number.parseInt(e.target.value))}
                          style={{ minWidth: "80px" }}
                        />
                        <span className="badge bg-secondary small">{brushRadius}px</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <ButtonGroup className="w-100 w-md-auto float-md-end" size="sm">
                      <Button
                        variant="outline-warning"
                        onClick={handleUndo}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <MdUndo className="me-1" />
                        <span className="d-none d-sm-inline">Undo</span>
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={handleClear}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <MdClear className="me-1" />
                        <span className="d-none d-sm-inline">Clear</span>
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas Container */}
            <div className="canvas-container d-flex justify-content-center align-items-center p-2 p-md-3">
              {isAnnotating ? (
                <div className="position-relative">
                  <CanvasDraw
                    ref={canvasRef}
                    imgSrc={selectedImage?.content}
                    canvasWidth={canvasSize.width}
                    canvasHeight={canvasSize.height}
                    loadTimeOffset={10}
                    brushRadius={brushRadius}
                    brushColor={brushColor}
                    lazyRadius={0}
                    className="border rounded shadow-sm"
                    hideGrid={true}
                    disabled={false}
                    enablePanAndZoom={false}
                  />
                </div>
              ) : (
                <img
                  src={selectedImage?.content || "/placeholder.svg"}
                  alt={selectedImage?.name}
                  className="img-fluid rounded shadow-sm"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light p-2 p-md-3">
        <div className="d-flex flex-column flex-md-row justify-content-between w-100 gap-2">
          <div className="d-flex gap-2">
            {!isAnnotating ? (
              <Button
                variant="primary"
                onClick={() => setIsAnnotating(true)}
                className="d-flex align-items-center"
                size="sm"
              >
                <MdBrush className="me-2" />
                Start Annotating
              </Button>
            ) : (
              <Button variant="outline-secondary" onClick={() => setIsAnnotating(false)} size="sm">
                View Only
              </Button>
            )}
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {isAnnotating && (
              <Button variant="success" onClick={handleSendAnnotation} className="d-flex align-items-center" size="sm">
                <MdSend className="me-2" />
                Send to Chat
              </Button>
            )}

            <a
              href={selectedImage?.content}
              download={selectedImage?.name}
              className="btn btn-outline-primary btn-sm d-flex align-items-center text-decoration-none"
            >
              <MdAttachment className="me-2" />
              Download
            </a>

            <Button variant="secondary" onClick={handleCloseModal} size="sm">
              Close
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ImageAnnotationModal
