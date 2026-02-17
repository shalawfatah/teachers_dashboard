"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import {
  uploadVideoThumbnail,
  uploadVideoToBunny,
  getTeacherCourses,
  saveVideo,
} from "./video-helpers";
import Image from "next/image";
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
    course_id: "",
    free: false,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      getTeacherCourses()
        .then(setCourses)
        .catch(() => setError("Failed to load courses"));
      if (editVideo) {
        setFormData({
          title: editVideo.title,
          course_id: editVideo.course_id,
          free: editVideo.free,
        });
        setThumbnailPreview(editVideo.thumbnail || "");
      } else {
        setFormData({ title: "", course_id: "", free: false });
        setThumbnailPreview("");
        setVideoFile(null);
      }
    }
  }, [editVideo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVideo && !videoFile) return setError("Please select a video file");
    setError("");
    setLoading(true);
    setProgress(0);
    try {
      let videoLink = editVideo?.link || "";
      if (videoFile && !editVideo) {
        setProgress(25);
        videoLink = await uploadVideoToBunny(videoFile);
        setProgress(75);
      }
      let thumbnailUrl = editVideo?.thumbnail || "";
      if (thumbnailFile) {
        const url = await uploadVideoThumbnail(thumbnailFile);
        if (url) thumbnailUrl = url;
      }
      setProgress(90);
      await saveVideo(
        { ...formData, link: videoLink },
        thumbnailUrl,
        editVideo?.id,
      );
      setProgress(100);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save video");
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {editVideo ? "Edit Video" : "Upload Video"}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          {!editVideo && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Video File *
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setVideoFile(f);
                      if (!formData.title)
                        setFormData({
                          ...formData,
                          title: f.name.replace(/\.[^/.]+$/, ""),
                        });
                    }
                  }}
                  className="hidden"
                  id="video-upload"
                  required
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {videoFile ? videoFile.name : "Click to upload video"}
                  </span>
                </label>
              </div>
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
            <label className="block text-sm font-medium mb-2">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setThumbnailFile(f);
                  const r = new FileReader();
                  r.onloadend = () => setThumbnailPreview(r.result as string);
                  r.readAsDataURL(f);
                }
              }}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            />
            {thumbnailPreview && (
              <Image
                src={thumbnailPreview}
                height={100}
                width={100}
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
          {loading && progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
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
              {loading ? "Uploading..." : editVideo ? "Update" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
