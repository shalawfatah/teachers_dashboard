"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import ViewModal from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { VideoModal } from "./video-modals/video-modal";
import { Eye, Trash2, Edit } from "lucide-react";
import { Video } from "@/types/video";

export function VideosTable() {
  const {
    data: videos,
    loading,
    deleteItem,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    refetch,
  } = useTableData<Video>({
    table: "videos",
    select: "*, courses!inner(title, teacher_id)",
    filterByTeacher: false,
  });
  const [viewVideo, setViewVideo] = useState<Video | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<Video | null>(null);

  const handleEdit = (video: Video) => {
    setEditVideo(video);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditVideo(null);
  };

  if (loading) return <div>دابەزاندنی داتای ڤیدیۆکان...</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="ڤیدیۆ"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => setIsModalOpen(true)}
          addButtonText="زیادکردنی ڤیدیۆ"
        />
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr className="text-right">
                <th className="px-4 py-3">ناونیشان</th>
                <th className="px-4 py-3">خول</th>
                <th className="px-4 py-3">خۆڕایی</th>
                <th className="px-4 py-3">بەروار</th>
                <th className="px-4 py-3 text-center">دەستکاریی</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{video.title}</td>
                  <td className="px-4 py-3">{video.courses?.title}</td>
                  <td className="px-4 py-3">
                    {video.free ? (
                      <span className="text-green-600">بەڵێ</span>
                    ) : (
                      <span className="text-muted-foreground">نەخێر</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(video.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewVideo(video)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="View details"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(video)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteVideo(video)}
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

      <VideoModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={() => {
          refetch();
          handleModalClose();
        }}
        editVideo={editVideo}
      />
      {viewVideo && (
        <ViewModal
          title="زانیاریی لەسەر ڤیدیۆ"
          data={{
            ناونیشان: viewVideo.title,
            خۆڕایی: viewVideo.free ? "بەڵێ" : "نەخێر",
            "خولی پەیوەندیدار": viewVideo?.courses?.title,
            ڤیدیۆ: viewVideo.link,
          }}
          onClose={() => setViewVideo(null)}
        />
      )}
      {deleteVideo && (
        <DeleteDialog
          title="سڕینەوەی ڤیدیۆ"
          description={`"${deleteVideo.title}" دڵنیای دەتەوێت ئەم ڤیدیۆیە بسڕیتەوە؟`}
          onConfirm={() => {
            deleteItem(deleteVideo.id);
            setDeleteVideo(null);
          }}
          onCancel={() => setDeleteVideo(null)}
        />
      )}
    </>
  );
}
