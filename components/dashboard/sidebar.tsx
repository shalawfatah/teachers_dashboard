"use client";

import { BookOpen, Video, Users } from "lucide-react";

type View = "courses" | "videos" | "students";

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const navItems = [
  { id: "courses" as View, label: "Courses", icon: BookOpen },
  { id: "videos" as View, label: "Videos", icon: Video },
  { id: "students" as View, label: "Students", icon: Users },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
