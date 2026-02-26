"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface DeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({
  title,
  description,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            سڕینەوە
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
          >
            رەتکردنەوە
          </button>
        </div>
      </div>
    </div>
  );
}
