"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ViewModalProps<T extends Record<string, unknown>> {
  title: string;
  data: T;
  onClose: () => void;
}

export function ViewModal<T extends Record<string, unknown>>({
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
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <span className="text-sm">
                {typeof value === "boolean"
                  ? value
                    ? "Yes"
                    : "No"
                  : typeof value === "object" && value !== null
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
