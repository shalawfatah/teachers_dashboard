"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Document } from "../documents-table";
import { DocumentForm } from "./documents-form";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDocument?: Document | null;
}

export function DocumentModal({
  isOpen,
  onClose,
  onSuccess,
  editDocument,
}: DocumentModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      const t = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(t);
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
        className={`bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-transform ${isOpen ? "scale-100" : "scale-95"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {editDocument
              ? "دەستکاریکردنی دۆکیومێنت"
              : "زیادکردنی دۆکیومێنتی نوێ"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <DocumentForm
            onSuccess={onSuccess}
            onCancel={onClose}
            editDocument={editDocument}
          />
        </div>
      </div>
    </div>
  );
}
