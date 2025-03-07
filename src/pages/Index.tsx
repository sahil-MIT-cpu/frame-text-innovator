
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Text, Download, Play, Pause } from 'lucide-react';
import VideoUploader from '@/components/VideoUploader';
import VideoPlayer from '@/components/VideoPlayer';
import Timeline from '@/components/Timeline';
import TextOverlayEditor, { TextOverlay } from '@/components/TextOverlayEditor';
import { processAndDownloadVideo, CutSegment } from '@/utils/videoProcessor';

const VideoEditor = () => {
  const { toast } = useToast();
  
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Editing state
  const [cutSegments, setCutSegments] = useState<CutSegment[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  
  // Process video upload
  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setCurrentTime(0);
    setIsPlaying(false);
    setCutSegments([]);
    setTextOverlays([]);
  };
  
  // Playback controls
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };
  
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleLoadedMetadata = (videoDuration: number) => {
    setDuration(videoDuration);
  };
  
  // Editing functions
  const handleAddCutSegment = (start: number, end: number) => {
    setCutSegments(prev => [...prev, { start, end }]);
    toast({
      title: "Segment added",
      description: `Added segment from ${start.toFixed(2)}s to ${end.toFixed(2)}s`,
    });
  };
  
  const handleAddTextOverlay = (overlay: Omit<TextOverlay, 'id'>) => {
    const id = `text-${Date.now()}`;
    setTextOverlays(prev => [...prev, { ...overlay, id }]);
    toast({
      title: "Text overlay added",
      description: `"${overlay.text}" will appear from ${overlay.timing.start.toFixed(1)}s to ${overlay.timing.end.toFixed(1)}s`,
    });
  };
  
  const handleRemoveCutSegment = (index: number) => {
    setCutSegments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };
  
  // Export video
  const handleExportVideo = async () => {
    if (!videoFile || !videoSrc) {
      toast({
        variant: "destructive",
        title: "No video",
        description: "Please upload a video first",
      });
      return;
    }
    
    toast({
      title: "Exporting video",
      description: "Please wait while we process your video...",
    });
    
    try {
      const fileName = videoFile.name.replace(/\.[^/.]+$/, '') + '_edited.mp4';
      await processAndDownloadVideo(videoSrc, cutSegments, textOverlays, fileName);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your video",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <header className="container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Video Editor</h1>
            <p className="text-muted-foreground">Upload, edit, and export videos with ease</p>
          </div>
          
          {videoSrc && (
            <Button 
              onClick={handleExportVideo}
              className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-white animate-fade-in"
            >
              <Download className="w-4 h-4 transition-transform group-hover:translate-y-[1px]" />
              Export Video
            </Button>
          )}
        </div>
      </header>
      
      <main className="container flex-1 py-6 space-y-8">
        {!videoSrc ? (
          <div className="max-w-xl mx-auto animate-fade-in">
            <VideoUploader onVideoUploaded={handleVideoUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <VideoPlayer
                  videoSrc={videoSrc}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  textOverlays={textOverlays}
                  onTimeUpdate={handleTimeUpdate}
                  onPlayPause={togglePlayPause}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-full"
                />
              </div>
              
              <div className="flex items-center justify-center gap-4 py-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </Button>
              </div>
              
              <Timeline
                duration={duration}
                currentTime={currentTime}
                segments={cutSegments}
                onTimeChange={handleTimeUpdate}
                onSegmentCreate={handleAddCutSegment}
              />
              
              <div className="bg-background rounded-lg shadow-sm p-4 border">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Cut Segments ({cutSegments.length})
                </h3>
                
                {cutSegments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No segments added. Shift + Click and drag on the timeline to select segments to remove.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                    {cutSegments.map((segment, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between bg-secondary rounded-md p-2 text-sm"
                      >
                        <span>
                          {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s 
                          ({(segment.end - segment.start).toFixed(2)}s)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCutSegment(index)}
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-background rounded-lg shadow-sm p-4 border">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Text className="w-4 h-4" />
                  Text Overlays ({textOverlays.length})
                </h3>
                
                {textOverlays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No text overlays added. Use the panel on the right to add text.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                    {textOverlays.map((overlay) => (
                      <div 
                        key={overlay.id}
                        className="flex items-center justify-between bg-secondary rounded-md p-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: overlay.style.color }}
                          />
                          <span>
                            "{overlay.text}" ({overlay.timing.start.toFixed(1)}s - {overlay.timing.end.toFixed(1)}s)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTextOverlay(overlay.id)}
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <Tabs defaultValue="text" className="w-full animate-fade-in">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Text className="w-4 h-4" />
                    Add Text
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <TextOverlayEditor
                    currentTime={currentTime}
                    duration={duration}
                    onAddOverlay={handleAddTextOverlay}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <h3 className="text-sm font-medium mb-2">Quick Tips</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Click and drag on timeline to scrub through video</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Shift + Click and drag to select segments to remove</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Add text overlays with specific timing and styling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                    <span>Click Export when ready to download your edited video</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t bg-background/50 backdrop-blur-xs">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with precision and attention to detail
          </p>
          
          <p className="text-sm text-muted-foreground">
            All changes are processed locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VideoEditor;
