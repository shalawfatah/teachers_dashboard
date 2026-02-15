"use client";

import { useState } from "react";
import { TableHeader } from "./table-header";
import { TableActions } from "./table-actions";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { useTableData } from "./use-table-data";

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
}

export function CoursesTable() {
  const {
    data: courses,
    loading,
    deleteItem,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
  } = useTableData<Course>({ table: "courses" });
  const [viewCourse, setViewCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  const handleDelete = () => {
    if (deleteCourse) {
      deleteItem(deleteCourse.id);
      setDeleteCourse(null);
    }
  };

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
              {courses.map((course) => (
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
                      onView={() => setViewCourse(course)}
                      onDelete={() => setDeleteCourse(course)}
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

      {viewCourse && (
        <ViewModal
          title="Course Details"
          data={viewCourse}
          onClose={() => setViewCourse(null)}
        />
      )}
      {deleteCourse && (
        <DeleteDialog
          title="Delete Course"
          description={`Are you sure you want to delete "${deleteCourse.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCourse(null)}
        />
      )}
    </>
  );
}
