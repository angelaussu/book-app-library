import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  className?: string;
}

export function StarRating({ value, max = 5, size = 16, interactive = false, onChange, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            className={cn(
              filled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground",
              interactive && "cursor-pointer hover:fill-yellow-400 hover:text-yellow-400 transition-colors"
            )}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </div>
  );
}
