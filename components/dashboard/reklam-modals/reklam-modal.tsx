"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ReklamForm } from "./reklam-form";

interface Reklam {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  link_type: string;
  link_target: string;
  display_order: number;
  is_active: boolean;
  background_color: string;
  text_color: string;
}

interface ReklamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editReklam?: Reklam | null;
}

export function ReklamModal({
  isOpen,
  onClose,
  onSuccess,
  editReklam,
}: ReklamModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"
        }`}
      onClick={onClose}
    >
      <div
        className={`bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-transform ${isOpen ? "scale-100" : "scale-95"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {editReklam ? "دەستکاریکردنی ڕێکلام" : "زیادکردنی ڕێکلامی نوێ"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <ReklamForm
            onSuccess={onSuccess}
            onCancel={onClose}
            editReklam={editReklam}
          />
        </div>
      </div>
    </div>
  );
}
