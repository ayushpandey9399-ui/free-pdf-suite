import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ActionBar({
  onRun,
  disabled,
  loading,
  progress,
  label = "Process",
  className,
}: {
  onRun: () => void;
  disabled?: boolean;
  loading?: boolean;
  progress?: number | null;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("mt-6 space-y-3", className)}>
      {loading && progress != null && (
        <div>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground mt-1 text-center">{Math.round(progress)}%</p>
        </div>
      )}
      <Button
        onClick={onRun}
        disabled={disabled || loading}
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
