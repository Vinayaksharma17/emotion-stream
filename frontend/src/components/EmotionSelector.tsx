import React from 'react';
import { ChevronDown } from 'lucide-react';
import { EMOTIONS, EmotionType, getEmotionColor } from '@/types/emotion';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmotionSelectorProps {
  value: EmotionType | null;
  onChange: (emotion: EmotionType) => void;
  disabled?: boolean;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Select
      value={value || undefined}
      onValueChange={(val) => onChange(val as EmotionType)}
      disabled={disabled}
    >
      <SelectTrigger className="glass h-12 px-4 text-base border-border/50 hover:border-primary/50 transition-colors">
        <SelectValue placeholder="Select an emotion to detect" />
      </SelectTrigger>
      <SelectContent className="glass-strong border-border/50">
        {EMOTIONS.map((emotion) => (
          <SelectItem
            key={emotion.value}
            value={emotion.value}
            className="cursor-pointer focus:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  emotion.color
                )}
              />
              <span>{emotion.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EmotionSelector;
