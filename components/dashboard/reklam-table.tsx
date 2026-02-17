"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { ReklamModal } from "./reklam-modals/reklam-modal";
import { Eye, Trash2, Edit, ImageIcon, VideoIcon } from "lucide-react";
import Image from "next/image";
import { Reklam } from "@/types/reklam";

const LINK_TYPE_LABELS: Record<string, string> = {
  course: "خول",
  video: "ڤیدیۆ",
  document: "دۆکیومێنت",
  external: "لینکی دەرەکی",
  none: "زانیاری",
};

const LINK_TYPE_COLORS: Record<string, string> = {
  course: "bg-purple-100 text-purple-800",
  video: "bg-red-100 text-red-800",
  document: "bg-orange-100 text-orange-800",
  external: "bg-blue-100 text-blue-800",
  none: "bg-gray-100 text-gray-600",
};

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
  const [editReklam, setEditReklam] = useState<Reklam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (r: Reklam) => {
    setEditReklam(r);
    setIsModalOpen(true);
  };
  const handleClose = () => {
    setIsModalOpen(false);
    setEditReklam(null);
  };

  if (loading) return <div>دابەزاندنی داتای ڕێکلام...</div>;

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

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-muted/50 text-sm">
              <tr className="text-right">
                <th className="px-4 py-3 font-medium">میدیا</th>
                <th className="px-4 py-3 font-medium">ناونیشان</th>
                <th className="px-4 py-3 font-medium">کلیک</th>
                <th className="px-4 py-3 font-medium">ڕیز</th>
                <th className="px-4 py-3 font-medium">دۆخ</th>
                <th className="px-4 py-3 font-medium text-center">دەستکاریی</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reklams.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    هیچ ڕێکلامێک نەدۆزرایەوە
                  </td>
                </tr>
              ) : (
                reklams.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Media indicator */}
                    <td className="px-4 py-3">
                      {r.video_bunny_id ? (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                          <VideoIcon className="w-4 h-4" />
                          ڤیدیۆ
                        </div>
                      ) : r.image_url ? (
                        <div className="flex items-center gap-1.5">
                          <Image
                            src={r.image_url}
                            height={100}
                            width={100}
                            alt=""
                            className="w-10 h-7 object-cover rounded"
                          />
                        </div>
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium">{r.title}</td>

                    {/* Link type badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${LINK_TYPE_COLORS[r.link_type] || "bg-gray-100 text-gray-600"}`}
                      >
                        {LINK_TYPE_LABELS[r.link_type] || r.link_type}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {r.display_order}
                    </td>

                    <td className="px-4 py-3">
                      {r.is_active ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          چالاک
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          ناچالاک
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => setViewReklam(r)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          type="button"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          type="button"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteReklam(r)}
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

      <ReklamModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={() => {
          refetch();
          handleClose();
        }}
        editReklam={editReklam}
      />

      {viewReklam && (
        <ViewModal
          title="ڕێکلام"
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
