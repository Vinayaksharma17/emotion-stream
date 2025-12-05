import React from 'react';
import { EmotionSegment, EmotionType, getEmotionColor, EMOTIONS } from '@/types/emotion';
import { cn } from '@/lib/utils';

interface EmotionTimelineProps {
  segments: EmotionSegment[];
  totalDuration: number;
  selectedSegment: EmotionSegment | null;
  onSegmentClick: (segment: EmotionSegment) => void;
  filterEmotion: EmotionType | null;
  onFilterChange?: (emotion: EmotionType | null) => void;
}

const EmotionTimeline: React.FC<EmotionTimelineProps> = ({
  segments,
  totalDuration,
  selectedSegment,
  onSegmentClick,
  filterEmotion,
  onFilterChange,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSegments = filterEmotion
    ? segments.filter((s) => s.emotion === filterEmotion)
    : segments;

  const getSegmentStyle = (segment: EmotionSegment) => {
    const left = (segment.startTime / totalDuration) * 100;
    const width = ((segment.endTime - segment.startTime) / totalDuration) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 1)}%` };
  };

  return (
    <div className="space-y-6">
      {/* Timeline visualization */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Emotion Timeline
          </h3>
          <span className="text-sm text-muted-foreground">
            {formatTime(totalDuration)}
          </span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-12 bg-muted/50 rounded-lg overflow-hidden">
          {/* Time markers */}
          <div className="absolute inset-0 flex">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute top-0 bottom-0 border-l border-border/30"
                style={{ left: `${percent}%` }}
              />
            ))}
          </div>

          {/* Segments */}
          {segments.map((segment) => {
            const isFiltered = filterEmotion && segment.emotion !== filterEmotion;
            const isSelected = selectedSegment?.id === segment.id;
            const emotionData = EMOTIONS.find((e) => e.value === segment.emotion);

            return (
              <button
                key={segment.id}
                onClick={() => onSegmentClick(segment)}
                className={cn(
                  'absolute top-1 bottom-1 rounded-md transition-all duration-200 cursor-pointer',
                  emotionData?.color,
                  isFiltered ? 'opacity-20' : 'opacity-80 hover:opacity-100',
                  isSelected && 'ring-2 ring-foreground ring-offset-2 ring-offset-background opacity-100'
                )}
                style={getSegmentStyle(segment)}
                title={`${emotionData?.label}: ${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
              />
            );
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0:00</span>
          <span>{formatTime(totalDuration / 2)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Legend - clickable filters */}
      <div className="flex flex-wrap gap-3">
        {onFilterChange && (
          <button
            onClick={() => onFilterChange(null)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all',
              !filterEmotion ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted/50 hover:bg-muted/70'
            )}
          >
            <span className="text-foreground">All</span>
            <span className="text-muted-foreground">({segments.length})</span>
          </button>
        )}
        {EMOTIONS.map((emotion) => {
          const count = segments.filter((s) => s.emotion === emotion.value).length;
          if (count === 0) return null;

          const isActive = filterEmotion === emotion.value;
          return (
            <button
              key={emotion.value}
              onClick={() => onFilterChange?.(isActive ? null : emotion.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all',
                isActive 
                  ? 'bg-primary/20 ring-1 ring-primary' 
                  : 'bg-muted/50 hover:bg-muted/70',
                filterEmotion && !isActive && 'opacity-40'
              )}
            >
              <div className={cn('w-2.5 h-2.5 rounded-full', emotion.color)} />
              <span className="text-foreground">{emotion.label}</span>
              <span className="text-muted-foreground">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Segments list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Detected Clips ({filteredSegments.length})
        </h3>
        <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
          {filteredSegments.map((segment) => {
            const emotionData = EMOTIONS.find((e) => e.value === segment.emotion);
            const isSelected = selectedSegment?.id === segment.id;

            return (
              <button
                key={segment.id}
                onClick={() => onSegmentClick(segment)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200',
                  'hover:bg-muted/80',
                  isSelected ? 'bg-muted ring-1 ring-primary' : 'bg-muted/40'
                )}
              >
                <div
                  className={cn('w-2 h-8 rounded-full', emotionData?.color)}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {emotionData?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(segment.confidence * 100)}% conf
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmotionTimeline;
