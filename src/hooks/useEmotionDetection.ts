import { useState, useCallback } from 'react';
import { VideoJob, EmotionSegment, EmotionType } from '@/types/emotion';

// Mock data for demonstration
const generateMockSegments = (duration: number): EmotionSegment[] => {
  const emotions: EmotionType[] = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral'];
  const segments: EmotionSegment[] = [];
  let currentTime = 0;

  while (currentTime < duration) {
    const segmentDuration = Math.random() * 8 + 2; // 2-10 seconds
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70-100%

    if (currentTime + segmentDuration <= duration) {
      segments.push({
        id: `segment-${segments.length}`,
        emotion,
        startTime: currentTime,
        endTime: currentTime + segmentDuration,
        confidence,
      });
    }

    currentTime += segmentDuration + Math.random() * 3; // Gap between segments
  }

  return segments;
};

export const useEmotionDetection = () => {
  const [job, setJob] = useState<VideoJob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const startDetection = useCallback(async (file: File, emotion: EmotionType) => {
    // Create object URL for video preview
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Initialize job
    const newJob: VideoJob = {
      id: `job-${Date.now()}`,
      status: 'uploading',
      progress: 0,
    };
    setJob(newJob);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setJob((prev) => (prev ? { ...prev, progress: i } : null));
    }

    // Switch to processing
    setJob((prev) =>
      prev ? { ...prev, status: 'processing', progress: 0 } : null
    );

    // Get video duration
    const video = document.createElement('video');
    video.src = url;
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });
    const duration = video.duration || 120; // Default to 2 minutes if unavailable

    // Simulate processing progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setJob((prev) => (prev ? { ...prev, progress: i } : null));
    }

    // Generate mock segments
    const allSegments = generateMockSegments(duration);

    // Complete the job
    setJob((prev) =>
      prev
        ? {
            ...prev,
            status: 'completed',
            progress: 100,
            videoUrl: url,
            segments: allSegments,
          }
        : null
    );
  }, []);

  const resetJob = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setJob(null);
    setVideoUrl(null);
  }, [videoUrl]);

  return {
    job,
    videoUrl,
    startDetection,
    resetJob,
  };
};
