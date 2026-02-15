"use client";

import { Eye, Trash2 } from "lucide-react";

interface TableActionsProps {
  onView: () => void;
  onDelete: () => void;
  hideEdit?: boolean;
}

export function TableActions({
  onView,
  onDelete,
  hideEdit,
}: TableActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onView}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
