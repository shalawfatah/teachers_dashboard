"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

async function uploadReklamImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const filePath = `${Math.random()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("reklam_images") // Your bucket name
    .upload(filePath, file);
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from("reklam_images").getPublicUrl(filePath);
  return publicUrl;
}

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
}

interface ReklamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editReklam?: Reklam | null;
}

type LinkType = "course" | "video" | "external" | "none";

export function ReklamForm({
  onSuccess,
  onCancel,
  editReklam,
}: ReklamFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    video_url: "",
    link_type: "none" as LinkType,
    link_target: "",
    display_order: 1,
    is_active: true,
    background_color: "#6200ee",
    text_color: "#ffffff",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [videos, setVideos] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const supabase = createClient();

  useEffect(() => {
    if (editReklam) {
      setFormData({
        title: editReklam.title,
        description: editReklam.description || "",
        image_url: editReklam.image_url || "",
        video_url: editReklam.video_url || "",
        link_type: editReklam.link_type as LinkType,
        link_target: editReklam.link_target || "",
        display_order: editReklam.display_order,
        is_active: editReklam.is_active,
        background_color: editReklam.background_color,
        text_color: editReklam.text_color,
      });
    }
    fetchCoursesAndVideos();
  }, [editReklam]);

  const fetchCoursesAndVideos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", user.id)
      .order("title");

    const { data: videosData } = await supabase
      .from("videos")
      .select("id, title")
      .order("title");

    setCourses(coursesData || []);
    setVideos(videosData || []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = formData.image_url;

      // Upload image if selected
      if (imageFile) {
        imageUrl = (await uploadReklamImage(imageFile)) || "";
      }

      const reklamData = {
        ...formData,
        image_url: imageUrl,
        teacher_id: user.id,
      };

      if (editReklam) {
        const { error } = await supabase
          .from("reklam")
          .update(reklamData)
          .eq("id", editReklam.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reklam").insert([reklamData]);
        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving reklam:", error);
      alert("Error saving reklam");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">ناونیشان *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">وەسف</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">وێنە</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        {formData.image_url && (
          <img
            src={formData.image_url}
            alt="Preview"
            className="mt-2 h-32 object-cover rounded"
          />
        )}
      </div>

      {/* Link Type */}
      <div>
        <label className="block text-sm font-medium mb-1">جۆری لینک *</label>
        <select
          value={formData.link_type}
          onChange={(e) =>
            setFormData({ ...formData, link_type: e.target.value as LinkType })
          }
          required
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="none">زانیاری (بێ لینک)</option>
          <option value="course">خول</option>
          <option value="video">ڤیدیۆ</option>
          <option value="external">لینکی دەرەکی</option>
        </select>
      </div>

      {/* Link Target */}
      {formData.link_type === "course" && (
        <div>
          <label className="block text-sm font-medium mb-1">خول *</label>
          <select
            value={formData.link_target}
            onChange={(e) =>
              setFormData({ ...formData, link_target: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">خولێک هەڵبژێرە</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.link_type === "video" && (
        <div>
          <label className="block text-sm font-medium mb-1">ڤیدیۆ *</label>
          <select
            value={formData.link_target}
            onChange={(e) =>
              setFormData({ ...formData, link_target: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">ڤیدیۆیەک هەڵبژێرە</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.link_type === "external" && (
        <div>
          <label className="block text-sm font-medium mb-1">لینک *</label>
          <input
            type="url"
            value={formData.link_target}
            onChange={(e) =>
              setFormData({ ...formData, link_target: e.target.value })
            }
            required
            placeholder="https://example.com"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium mb-1">ڕیز *</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({
                ...formData,
                display_order: parseInt(e.target.value),
              })
            }
            required
            min="1"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium mb-1">دۆخ</label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span>چالاک</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {uploading
            ? "پاشەکەوتکردن..."
            : editReklam
              ? "نوێکردنەوە"
              : "زیادکردن"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-muted"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
