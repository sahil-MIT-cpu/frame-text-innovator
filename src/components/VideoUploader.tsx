
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onVideoUploaded: (file: File) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is a video
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file.');
      return;
    }

    onVideoUploaded(file);
    toast.success('Video uploaded successfully.');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50/80 transition-all duration-300">
      <div className="animate-pulse-light">
        <UploadCloud className="w-16 h-16 text-primary/70" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium">Upload your video</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Drag & drop or click to browse
        </p>
      </div>
      <Button 
        onClick={handleUploadClick}
        variant="outline"
        className="mt-4 focus:ring-2 focus:ring-primary/50"
      >
        Select Video
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default VideoUploader;
