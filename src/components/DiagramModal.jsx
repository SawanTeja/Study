import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';

export default function DiagramModal({ isOpen, onClose, svg }) {
  const [scale, setScale] = useState(1.1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef(null);

  // Keep positionRef in sync
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Reset zoom & pan when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1.1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setScale((prev) => Math.min(prev * 1.2, 5));
      } else if (e.key === '-') {
        setScale((prev) => Math.max(prev / 1.2, 0.3));
      } else if (e.key === '0') {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((prev) => {
      const next = prev * zoomFactor;
      return Math.min(Math.max(next, 0.3), 6);
    });
  }, []);

  // Mouse drag pan
  const handleMouseDown = (e) => {
    // Only drag with left click and not on control buttons
    if (e.button !== 0 || e.target.closest('.diagram-modal-controls')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch controls for mobile/tablet
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - positionRef.current.x,
        y: e.touches[0].clientY - positionRef.current.y
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistanceRef.current;
      setScale((prev) => Math.min(Math.max(prev * factor, 0.3), 6));
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="diagram-modal-overlay"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Control Bar */}
      <div className="diagram-modal-controls" onClick={(e) => e.stopPropagation()}>
        <div className="diagram-modal-hint">
          <Maximize2 size={15} />
          <span>Diagram Viewer &bull; Drag to pan &bull; Scroll to zoom</span>
        </div>

        <div className="diagram-modal-actions">
          <button 
            type="button" 
            className="diagram-control-btn"
            onClick={() => setScale((s) => Math.max(s / 1.25, 0.3))}
            title="Zoom Out (-)"
          >
            <ZoomOut size={16} />
          </button>

          <span 
            className="diagram-zoom-indicator"
            onClick={resetView}
            title="Click to reset zoom"
          >
            {Math.round(scale * 100)}%
          </span>

          <button 
            type="button" 
            className="diagram-control-btn"
            onClick={() => setScale((s) => Math.min(s * 1.25, 6))}
            title="Zoom In (+)"
          >
            <ZoomIn size={16} />
          </button>

          <button 
            type="button" 
            className="diagram-control-btn"
            onClick={resetView}
            title="Reset View (0)"
          >
            <RotateCcw size={15} />
          </button>

          <button 
            type="button" 
            className="diagram-control-btn close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div 
        className={`diagram-modal-viewport ${isDragging ? 'is-dragging' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div 
          className="diagram-modal-content"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
