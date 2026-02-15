"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  uploadVideoThumbnail,
  getTeacherCourses,
  saveVideo,
} from "./video-helpers";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editVideo?: {
    id: string;
    title: string;
    link: string;
    course_id: string;
    free: boolean;
    thumbnail?: string;
  } | null;
}

export function VideoModal({
  isOpen,
  onClose,
  onSuccess,
  editVideo,
}: VideoModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    course_id: "",
    free: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadCourses();
      if (editVideo) {
        setFormData({
          title: editVideo.title,
          link: editVideo.link,
          course_id: editVideo.course_id,
          free: editVideo.free,
        });
        setThumbnailPreview(editVideo.thumbnail || "");
      } else {
        setFormData({ title: "", link: "", course_id: "", free: false });
        setThumbnailPreview("");
      }
    }
  }, [editVideo, isOpen]);

  const loadCourses = async () => {
    try {
      const data = await getTeacherCourses();
      setCourses(data);
    } catch (err: any) {
      setError("Failed to load courses");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let thumbnailUrl = editVideo?.thumbnail || "";
      if (thumbnailFile) {
        const url = await uploadVideoThumbnail(thumbnailFile);
        if (url) thumbnailUrl = url;
      }

      await saveVideo(formData, thumbnailUrl, editVideo?.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save video");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {editVideo ? "Edit Video" : "Add Video"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Course *</label>
            <select
              value={formData.course_id}
              onChange={(e) =>
                setFormData({ ...formData, course_id: e.target.value })
              }
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Video Link (Bunny.net) *
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              required
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="mt-2 h-32 object-cover rounded-lg"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="free"
              checked={formData.free}
              onChange={(e) =>
                setFormData({ ...formData, free: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="free" className="text-sm font-medium">
              Free video
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : editVideo ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
