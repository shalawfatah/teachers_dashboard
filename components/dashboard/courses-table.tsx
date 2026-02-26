"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { CourseModal } from "./modals/course-modal";
import { Eye, Trash2, Edit } from "lucide-react";
import { Course } from "@/types/course";
import ViewModal from "./view-modal";

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

  if (loading) return <div>دابەزاندنی داتای خولەکان...</div>;

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
              <tr className="text-right">
                <th className="px-4 py-3">ناونیشان</th>
                <th className="px-4 py-3">درێژە</th>
                <th className="px-4 py-3">پۆل</th>
                <th className="px-4 py-3">بابەت</th>
                <th className="px-4 py-3">بەروار</th>
                <th className="px-4 py-3 text-center">دەستکاریی</th>
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewCourse(course)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="View details"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCourse(course)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
          data={{
            "ناونیشان": viewCourse.title,
            "وەسف": viewCourse.description,
            "پۆل": viewCourse.grade,
            "بابەت": viewCourse.subject,
            "وێنە": viewCourse.thumbnail,
          }}
          onClose={() => setViewCourse(null)}
        />
      )}

      {deleteCourse && (
        <DeleteDialog
          title="سڕینەوەی خول"
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
