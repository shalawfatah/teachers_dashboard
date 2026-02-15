"use client";

import { useState } from "react";
import { TableHeader } from "./table-header";
import { TableActions } from "./table-actions";
import { ViewModal } from "./view-modal";
import { DeleteDialog } from "./delete-dialog";
import { Pagination } from "./pagination";
import { useTableData } from "./use-table-data";

interface Video {
  id: string;
  title: string;
  url: string;
  course_id: string;
  created_at: string;
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
  } = useTableData<Video>({
    table: "videos",
    select: "*, courses!inner(title, teacher_id)",
    filterByTeacher: false,
  });
  const [viewVideo, setViewVideo] = useState<Video | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null);

  const handleDelete = () => {
    if (deleteVideo) {
      deleteItem(deleteVideo.id);
      setDeleteVideo(null);
    }
  };

  if (loading) return <div>Loading videos...</div>;

  return (
    <>
      <div className="space-y-4">
        <TableHeader
          title="Videos"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => console.log("Add video")}
          addButtonText="Add Video"
        />
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{video.title}</td>
                  <td className="px-4 py-3">{video.courses?.title}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{video.url}</td>
                  <td className="px-4 py-3">
                    {new Date(video.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <TableActions
                      onView={() => setViewVideo(video)}
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

      {viewVideo && (
        <ViewModal
          title="Video Details"
          data={viewVideo}
          onClose={() => setViewVideo(null)}
        />
      )}
      {deleteVideo && (
        <DeleteDialog
          title="Delete Video"
          description={`Are you sure you want to delete "${deleteVideo.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteVideo(null)}
        />
      )}
    </>
  );
}
