import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import VideoUploader from '@/components/VideoUploader';
import EmotionSelector from '@/components/EmotionSelector';
import ProcessingStatus from '@/components/ProcessingStatus';
import EmotionTimeline from '@/components/EmotionTimeline';
import ClipPlayer from '@/components/ClipPlayer';
import { Button } from '@/components/ui/button';
import { EmotionType, EmotionSegment } from '@/types/emotion';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<EmotionSegment | null>(null);
  const [filterEmotion, setFilterEmotion] = useState<EmotionType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { job, videoUrl, startDetection, resetJob } = useEmotionDetection();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile || selectedEmotions.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please select a video and at least one emotion to detect.',
        variant: 'destructive',
      });
      return;
    }

    await startDetection(selectedFile, selectedEmotions);
  };

  const handleReset = () => {
    resetJob();
    setSelectedFile(null);
    setSelectedEmotions([]);
    setSelectedSegment(null);
    setFilterEmotion(null);
    setUploadProgress(0);
  };

  const isAnalyzing = job?.status === 'uploading' || job?.status === 'processing';
  const isComplete = job?.status === 'completed';
  const totalDuration = job?.segments
    ? Math.max(...job.segments.map((s) => s.endTime))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Emotion Detection
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Emotion<span className="text-gradient">Clip</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a video and let our AI find the emotional moments that matter most to you.
          </p>
        </header>

        {!isComplete ? (
          /* Upload and configuration section */
          <div className="max-w-2xl mx-auto space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <VideoUploader
              onFileSelect={handleFileSelect}
              uploadProgress={uploadProgress}
              isUploading={job?.status === 'uploading'}
              selectedFile={selectedFile}
              onClear={handleClearFile}
            />

            <div className="space-y-4">
              <EmotionSelector
                value={selectedEmotions}
                onChange={setSelectedEmotions}
                disabled={isAnalyzing}
              />

              <Button
                variant="glow"
                size="lg"
                className="w-full"
                onClick={handleStartAnalysis}
                disabled={!selectedFile || selectedEmotions.length === 0 || isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </Button>
            </div>

            {job && (job.status === 'uploading' || job.status === 'processing') && (
              <ProcessingStatus job={job} />
            )}
          </div>
        ) : (
          /* Results section */
          <div className="animate-fade-in">
            {/* Reset button */}
            <div className="flex justify-end mb-6">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Video player */}
              <div className="lg:sticky lg:top-6 h-fit">
                {videoUrl && job?.segments && (
                  <ClipPlayer
                    videoUrl={videoUrl}
                    segment={selectedSegment}
                    segments={
                      filterEmotion
                        ? job.segments.filter((s) => s.emotion === filterEmotion)
                        : job.segments
                    }
                    onSegmentChange={setSelectedSegment}
                  />
                )}
              </div>

              {/* Timeline */}
              <div>
                {job?.segments && (
                  <EmotionTimeline
                    segments={job.segments}
                    totalDuration={totalDuration}
                    selectedSegment={selectedSegment}
                    onSegmentClick={setSelectedSegment}
                    filterEmotion={filterEmotion}
                    onFilterChange={setFilterEmotion}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
