"use client"
import { MdZoomIn, MdZoomOut, MdCenterFocusStrong } from "react-icons/md"

const ZoomControls = ({ onZoomIn, onZoomOut, onResetZoom, zoom }) => {
  return (
    <div className="zoom-controls">
      <style jsx>{`
        .zoom-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .zoom-control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #656d76;
        }
        
        .zoom-control-btn:hover {
          background: #f6f8fa;
          border-color: #1f883d;
          color: #1f883d;
        }
        
        .zoom-control-btn:active {
          transform: scale(0.95);
        }
        
        .zoom-level {
          font-size: 12px;
          text-align: center;
          color: #656d76;
          font-weight: 500;
          padding: 4px 0;
        }
      `}</style>

      <button className="zoom-control-btn" onClick={onZoomIn} title="Zoom In">
        <MdZoomIn size={20} />
      </button>

      <div className="zoom-level">{Math.round(zoom * 100)}%</div>

      <button className="zoom-control-btn" onClick={onZoomOut} title="Zoom Out">
        <MdZoomOut size={20} />
      </button>

      <button className="zoom-control-btn" onClick={onResetZoom} title="Reset Zoom">
        <MdCenterFocusStrong size={20} />
      </button>
    </div>
  )
}

export default ZoomControls
