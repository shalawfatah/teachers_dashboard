"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";

interface Teacher {
  id: string;
  name: string;
  expertise: string;
  email: string;
  thumbnail: string;
  cover_img: string;
}

interface TeacherEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  onUpdate: () => void;
}

export function TeacherEditModal({
  isOpen,
  onClose,
  teacher,
  onUpdate,
}: TeacherEditModalProps) {
  const [name, setName] = useState(teacher.name);
  const [expertise, setExpertise] = useState(teacher.expertise);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      setName(teacher.name);
      setExpertise(teacher.expertise);
      setThumbnailFile(null);
      setCoverFile(null);
      setThumbnailPreview(null);
      setCoverPreview(null);
      setError(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, teacher]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميغابايت");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة يجب أن يكون أقل من 5 ميغابايت");
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let thumbnailPath = teacher.thumbnail;
      let coverPath = teacher.cover_img;

      // Upload thumbnail if selected
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `thumbnails/${teacher.id}-${Date.now()}.${fileExt}`;

        // Delete old thumbnail if exists
        if (teacher.thumbnail) {
          await supabase.storage
            .from("teacher-images")
            .remove([teacher.thumbnail]);
        }

        const { error: uploadError } = await supabase.storage
          .from("teacher-images")
          .upload(fileName, thumbnailFile);

        if (uploadError) throw uploadError;
        thumbnailPath = fileName;
      }

      // Upload cover if selected
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `covers/${teacher.id}-${Date.now()}.${fileExt}`;

        // Delete old cover if exists
        if (teacher.cover_img) {
          await supabase.storage
            .from("teacher-images")
            .remove([teacher.cover_img]);
        }

        const { error: uploadError } = await supabase.storage
          .from("teacher-images")
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;
        coverPath = fileName;
      }

      // Update teacher record
      const { error: updateError } = await supabase
        .from("teachers")
        .update({
          name,
          expertise,
          thumbnail: thumbnailPath,
          cover_img: coverPath,
        })
        .eq("id", teacher.id);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating teacher:", err);
      setError("حدث خطأ أثناء التحديث. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentThumbnailUrl = teacher.thumbnail
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/teacher-images/thumbnails/${teacher.thumbnail}`
    : null;

  const currentCoverUrl = teacher.cover_img
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/teacher-images/covers/${teacher.cover_img}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors flex items-center justify-center group disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-foreground/10">
          <h2 className="text-2xl font-bold">تعديل الملف الشخصي</h2>
          <p className="text-sm text-muted-foreground mt-1">
            قم بتحديث معلوماتك وصورك الشخصية
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium mb-2">الخبرة</label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              required
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2">
              الصورة الشخصية
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : currentThumbnailUrl ? (
                  <img
                    src={currentThumbnailUrl}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    {teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors text-sm font-medium"
              >
                اختر صورة جديدة
              </button>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              الحد الأقصى: 5 ميغابايت
            </p>
          </div>

          {/* Cover */}
          <div>
            <label className="block text-sm font-medium mb-2">
              صورة الغلاف
            </label>
            <div className="space-y-3">
              <div className="w-full h-40 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : currentCoverUrl ? (
                  <img
                    src={currentCoverUrl}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
                )}
              </div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors text-sm font-medium"
              >
                اختر صورة غلاف جديدة
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              الحد الأقصى: 5 ميغابايت
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
