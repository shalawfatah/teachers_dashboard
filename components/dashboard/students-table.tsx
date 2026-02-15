"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableActions } from "./table-actions";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";

interface Student {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  teacher_id: string;
  created_at: string;
}

export function StudentsTable() {
  const { data: students, loading, deleteItem, updateItem } = useTableData<Student>({ 
    table: "students" 
  });
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  const handleVerificationToggle = (student: Student) => {
    updateItem(student.id, { verified: !student.verified });
  };

  const handleDelete = () => {
    if (deleteStudent) {
      deleteItem(deleteStudent.id);
      setDeleteStudent(null);
    }
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Students</h2>
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Verified</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleVerificationToggle(student)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.verified
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {student.verified ? "Verified" : "Unverified"}
                    </button>
                  </td>
                  <td className="px-4 py-3">{new Date(student.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <TableActions
                      onView={() => setViewStudent(student)}
                      onDelete={() => setDeleteStudent(student)}
                      hideEdit
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewStudent && (
        <ViewModal title="Student Details" data={viewStudent} onClose={() => setViewStudent(null)} />
      )}

      {deleteStudent && (
        <DeleteDialog
          title="Delete Student"
          description={`Are you sure you want to delete "${deleteStudent.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteStudent(null)}
        />
      )}
    </>
  );
}
