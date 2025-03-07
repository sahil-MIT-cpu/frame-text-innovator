
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Clock
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

export interface TextOverlay {
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

interface TextOverlayEditorProps {
  currentTime: number;
  duration: number;
  onAddOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
}

const TEXT_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF3B30', // Red
  '#4CD964', // Green
  '#007AFF', // Blue
  '#FFCC00', // Yellow
  '#FF9500', // Orange
  '#5856D6', // Purple
];

const TextOverlayEditor: React.FC<TextOverlayEditorProps> = ({ 
  currentTime,
  duration,
  onAddOverlay 
}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#FFFFFF');
  const [startTime, setStartTime] = useState(currentTime);
  const [endTime, setEndTime] = useState(Math.min(currentTime + 5, duration));

  const handleAddText = () => {
    if (!text.trim()) return;

    onAddOverlay({
      text,
      position: { x: 0.5, y: 0.5 }, // Center by default
      style: {
        color,
        fontSize,
      },
      timing: {
        start: startTime,
        end: endTime,
      }
    });

    // Reset the form
    setText('');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="animate-scale-in shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <Type className="w-5 h-5 mr-2 text-primary" />
          <h3 className="text-sm font-medium">Add Text Overlay</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="overlay-text">Text</Label>
            <Input
              id="overlay-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <Label>Font Size: {fontSize}px</Label>
            </div>
            <Slider
              value={[fontSize]}
              min={12}
              max={72}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-primary scale-110' : ''
                  }`}
                  style={{ 
                    backgroundColor: c,
                    border: c === '#FFFFFF' ? '1px solid #E2E8F0' : 'none',
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label>Timing</Label>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                <Input
                  id="start-time"
                  type="number"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">
                  {formatTime(startTime)}
                </span>
              </div>
              <div>
                <Label htmlFor="end-time" className="text-xs">End Time</Label>
                <Input
                  id="end-time"
                  type="number"
                  min={startTime}
                  max={duration}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">
                  {formatTime(endTime)}
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddText}
            disabled={!text.trim()}
            className="w-full"
          >
            Add Text Overlay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextOverlayEditor;
