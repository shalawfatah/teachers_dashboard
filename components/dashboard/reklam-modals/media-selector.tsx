import { ImageUp, VideoIcon, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent } from "react";

// 1. Define the Props Interface
interface MediaSelectorProps {
  imagePreview: string | null;
  videoFile: File | null;
  existingHls: string | null | undefined;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onVideoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onClearVideo: () => void;
}

export function MediaSelector({
  imagePreview,
  videoFile,
  existingHls,
  onImageChange,
  onVideoChange,
  onClearImage,
  onClearVideo,
}: MediaSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative">
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border h-32">
            <Image
              src={imagePreview}
              alt="alt image"
              height={100}
              width={100}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onClearImage}
              className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer ${videoFile || existingHls ? "opacity-40 pointer-events-none" : "hover:bg-muted/30"}`}
          >
            <ImageUp className="w-7 h-7 text-muted-foreground" />
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      <div className="relative">
        {videoFile || existingHls ? (
          <div className="relative flex flex-col items-center justify-center h-32 border rounded-lg bg-muted/40 text-center px-2">
            <VideoIcon className="w-7 h-7 text-primary mb-1" />
            <span className="text-[10px] truncate w-full">
              {videoFile ? videoFile.name : "ڤیدیۆی پاشەکەوتکراو"}
            </span>
            <button
              type="button"
              onClick={onClearVideo}
              className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer ${imagePreview ? "opacity-40 pointer-events-none" : "hover:bg-muted/30"}`}
          >
            <VideoIcon className="w-7 h-7 text-muted-foreground" />
            <input
              type="file"
              accept="video/*"
              onChange={onVideoChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
