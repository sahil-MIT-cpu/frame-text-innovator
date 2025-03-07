
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoSrc: string;
  currentTime: number;
  isPlaying: boolean;
  textOverlays: TextOverlay[];
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
  onLoadedMetadata: (duration: number) => void;
  className?: string;
}

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number, y: number };
  style: {
    color: string;
    fontSize: number;
  };
  timing: {
    start: number;
    end: number;
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  currentTime,
  isPlaying,
  textOverlays,
  onTimeUpdate,
  onPlayPause,
  onLoadedMetadata,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      onLoadedMetadata(video.duration);
      setIsLoading(false);
      
      // Get container dimensions for overlay positioning
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onTimeUpdate, onLoadedMetadata]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(error => {
        console.error('Error playing video:', error);
        onPlayPause(); // Toggle back if autoplay is prevented
      });
    } else {
      video.pause();
    }
  }, [isPlaying, onPlayPause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      if (newMuteState) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume || 0.5;
        setVolume(videoRef.current.volume);
      }
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg bg-black shadow-lg", 
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs z-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onClick={onPlayPause}
      />
      
      {/* Text Overlays */}
      {textOverlays.map((overlay) => (
        currentTime >= overlay.timing.start && 
        currentTime <= overlay.timing.end && (
          <div
            key={overlay.id}
            className="absolute"
            style={{
              left: `${overlay.position.x * 100}%`,
              top: `${overlay.position.y * 100}%`,
            }}
          >
            <div 
              style={{
                color: overlay.style.color,
                fontSize: `${overlay.style.fontSize}px`,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {overlay.text}
            </div>
          </div>
        )
      ))}
      
      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-8 pb-2 opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPlayPause}
            className="text-white hover:bg-white/10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <div className="text-xs text-white/90">
            {formatTime(currentTime)}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/10"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="h-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
