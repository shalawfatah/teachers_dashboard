"use client";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { kurdish_text } from "@/lib/kurdish_text";
import { createClient } from "@/lib/supabase/client";
import { uploadTeacherImage } from "./teacher-actions";
import { TeacherImageInputs } from "./teacher-image-inputs";
import { TeacherEditModalProps } from "@/types/teacher";

export function TeacherEditModal({
  isOpen,
  onClose,
  teacher,
  onUpdate,
}: TeacherEditModalProps) {
  const [formData, setFormData] = useState({
    name: teacher.name,
    expertise: teacher.expertise,
  });
  const [files, setFiles] = useState<{
    thumb: File | null;
    cover: File | null;
  }>({ thumb: null, cover: null });
  const [previews, setPreviews] = useState({ thumb: "", cover: "" });
  const [loading, setLoading] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen)
      setFormData({ name: teacher.name, expertise: teacher.expertise });
  }, [isOpen, teacher]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumb" | "cover",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let thumbUrl = teacher.thumbnail,
        coverUrl = teacher.cover_img;
      if (files.thumb)
        thumbUrl = await uploadTeacherImage(
          files.thumb,
          teacher.id,
          "thumbnails",
          teacher.thumbnail,
        );
      if (files.cover)
        coverUrl = await uploadTeacherImage(
          files.cover,
          teacher.id,
          "covers",
          teacher.cover_img,
        );

      await supabase
        .from("teachers")
        .update({
          name: formData.name,
          expertise: formData.expertise,
          thumbnail: thumbUrl,
          cover_img: coverUrl,
        })
        .eq("id", teacher.id);

      onUpdate();
      onClose();
    } catch (err) {
      console.log("err: ", err);
      alert(kurdish_text.error_update);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-background rounded-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">{kurdish_text.edit_profile}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <input
            className="w-full p-3 bg-foreground/5 border rounded-lg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={kurdish_text.name}
            required
          />
          <input
            className="w-full p-3 bg-foreground/5 border rounded-lg"
            value={formData.expertise}
            onChange={(e) =>
              setFormData({ ...formData, expertise: e.target.value })
            }
            placeholder={kurdish_text.expertise}
            required
          />

          <TeacherImageInputs
            teacher={teacher}
            thumbRef={thumbInputRef}
            coverRef={coverInputRef}
            thumbnailPreview={previews.thumb}
            coverPreview={previews.cover}
            onThumbClick={() => thumbInputRef.current?.click()}
            onCoverClick={() => coverInputRef.current?.click()}
            onThumbChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleFileChange(e, "thumb")
            }
            onCoverChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleFileChange(e, "cover")
            }
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-foreground text-background rounded-lg disabled:opacity-50"
            >
              {loading ? kurdish_text.loading_save : kurdish_text.save_changes}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-foreground/5 rounded-lg"
            >
              {kurdish_text.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
