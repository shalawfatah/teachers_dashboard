"use client";

import { useState } from "react";
import { useTableData } from "./use-table-data";
import { TableHeader } from "./table-header";
import { TableActions } from "./table-actions";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { VideoModal } from "./video-modals/video-modal";

interface Video {
  id: string;
  title: string;
  link: string;
  course_id: string;
  free: boolean;
  created_at: string;
  thumbnail?: string;
  courses?: { title: string };
}

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

  if (loading) return <div>Loading videos...</div>;

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
              <tr>
                <th className="px-4 py-3 text-left">ناونیشان</th>
                <th className="px-4 py-3 text-left">خول</th>
                <th className="px-4 py-3 text-left">لینک</th>
                <th className="px-4 py-3 text-left">خۆڕایی</th>
                <th className="px-4 py-3 text-left">بەروار</th>
                <th className="px-4 py-3 text-right">دەستکاریی</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{video.title}</td>
                  <td className="px-4 py-3">{video.courses?.title}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{video.link}</td>
                  <td className="px-4 py-3">
                    {video.free ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(video.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <TableActions
                      onView={() => setViewVideo(video)}
                      onEdit={() => handleEdit(video)}
                      onDelete={() => setDeleteVideo(video)}
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
          data={viewVideo}
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
