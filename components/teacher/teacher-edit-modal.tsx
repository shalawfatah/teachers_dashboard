"use client";

import { kurdish_text } from "@/lib/kurdish_text";
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
        setError(kurdish_text.error_file_size);
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
        setError(kurdish_text.error_file_size);
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

      // Thumbnail Upload Logic
      if (thumbnailFile) {
        const fileExt =
          thumbnailFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${teacher.id}_thumbnail_${Date.now()}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;
        if (teacher.thumbnail) {
          const oldPath = teacher.thumbnail.split("/teacher-images/")[1];
          if (oldPath)
            await supabase.storage.from("teacher-images").remove([oldPath]);
        }
        const { error: uploadError } = await supabase.storage
          .from("teacher-images")
          .upload(filePath, thumbnailFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("teacher-images").getPublicUrl(filePath);
        thumbnailPath = publicUrl;
      }

      // Cover Upload Logic
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${teacher.id}_cover_${Date.now()}.${fileExt}`;
        const filePath = `covers/${fileName}`;
        if (teacher.cover_img) {
          const oldPath = teacher.cover_img.split("/teacher-images/")[1];
          if (oldPath)
            await supabase.storage.from("teacher-images").remove([oldPath]);
        }
        const { error: uploadError } = await supabase.storage
          .from("teacher-images")
          .upload(filePath, coverFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("teacher-images").getPublicUrl(filePath);
        coverPath = publicUrl;
      }

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
      setError(kurdish_text.error_update);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-foreground/10">
          <h2 className="text-2xl font-bold">{kurdish_text.edit_profile}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {kurdish_text.edit_profile_desk}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Name & Expertise */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {kurdish_text.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {kurdish_text.expertise}
            </label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              required
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {kurdish_text.profile_picture}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                {(thumbnailPreview || teacher.thumbnail) && (
                  <img
                    src={thumbnailPreview || teacher.thumbnail}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="px-4 py-2 bg-foreground/5 rounded-lg text-sm"
              >
                {kurdish_text.choose_profile_pic}
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
              {kurdish_text.max_prof_pic_size}
            </p>
          </div>

          {/* Cover Picture */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {kurdish_text.cover_picture}
            </label>
            <div className="w-full h-40 rounded-lg overflow-hidden bg-muted mb-3">
              {(coverPreview || teacher.cover_img) && (
                <img
                  src={coverPreview || teacher.cover_img}
                  className="w-full h-full object-cover"
                  alt=""
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="px-4 py-2 bg-foreground/5 rounded-lg text-sm"
            >
              {kurdish_text.choose_cover_pic}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {kurdish_text.max_cover_pic_size}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-foreground text-background rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading
                ? kurdish_text.loading_save
                : kurdish_text.save_changes}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-foreground/5 rounded-lg font-medium"
            >
              {kurdish_text.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
