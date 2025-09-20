"use client"
import { MdBrush, MdRectangle, MdCircle, MdArrowForward, MdRemove, MdClear, MdUndo, MdRedo } from "react-icons/md"

const DrawingToolbar = ({ drawingTool, setDrawingTool, onClear, onUndo, onRedo, canUndo, canRedo }) => {
  const tools = [
    { id: "brush", icon: MdBrush, label: "Brush" },
    { id: "eraser", icon: MdClear, label: "Eraser" },
    { id: "rectangle", icon: MdRectangle, label: "Rectangle" },
    { id: "circle", icon: MdCircle, label: "Circle" },
    { id: "arrow", icon: MdArrowForward, label: "Arrow" },
    { id: "line", icon: MdRemove, label: "Line" },
  ]

  return (
    <div className="drawing-toolbar">
      <style jsx>{`
        .drawing-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 16px;
        }
        
        .toolbar-section {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .toolbar-divider {
          width: 1px;
          height: 32px;
          background: #e0e0e0;
          margin: 0 8px;
        }
        
        .tool-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: #f8f9fa;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #495057;
          position: relative;
        }
        
        .tool-btn:hover {
          background: #e9ecef;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .tool-btn.active {
          background: #007bff;
          color: white;
          border-color: #0056b3;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        .tool-btn.eraser {
          background: #dc3545;
          color: white;
        }
        
        .tool-btn.eraser:hover {
          background: #c82333;
        }
        
        .tool-btn.eraser.active {
          background: #bd2130;
          border-color: #a71e2a;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6c757d;
        }
        
        .action-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #495057;
          transform: translateY(-1px);
        }
        
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .action-btn.danger {
          color: #dc3545;
          border-color: #dc3545;
        }
        
        .action-btn.danger:hover:not(:disabled) {
          background: #f8d7da;
          border-color: #dc3545;
        }
        
        .tool-label {
          position: absolute;
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: #6c757d;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .tool-btn:hover .tool-label {
          opacity: 1;
        }
      `}</style>

      <div className="toolbar-section">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`tool-btn ${drawingTool === id ? "active" : ""} ${id === "eraser" ? "eraser" : ""}`}
            onClick={() => setDrawingTool(id)}
            title={label}
          >
            <Icon size={20} />
            <span className="tool-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button className="action-btn" onClick={onUndo} disabled={!canUndo} title="Undo">
          <MdUndo size={18} />
        </button>

        <button className="action-btn" onClick={onRedo} disabled={!canRedo} title="Redo">
          <MdRedo size={18} />
        </button>

        <button className="action-btn danger" onClick={onClear} title="Clear All">
          <MdClear size={18} />
        </button>
      </div>
    </div>
  )
}

export default DrawingToolbar
