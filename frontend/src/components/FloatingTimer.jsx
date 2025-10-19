import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const FloatingTimer = ({ isVisible, onClose, timeLeft, timerMode, isRunning, onMaximize }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const floatingRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    if (timerMode === 'work') return 'from-cyan-500 to-blue-500';
    if (timerMode === 'shortBreak') return 'from-green-500 to-emerald-500';
    return 'from-purple-500 to-pink-500';
  };

  const getModeLabel = () => {
    if (timerMode === 'work') return 'FOCUS';
    if (timerMode === 'shortBreak') return 'SHORT BREAK';
    return 'LONG BREAK';
  };

  // Handle dragging
  const handleMouseDownDrag = (e) => {
    if (e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMoveDrag = (e) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - size.width));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - size.height));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUpDrag = () => {
    setIsDragging(false);
  };

  // Handle resizing
  const handleMouseDownResize = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleMouseMoveResize = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(250, Math.min(resizeStart.width + deltaX, 600));
    const newHeight = Math.max(150, Math.min(resizeStart.height + deltaY, 400));
    
    setSize({ width: newWidth, height: newHeight });
  };

  const handleMouseUpResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveDrag);
      window.addEventListener('mouseup', handleMouseUpDrag);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveDrag);
      window.removeEventListener('mouseup', handleMouseUpDrag);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveDrag);
      window.removeEventListener('mouseup', handleMouseUpDrag);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMoveResize);
      window.addEventListener('mouseup', handleMouseUpResize);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveResize);
      window.removeEventListener('mouseup', handleMouseUpResize);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveResize);
      window.removeEventListener('mouseup', handleMouseUpResize);
    };
  }, [isResizing, resizeStart]);

  if (!isVisible) return null;

  return (
    <div
      ref={floatingRef}
      className="fixed z-[9999] shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card 
        className="w-full h-full bg-[#13131a]/95 backdrop-blur-xl border-[#22d3ee]/30 overflow-hidden flex flex-col"
        onMouseDown={handleMouseDownDrag}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#22d3ee]/20">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getModeColor()} text-white text-xs font-mono font-bold`}>
            {getModeLabel()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMaximize}
              className="h-7 w-7 p-0 hover:bg-[#22d3ee]/10"
            >
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white font-mono mb-2 glow-text">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-400 font-mono">
              {isRunning ? 'Running...' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
          onMouseDown={handleMouseDownResize}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(34, 211, 238, 0.3) 50%)'
          }}
        >
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-cyan-400 rounded-full"></div>
          <div className="absolute bottom-1 right-2 w-1 h-1 bg-cyan-400 rounded-full"></div>
          <div className="absolute bottom-2 right-1 w-1 h-1 bg-cyan-400 rounded-full"></div>
        </div>
      </Card>
    </div>
  );
};

export default FloatingTimer;
