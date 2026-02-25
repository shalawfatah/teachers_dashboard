import { File, X } from "lucide-react";

interface FilePreviewProps {
  file: File | null;
  existingName?: string;
  onRemove: () => void;
  formatSize: (bytes: number) => string;
}

export default function FilePreview({
  file,
  existingName,
  onRemove,
  formatSize,
}: FilePreviewProps) {
  if (file) {
    return (
      <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <File className="w-8 h-8 text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium truncate max-w-[220px]">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 hover:bg-muted-foreground/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <File className="w-5 h-5" />
        <span>{existingName}</span>
      </div>
      <p className="text-xs text-primary underline">کلیک بکە بۆ گۆڕین</p>
    </div>
  );
}
