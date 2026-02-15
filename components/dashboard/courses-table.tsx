"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { TableActions } from "./table-actions";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
}

export function CoursesTable() {
  const {
    data,
    loading,
    deleteItem,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useTableData<Course>({
    table: "courses",
    searchFields: ["title", "description"],
  });
  const [viewItem, setViewItem] = useState<Course | null>(null);
  const [deleteItem2, setDeleteItem2] = useState<Course | null>(null);

  if (loading) return <div>Loading courses...</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="Courses"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => console.log("Add course")}
          addButtonText="Add Course"
        />
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((course) => (
                <tr key={course.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{course.title}</td>
                  <td className="px-4 py-3 max-w-md truncate">
                    {course.description}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <TableActions
                      onView={() => setViewItem(course)}
                      onDelete={() => setDeleteItem2(course)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      {viewItem && (
        <ViewModal
          title="Course Details"
          data={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}
      {deleteItem2 && (
        <DeleteDialog
          title="Delete Course"
          description={`Are you sure you want to delete "${deleteItem2.title}"?`}
          onConfirm={() => {
            deleteItem(deleteItem2.id);
            setDeleteItem2(null);
          }}
          onCancel={() => setDeleteItem2(null)}
        />
      )}
    </>
  );
}
