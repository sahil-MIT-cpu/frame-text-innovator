
import React, { useState, useRef, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: {
    start: number;
    end: number;
  }[];
  onTimeChange: (time: number) => void;
  onSegmentCreate: (start: number, end: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  segments,
  onTimeChange,
  onSegmentCreate,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [tempEnd, setTempEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const getPositionFromTime = (time: number): number => {
    return (time / duration) * 100;
  };

  const getTimeFromPosition = (position: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;

    const percentage = Math.max(0, Math.min(1, position / rect.width));
    return percentage * duration;
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    
    const newTime = getTimeFromPosition(clickPosition);
    onTimeChange(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    
    if (e.shiftKey && !isSelecting) {
      // Start segment selection
      setIsSelecting(true);
      const time = getTimeFromPosition(e.clientX - trackRef.current!.getBoundingClientRect().left);
      setSelectionStart(time);
      setTempEnd(time);
    } else {
      // Regular scrubbing
      handleTrackClick(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const mousePosition = e.clientX - rect.left;
    const newTime = getTimeFromPosition(mousePosition);

    if (isSelecting) {
      setTempEnd(newTime);
    } else {
      onTimeChange(newTime);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart !== null && tempEnd !== null) {
      // Create a segment
      const start = Math.min(selectionStart, tempEnd);
      const end = Math.max(selectionStart, tempEnd);
      
      if (end - start > 0.2) { // Only create if segment is meaningful (> 0.2s)
        onSegmentCreate(start, end);
      }
      
      setIsSelecting(false);
      setSelectionStart(null);
      setTempEnd(null);
    }
    
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging && !isSelecting) {
      setIsDragging(false);
    }
  };

  // Create time markers every second if duration < 60s, otherwise every 5 seconds
  const renderTimeMarkers = () => {
    const markers = [];
    const step = duration <= 60 ? 1 : 5;
    const numMarkers = Math.floor(duration / step);

    for (let i = 0; i <= numMarkers; i++) {
      const time = i * step;
      const position = getPositionFromTime(time);
      
      markers.push(
        <div 
          key={i} 
          className="timeline-marker" 
          style={{ left: `${position}%` }}
        >
          {(i % 5 === 0 || duration <= 20) && (
            <span className="timeline-marker-label">
              {Math.floor(time / 60)}:{(time % 60).toFixed(0).padStart(2, '0')}
            </span>
          )}
        </div>
      );
    }
    
    return markers;
  };

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">Timeline</span>
        {isSelecting && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Scissors className="w-3 h-3 mr-1" />
            <span>Creating segment {selectionStart?.toFixed(1)}s to {tempEnd?.toFixed(1)}s</span>
          </div>
        )}
      </div>
      
      <div
        ref={trackRef}
        className="timeline-track"
        onClick={handleTrackClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Time markers */}
        <div className="timeline-markers">
          {renderTimeMarkers()}
        </div>
        
        {/* Segments to cut */}
        {segments.map((segment, index) => (
          <div
            key={index}
            className="timeline-segment"
            style={{
              left: `${getPositionFromTime(segment.start)}%`,
              width: `${getPositionFromTime(segment.end - segment.start)}%`,
            }}
          />
        ))}
        
        {/* Temporary selection indicator */}
        {isSelecting && selectionStart !== null && tempEnd !== null && (
          <div
            className="timeline-segment bg-destructive/30"
            style={{
              left: `${getPositionFromTime(Math.min(selectionStart, tempEnd))}%`,
              width: `${getPositionFromTime(Math.abs(tempEnd - selectionStart))}%`,
            }}
          />
        )}
        
        {/* Current time indicator */}
        <div
          className="timeline-thumb"
          style={{ left: `${getPositionFromTime(currentTime)}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground mt-1">
        Shift + Click and drag to select segments for removal
      </p>
    </div>
  );
};

export default Timeline;
