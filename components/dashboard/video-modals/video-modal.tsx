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
    video_hls_url?: string; // Add this to the interface
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
      // 1. Handle Video Upload
      let videoData: any = editVideo
        ? {
          iframeUrl: editVideo.link,
          hlsUrl: editVideo.video_hls_url,
        }
        : null;

      if (videoFile && !editVideo) {
        // We pass setProgress as a callback so the bar updates during upload
        videoData = await uploadVideoToBunny(videoFile, (p) => setProgress(p));
      }

      // 2. Handle Thumbnail Upload
      let thumbnailUrl = editVideo?.thumbnail || "";
      if (thumbnailFile) {
        const url = await uploadVideoThumbnail(thumbnailFile);
        if (url) thumbnailUrl = url;
      }

      // 3. Save to Supabase
      // We use the 'link' property to pass the videoData object
      // Our updated 'saveVideo' helper will extract iframeUrl and hlsUrl from it.
      setProgress(95);
      await saveVideo(
        {
          ...formData,
          link: videoData, // This is now { iframeUrl, hlsUrl, videoId } or the existing link
        },
        thumbnailUrl,
        editVideo?.id,
      );

      setProgress(100);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Submit Error:", err);
      setError(err instanceof Error ? err.message : "Failed to save video");
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
            {editVideo ? "نوێکردنەوەی ڤیدیۆ" : "ئەپلۆدکردنی ڤیدیۆ"}
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

          {/* ... [Video File Input Section - remains the same] ... */}
          {!editVideo && (
            <div>
              <label className="block text-sm font-medium mb-2">
                فایلی ڤیدیۆ
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
                    {videoFile
                      ? videoFile.name
                      : "کلیلک بکە بۆ ئەپلۆدکردنی ڤیدیۆ"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ... [Title and Course Select Section - remains the same] ... */}
          <div>
            <label className="block text-sm font-medium mb-2">ناونیشان</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              خولی پەیوەندیدار
            </label>
            <select
              value={formData.course_id}
              onChange={(e) =>
                setFormData({ ...formData, course_id: e.target.value })
              }
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              <option value="">خولێک هەڵبژێرە</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
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
              ڤیدیۆی خۆڕایی
            </label>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {progress < 90 ? "Uploading Video..." : "Saving Details..."}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              {loading
                ? "پرۆسێسکردن..."
                : editVideo
                  ? "نوێکردنەوە"
                  : "ئەپلۆدکردن"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border hover:bg-muted"
            >
              رەتکردنەوە
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
