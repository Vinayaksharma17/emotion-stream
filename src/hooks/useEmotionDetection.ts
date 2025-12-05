import { useState, useCallback } from 'react';
import { VideoJob, EmotionSegment, EmotionType, EMOTIONS } from '@/types/emotion';
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
      canvas.width = 640;
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

// Analyze a single frame for all emotions
const analyzeFrame = async (
  frameDataUrl: string, 
  timestamp: number, 
  targetEmotions: EmotionType[]
): Promise<{
  timestamp: number;
  detectedEmotions: { emotion: EmotionType; confidence: number }[];
}> => {
  const { data, error } = await supabase.functions.invoke('detect-emotions', {
    body: { 
      frameDataUrl, 
      timestamp, 
      targetEmotions 
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

  const startDetection = useCallback(async (file: File, emotions: EmotionType[]) => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    const newJob: VideoJob = {
      id: `job-${Date.now()}`,
      status: 'uploading',
      progress: 0,
    };
    setJob(newJob);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setJob((prev) => (prev ? { ...prev, progress: i } : null));
      }

      setJob((prev) =>
        prev ? { ...prev, status: 'processing', progress: 0 } : null
      );

      console.log('Extracting frames from video...');
      const frames = await extractFrames(url, 2);
      console.log(`Extracted ${frames.length} frames`);

      // Track segments per emotion
      const emotionSegments: Map<EmotionType, {
        currentStart: number | null;
        lastTimestamp: number | null;
        lastConfidence: number;
      }> = new Map();

      emotions.forEach((e) => {
        emotionSegments.set(e, {
          currentStart: null,
          lastTimestamp: null,
          lastConfidence: 0,
        });
      });

      const segments: EmotionSegment[] = [];

      // Analyze each frame
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const progress = Math.round(((i + 1) / frames.length) * 100);
        setJob((prev) => (prev ? { ...prev, progress } : null));

        try {
          console.log(`Analyzing frame ${i + 1}/${frames.length} at ${frame.timestamp}s`);
          const result = await analyzeFrame(frame.dataUrl, frame.timestamp, emotions);
          console.log('Frame result:', result);

          // Process each target emotion
          for (const targetEmotion of emotions) {
            const state = emotionSegments.get(targetEmotion)!;
            const detected = result.detectedEmotions.find(
              (d) => d.emotion === targetEmotion && d.confidence > 0.5
            );

            if (detected) {
              if (state.currentStart === null) {
                state.currentStart = frame.timestamp;
              }
              state.lastTimestamp = frame.timestamp;
              state.lastConfidence = Math.max(state.lastConfidence, detected.confidence);
            } else {
              // Close segment if exists
              if (state.currentStart !== null && state.lastTimestamp !== null) {
                segments.push({
                  id: `segment-${segments.length}`,
                  emotion: targetEmotion,
                  startTime: state.currentStart,
                  endTime: state.lastTimestamp + 2,
                  confidence: state.lastConfidence,
                });
                state.currentStart = null;
                state.lastTimestamp = null;
                state.lastConfidence = 0;
              }
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (frameError) {
          console.error(`Error analyzing frame at ${frame.timestamp}s:`, frameError);
        }
      }

      // Close any remaining segments
      for (const targetEmotion of emotions) {
        const state = emotionSegments.get(targetEmotion)!;
        if (state.currentStart !== null && state.lastTimestamp !== null) {
          segments.push({
            id: `segment-${segments.length}`,
            emotion: targetEmotion,
            startTime: state.currentStart,
            endTime: state.lastTimestamp + 2,
            confidence: state.lastConfidence,
          });
        }
      }

      // Sort segments by start time
      segments.sort((a, b) => a.startTime - b.startTime);

      console.log(`Detection complete. Found ${segments.length} segments.`);

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
