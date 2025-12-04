import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { EmotionSegment, EMOTIONS } from '@/types/emotion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ClipPlayerProps {
  videoUrl: string;
  segment: EmotionSegment | null;
  segments: EmotionSegment[];
  onSegmentChange: (segment: EmotionSegment) => void;
}

const ClipPlayer: React.FC<ClipPlayerProps> = ({
  videoUrl,
  segment,
  segments,
  onSegmentChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (videoRef.current && segment) {
      videoRef.current.currentTime = segment.startTime;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [segment]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !segment) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= segment.endTime) {
        video.pause();
        setIsPlaying(false);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [segment]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (segment && videoRef.current.currentTime >= segment.endTime) {
        videoRef.current.currentTime = segment.startTime;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const navigateSegment = (direction: 'prev' | 'next') => {
    if (!segment) return;
    const currentIndex = segments.findIndex((s) => s.id === segment.id);
    const newIndex =
      direction === 'next'
        ? Math.min(currentIndex + 1, segments.length - 1)
        : Math.max(currentIndex - 1, 0);
    onSegmentChange(segments[newIndex]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const emotionData = segment
    ? EMOTIONS.find((e) => e.value === segment.emotion)
    : null;

  const progress = segment
    ? ((currentTime - segment.startTime) / (segment.endTime - segment.startTime)) * 100
    : 0;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Video container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Overlay when no segment selected */}
        {!segment && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <p className="text-muted-foreground text-center px-8">
              Select a clip from the timeline to start playing
            </p>
          </div>
        )}

        {/* Emotion badge */}
        {segment && emotionData && (
          <div className="absolute top-4 left-4 animate-fade-in">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                'bg-black/60 backdrop-blur-md text-white'
              )}
            >
              <div className={cn('w-2.5 h-2.5 rounded-full', emotionData.color)} />
              {emotionData.label}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4">
        {/* Progress bar */}
        {segment && (
          <div className="mb-4">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{formatTime(segment.startTime)}</span>
              <span>{formatTime(segment.endTime)}</span>
            </div>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateSegment('prev')}
            disabled={!segment || segments.findIndex((s) => s.id === segment.id) === 0}
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="w-12 h-12"
            onClick={togglePlay}
            disabled={!segment}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateSegment('next')}
            disabled={
              !segment ||
              segments.findIndex((s) => s.id === segment.id) === segments.length - 1
            }
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClipPlayer;
