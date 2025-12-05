import React from 'react';
import { EMOTIONS, EmotionType } from '@/types/emotion';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface EmotionSelectorProps {
  value: EmotionType[];
  onChange: (emotions: EmotionType[]) => void;
  disabled?: boolean;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const handleToggle = (emotion: EmotionType) => {
    if (value.includes(emotion)) {
      onChange(value.filter((e) => e !== emotion));
    } else {
      onChange([...value, emotion]);
    }
  };

  const selectAll = () => {
    onChange(EMOTIONS.map((e) => e.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Select Emotions to Detect
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            className="text-xs text-primary hover:text-primary/80 disabled:opacity-50"
          >
            Select All
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {EMOTIONS.map((emotion) => {
          const isSelected = value.includes(emotion.value);
          return (
            <label
              key={emotion.value}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                'border border-transparent',
                isSelected
                  ? 'bg-muted/80 border-primary/30'
                  : 'bg-muted/30 hover:bg-muted/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggle(emotion.value)}
                disabled={disabled}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className={cn('w-3 h-3 rounded-full', emotion.color)} />
              <span className="text-sm text-foreground">{emotion.label}</span>
            </label>
          );
        })}
      </div>
      
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} emotion{value.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};

export default EmotionSelector;
