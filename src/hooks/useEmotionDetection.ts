import { useState, useCallback } from 'react';
import { VideoJob, EmotionSegment, EmotionType } from '@/types/emotion';
import { supabase } from '@/integrations/supabase/client';

// Extract frames from video at specified interval
const extractFrames = async (
  videoUrl: string, 
  intervalSeconds: number = 2
): Promise<{ dataUrl: string; timestamp: number }[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    
    const frames: { dataUrl: string; timestamp: number }[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadedmetadata = () => {
      canvas.width = 640; // Resize for API efficiency
      canvas.height = 360;
      
      const duration = video.duration;
      const timestamps: number[] = [];
      
      for (let t = 0; t < duration; t += intervalSeconds) {
        timestamps.push(t);
      }
      
      let currentIndex = 0;
      
      const captureFrame = () => {
        if (currentIndex >= timestamps.length) {
          resolve(frames);
          return;
        }
        
        video.currentTime = timestamps[currentIndex];
      };
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          frames.push({
            dataUrl,
            timestamp: timestamps[currentIndex]
          });
        }
        currentIndex++;
        captureFrame();
      };
      
      captureFrame();
    };
    
    video.onerror = () => reject(new Error('Failed to load video'));
  });
};

// Analyze a single frame using the AI edge function
const analyzeFrame = async (
  frameDataUrl: string, 
  timestamp: number, 
  targetEmotion: EmotionType
): Promise<{
  timestamp: number;
  emotion: EmotionType;
  confidence: number;
  detected: boolean;
  matchesTarget: boolean;
}> => {
  const { data, error } = await supabase.functions.invoke('detect-emotions', {
    body: { 
      frameDataUrl, 
      timestamp, 
      targetEmotion 
    }
  });
  
  if (error) {
    console.error('Error analyzing frame:', error);
    throw error;
  }
  
  return data;
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

    try {
      // Simulate upload progress (file is already in memory)
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setJob((prev) => (prev ? { ...prev, progress: i } : null));
      }

      // Switch to processing
      setJob((prev) =>
        prev ? { ...prev, status: 'processing', progress: 0 } : null
      );

      // Extract frames from video (every 2 seconds)
      console.log('Extracting frames from video...');
      const frames = await extractFrames(url, 2);
      console.log(`Extracted ${frames.length} frames`);

      const segments: EmotionSegment[] = [];
      let currentSegmentStart: number | null = null;
      let lastMatchingTimestamp: number | null = null;
      let lastConfidence = 0;

      // Analyze each frame
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        // Update progress
        const progress = Math.round(((i + 1) / frames.length) * 100);
        setJob((prev) => (prev ? { ...prev, progress } : null));

        try {
          console.log(`Analyzing frame ${i + 1}/${frames.length} at ${frame.timestamp}s`);
          const result = await analyzeFrame(frame.dataUrl, frame.timestamp, emotion);
          console.log('Frame result:', result);

          if (result.matchesTarget && result.confidence > 0.6) {
            // Found matching emotion
            if (currentSegmentStart === null) {
              currentSegmentStart = frame.timestamp;
            }
            lastMatchingTimestamp = frame.timestamp;
            lastConfidence = Math.max(lastConfidence, result.confidence);
          } else {
            // Not matching - close current segment if exists
            if (currentSegmentStart !== null && lastMatchingTimestamp !== null) {
              segments.push({
                id: `segment-${segments.length}`,
                emotion,
                startTime: currentSegmentStart,
                endTime: lastMatchingTimestamp + 2, // Add buffer
                confidence: lastConfidence,
              });
              currentSegmentStart = null;
              lastMatchingTimestamp = null;
              lastConfidence = 0;
            }
          }

          // Add small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (frameError) {
          console.error(`Error analyzing frame at ${frame.timestamp}s:`, frameError);
          // Continue with next frame
        }
      }

      // Close final segment if exists
      if (currentSegmentStart !== null && lastMatchingTimestamp !== null) {
        segments.push({
          id: `segment-${segments.length}`,
          emotion,
          startTime: currentSegmentStart,
          endTime: lastMatchingTimestamp + 2,
          confidence: lastConfidence,
        });
      }

      console.log(`Detection complete. Found ${segments.length} segments.`);

      // Complete the job
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed',
              progress: 100,
              videoUrl: url,
              segments,
            }
          : null
      );
    } catch (error) {
      console.error('Detection error:', error);
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              progress: 0,
            }
          : null
      );
    }
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
