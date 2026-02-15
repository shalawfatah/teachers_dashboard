"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { CoursesTable } from "./courses-table";
import { VideosTable } from "./videos-table";
import { StudentsTable } from "./students-table";

type View = "courses" | "videos" | "students";

export function DashboardLayout() {
  const [activeView, setActiveView] = useState<View>("courses");

  return (
    <div className="flex w-full min-h-[calc(100vh-8rem)]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeView === "courses" && <CoursesTable />}
        {activeView === "videos" && <VideosTable />}
        {activeView === "students" && <StudentsTable />}
      </main>
    </div>
  );
}
