"use client";

import { Search, Plus } from "lucide-react";

interface TableHeaderProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  addButtonText: string;
}

export function TableHeader({
  title,
  searchValue,
  onSearchChange,
  onAdd,
  addButtonText,
}: TableHeaderProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {addButtonText}
        </button>
      </div>
    </div>
  );
}
