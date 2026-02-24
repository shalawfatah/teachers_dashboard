"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { Eye, Trash2, Edit, FileDown } from "lucide-react";
import { DocumentModal } from "./document-modals/documents-modal";

export interface Document {
  id: string;
  title: string;
  teacher_id?: string;
  file_url: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  course_id: string | null;
  courses?: { title: string };
  created_at: string;
}

export default function DocumentsTable() {
  const {
    data: documents,
    loading,
    deleteItem,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    refetch,
  } = useTableData<Document>({
    table: "documents",
    select: "*, courses(title)",
  });

  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (doc: Document) => {
    setEditDoc(doc);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditDoc(null);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("pdf")) return "📄";
    if (fileType?.includes("word") || fileType?.includes("doc")) return "📝";
    if (fileType?.includes("sheet") || fileType?.includes("excel")) return "📊";
    if (fileType?.includes("image")) return "🖼️";
    return "📎";
  };

  if (loading) return <div>{"دابەزاندنی داتای دۆکیۆمێنتەکان..."}</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="دۆکیومێنتەکان"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => setIsModalOpen(true)}
          addButtonText="زیادکردنی دۆکیومێنت"
        />

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-muted/50 text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ناونیشان</th>
                <th className="px-4 py-3 text-left font-medium">فایل</th>
                <th className="px-4 py-3 text-left font-medium">قەبارە</th>
                <th className="px-4 py-3 text-left font-medium">خول</th>
                <th className="px-4 py-3 text-left font-medium">بەروار</th>
                <th className="px-4 py-3 text-right font-medium">دەستکاریی</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    هیچ دۆکیومێنتێک نەدۆزرایەوە
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{doc.title}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getFileIcon(doc.file_type)}</span>
                        <span className="truncate max-w-[140px]">
                          {doc.file_name}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatSize(doc.file_size)}
                    </td>
                    <td className="px-4 py-3">
                      {doc.courses?.title ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {doc.courses.title}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Download"
                        >
                          <FileDown className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setViewDoc(doc)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          type="button"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          type="button"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDoc(doc)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={() => {
          refetch();
          handleClose();
        }}
        editDocument={editDoc}
      />

      {viewDoc && (
        <ViewModal
          title="دۆکیومێنت"
          data={viewDoc}
          onClose={() => setViewDoc(null)}
        />
      )}

      {deleteDoc && (
        <DeleteDialog
          title="سڕینەوەی دۆکیومێنت"
          description={`دڵنیای دەتەوێت "${deleteDoc.title}" بسڕیتەوە؟`}
          onConfirm={() => {
            deleteItem(deleteDoc.id);
            setDeleteDoc(null);
          }}
          onCancel={() => setDeleteDoc(null)}
        />
      )}
    </>
  );
}
