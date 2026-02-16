"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { ReklamModal } from "./reklam-modals/reklam-modal";
import { Eye, Trash2, Edit } from "lucide-react";

interface Reklam {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  link_type: string;
  link_target: string;
  display_order: number;
  is_active: boolean;
  background_color: string;
  text_color: string;
  created_at: string;
}

export default function ReklamTable() {
  const {
    data: reklams,
    loading,
    deleteItem,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    refetch,
  } = useTableData<Reklam>({ table: "reklam" });

  const [viewReklam, setViewReklam] = useState<Reklam | null>(null);
  const [deleteReklam, setDeleteReklam] = useState<Reklam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editReklam, setEditReklam] = useState<Reklam | null>(null);

  const handleEdit = (reklam: Reklam) => {
    setEditReklam(reklam);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditReklam(null);
  };

  if (loading) return <div>Loading reklams...</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="ڕێکلام"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => setIsModalOpen(true)}
          addButtonText="زیادکردنی ڕێکلام"
        />
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">ناونیشان</th>
                <th className="px-4 py-3 text-left">جۆر</th>
                <th className="px-4 py-3 text-left">ڕیز</th>
                <th className="px-4 py-3 text-left">دۆخ</th>
                <th className="px-4 py-3 text-left">بەروار</th>
                <th className="px-4 py-3 text-right">دەستکاریی</th>
              </tr>
            </thead>
            <tbody>
              {reklams.map((reklam) => (
                <tr key={reklam.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{reklam.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {reklam.link_type === "course" && "خول"}
                      {reklam.link_type === "video" && "ڤیدیۆ"}
                      {reklam.link_type === "external" && "لینکی دەرەکی"}
                      {reklam.link_type === "none" && "زانیاری"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{reklam.display_order}</td>
                  <td className="px-4 py-3">
                    {reklam.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        چالاک
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ناچالاک
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(reklam.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewReklam(reklam)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="View details"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(reklam)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteReklam(reklam)}
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

      <ReklamModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={() => {
          refetch();
          handleModalClose();
        }}
        editReklam={editReklam}
      />

      {viewReklam && (
        <ViewModal
          title="زانیاریی دەربارەی ڕێکلام"
          data={viewReklam}
          onClose={() => setViewReklam(null)}
        />
      )}

      {deleteReklam && (
        <DeleteDialog
          title="سڕینەوەی ڕێکلام"
          description={`دڵنیای دەتەوێت "${deleteReklam.title}" بسڕیتەوە؟`}
          onConfirm={() => {
            deleteItem(deleteReklam.id);
            setDeleteReklam(null);
          }}
          onCancel={() => setDeleteReklam(null)}
        />
      )}
    </>
  );
}
