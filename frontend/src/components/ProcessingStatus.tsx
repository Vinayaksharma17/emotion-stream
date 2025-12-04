import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { VideoJob } from '@/types/emotion';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  job: VideoJob;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ job }) => {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'uploading':
        return 'Uploading video...';
      case 'processing':
        return 'Analyzing emotions...';
      case 'completed':
        return 'Analysis complete!';
      case 'error':
        return job.error || 'An error occurred';
    }
  };

  const getStatusDescription = () => {
    switch (job.status) {
      case 'uploading':
        return 'Your video is being uploaded to our servers.';
      case 'processing':
        return 'Our AI is detecting emotional moments in your video.';
      case 'completed':
        return 'Click on timeline segments to play detected clips.';
      case 'error':
        return 'Please try uploading again or use a different video.';
    }
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            job.status === 'completed'
              ? 'bg-green-500/20'
              : job.status === 'error'
              ? 'bg-destructive/20'
              : 'bg-primary/20'
          )}
        >
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {getStatusText()}
          </h3>
          <p className="text-muted-foreground text-sm">
            {getStatusDescription()}
          </p>

          {(job.status === 'uploading' || job.status === 'processing') && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {job.status === 'processing' ? 'AI Processing' : 'Upload Progress'}
                </span>
                <span className="text-foreground font-medium">{job.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500 ease-out',
                    'bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] animate-shimmer'
                  )}
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
