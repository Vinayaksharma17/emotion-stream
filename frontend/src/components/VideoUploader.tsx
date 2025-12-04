import React, { useCallback, useState } from 'react';
import { Upload, Film, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  uploadProgress: number;
  isUploading: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onFileSelect,
  uploadProgress,
  isUploading,
  selectedFile,
  onClear,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith('video/')) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300',
            'hover:border-primary/60 hover:bg-muted/30',
            isDragOver
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-border/60 bg-card/30'
          )}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300',
                'bg-gradient-to-br from-primary/20 to-purple-500/20',
                isDragOver && 'scale-110'
              )}
            >
              <Upload
                className={cn(
                  'w-10 h-10 text-primary transition-transform duration-300',
                  isDragOver && 'scale-110'
                )}
              />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Drop your video here
            </h3>
            <p className="text-muted-foreground text-center max-w-xs">
              or click to browse. Supports MP4, MOV, AVI, and other video formats.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Film className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={onClear}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-foreground font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
