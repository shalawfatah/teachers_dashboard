import { useState } from "react";
import { FileUp } from "lucide-react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  children?: React.ReactNode;
}

export default function FileDropzone({
  onFileSelect,
  children,
}: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileSelect(droppedFile);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/30 hover:border-primary/50"
        }`}
    >
      {children || (
        <label className="cursor-pointer space-y-2 block">
          <FileUp className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">
            فایل راکێشە ئێرە یان{" "}
            <span className="text-primary font-medium">کلیک بکە</span>
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && onFileSelect(e.target.files[0])
            }
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          />
        </label>
      )}
    </div>
  );
}
