"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { TableActions } from "./table-actions";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { CourseModal } from "./modals/course-modal";

interface Course {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  teacher_id: string;
  created_at: string;
  thumbnail?: string;
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
    refetch,
  } = useTableData<Course>({ table: "courses" });
  const [viewCourse, setViewCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const handleEdit = (course: Course) => {
    setEditCourse(course);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditCourse(null);
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="خولەکان"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => setIsModalOpen(true)}
          addButtonText="زیادکردنی خول"
        />
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">ناونیشان</th>
                <th className="px-4 py-3 text-left">درێژە</th>
                <th className="px-4 py-3 text-left">پۆل</th>
                <th className="px-4 py-3 text-left">بابەت</th>
                <th className="px-4 py-3 text-left">بەروار</th>
                <th className="px-4 py-3 text-right">دەستکاریی</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{course.title}</td>
                  <td className="px-4 py-3 max-w-md truncate">
                    {course.description}
                  </td>
                  <td className="px-4 py-3 capitalize">{course.grade}</td>
                  <td className="px-4 py-3 capitalize">{course.subject}</td>
                  <td className="px-4 py-3">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <TableActions
                      onView={() => setViewCourse(course)}
                      onEdit={() => handleEdit(course)}
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

      <CourseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={() => {
          refetch();
          handleModalClose();
        }}
        editCourse={editCourse}
      />
      {viewCourse && (
        <ViewModal
          title="زانیاریی دەربارەی خول"
          data={viewCourse}
          onClose={() => setViewCourse(null)}
        />
      )}
      {deleteCourse && (
        <DeleteDialog
          title="Delete Course"
          description={`دڵنیای دەتەوێت ئەم خولە بسڕیتەوە؟`}
          onConfirm={() => {
            deleteItem(deleteCourse.id);
            setDeleteCourse(null);
          }}
          onCancel={() => setDeleteCourse(null)}
        />
      )}
    </>
  );
}
