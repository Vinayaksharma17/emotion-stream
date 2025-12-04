export type EmotionType = 
  | 'joy' 
  | 'sadness' 
  | 'anger' 
  | 'fear' 
  | 'surprise' 
  | 'disgust' 
  | 'neutral';

export interface EmotionSegment {
  id: string;
  emotion: EmotionType;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface VideoJob {
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  videoUrl?: string;
  segments?: EmotionSegment[];
  error?: string;
}

export const EMOTIONS: { value: EmotionType; label: string; color: string }[] = [
  { value: 'joy', label: 'Joy', color: 'bg-emotion-joy' },
  { value: 'sadness', label: 'Sadness', color: 'bg-emotion-sadness' },
  { value: 'anger', label: 'Anger', color: 'bg-emotion-anger' },
  { value: 'fear', label: 'Fear', color: 'bg-emotion-fear' },
  { value: 'surprise', label: 'Surprise', color: 'bg-emotion-surprise' },
  { value: 'disgust', label: 'Disgust', color: 'bg-emotion-disgust' },
  { value: 'neutral', label: 'Neutral', color: 'bg-emotion-neutral' },
];

export const getEmotionColor = (emotion: EmotionType): string => {
  const emotionData = EMOTIONS.find(e => e.value === emotion);
  return emotionData?.color || 'bg-emotion-neutral';
};
