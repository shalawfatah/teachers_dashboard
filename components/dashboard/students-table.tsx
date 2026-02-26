"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { TableActions } from "./table-actions";
import ViewModal from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { Student } from "@/types/student_types";

export function StudentsTable() {
  const {
    data,
    loading,
    deleteItem,
    updateItem,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useTableData<Student>({
    table: "students",
    searchFields: ["name", "email"],
  });
  const [viewItem, setViewItem] = useState<Student | null>(null);
  const [deleteItem2, setDeleteItem2] = useState<Student | null>(null);

  if (loading) return <div>دابەزاندنی داتای خوێندکاران...</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="خوێندکاران"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr className="text-right">
                <th className="px-4 py-3">ناو</th>
                <th className="px-4 py-3">ئیمەیل</th>
                <th className="px-4 py-3">پارەی واسڵکردووە</th>
                <th className="px-4 py-3">بەروار</th>
                <th className="px-4 py-3 text-center">دەستکاریی</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student) => (
                <tr key={student.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        updateItem(student.id, { verified: !student.verified })
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium ${student.verified
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                    >
                      {student.verified ? "واسڵکراوە" : "واسڵ نەکراوە"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <TableActions
                      onView={() => setViewItem(student)}
                      onDelete={() => setDeleteItem2(student)}
                      hideEdit
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
          title="زانیاریی خوێندکار"
          data={{
            "ناو": viewItem.name,
            "ئیمەیل": viewItem.email,
            "وەسڵ": viewItem.verified ? "واسڵکراوە" : "واسڵ نەکراوە",
            "پۆل": viewItem.grade,
          }}
          onClose={() => setViewItem(null)}
        />
      )}
      {deleteItem2 && (
        <DeleteDialog
          title="سڕینەوەی خوێندکار"
          description={`دڵنیایی دەتەوێت ئەم خوێندکارە بسڕیتەوە`}
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
