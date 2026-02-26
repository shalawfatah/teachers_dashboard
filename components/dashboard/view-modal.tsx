"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

interface ViewModalProps<T extends object> {
  title: string;
  data: T;
  onClose: () => void;
}

export default function ViewModal<T extends object>({
  title,
  data,
  onClose,
}: ViewModalProps<T>) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const keys = Object.keys(data) as Array<keyof T>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {keys.map((key) => {
            const value = data[key];
            const isVideo = String(key) === "ڤیدیۆ";
            const isImage = String(key) === "وێنە";

            return (
              <div key={String(key)} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground capitalize text-right">
                  {String(key).replace(/_/g, " ")}
                </span>
                {isVideo && typeof value === "string" ? (
                  <video
                    src={value}
                    controls
                    className="w-full rounded-lg"
                    preload="metadata"
                  />
                ) : isImage && typeof value === "string" ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={value}
                      alt="وێنە"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-right">
                    {typeof value === "boolean"
                      ? value
                        ? "بەڵێ"
                        : "نەخێر"
                      : typeof value === "object" && value !== null
                        ? JSON.stringify(value, null, 2)
                        : String(value ?? "")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
