"use client";

import { Eye, Trash2, Edit } from "lucide-react";

interface TableActionsProps {
  onView: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  hideEdit?: boolean;
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  hideEdit = false,
}: TableActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onView}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="View details"
        type="button"
      >
        <Eye className="w-4 h-4" />
      </button>
      {!hideEdit && onEdit && (
        <button
          onClick={onEdit}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Edit"
          type="button"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onDelete}
        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
        title="Delete"
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
