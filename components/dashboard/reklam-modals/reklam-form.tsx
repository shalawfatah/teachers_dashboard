"use client";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { ReklamFormProps, LinkType } from "@/types/reklam";
import { uploadVideoToBunny } from "./reklam-upload";
import { MediaSelector } from "./media-selector";
import { LinkSelector } from "./link-selector";
import { uploadReklamImage } from "./upload-reklam-image";

interface DbData {
  courses: Array<{ id: string; title: string }>;
  videos: Array<{ id: string; title: string }>;
  documents: Array<{ id: string; title: string; file_url: string }>;
}

export function ReklamForm({
  onSuccess,
  onCancel,
  editReklam,
}: ReklamFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState(editReklam?.title || "");
  const [description, setDescription] = useState(editReklam?.description || "");
  const [linkType, setLinkType] = useState<LinkType>(
    (editReklam?.link_type as LinkType) || "none",
  );
  const [linkTarget, setLinkTarget] = useState(editReklam?.link_target || "");

  // FIX: Explicitly set to true for new items, or the db value for editing
  const [isActive, setIsActive] = useState<boolean>(
    editReklam ? !!editReklam.is_active : true,
  );

  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(editReklam?.image_url || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dbData, setDbData] = useState<DbData>({
    courses: [],
    videos: [],
    documents: [],
  });

  const fetchDropdowns = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: courses }, { data: videos }, { data: docs }] =
      await Promise.all([
        supabase.from("courses").select("id, title").eq("teacher_id", user.id),
        supabase.from("videos").select("id, title"),
        supabase
          .from("documents")
          .select("id, title, file_url")
          .eq("teacher_id", user.id),
      ]);

    setDbData({
      courses: courses || [],
      videos: videos || [],
      documents: docs || [],
    });
  }, [supabase]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let img = editReklam?.image_url,
        hls = editReklam?.video_hls_url,
        vid = editReklam?.video_url;

      if (imageFile) {
        img = await uploadReklamImage(imageFile);
        hls = undefined;
        vid = undefined;
      }

      if (videoFile) {
        const res = await uploadVideoToBunny(videoFile, () => { });
        hls = res.hlsUrl;
        vid = res.iframeUrl;
        img = undefined;
      }

      const payload = {
        title,
        description,
        image_url: img,
        video_url: vid,
        video_hls_url: hls,
        link_type: linkType,
        link_target: linkTarget,
        is_active: isActive, // Included in payload
        teacher_id: user?.id,
      };

      if (editReklam) {
        await supabase.from("reklam").update(payload).eq("id", editReklam.id);
      } else {
        await supabase.from("reklam").insert([payload]);
      }

      onSuccess();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="ناونیشان"
        className="w-full p-2 border rounded text-right"
        dir="rtl"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="وەسف"
        className="w-full p-2 border rounded text-right"
        dir="rtl"
      />

      <MediaSelector
        imagePreview={imagePreview}
        videoFile={videoFile}
        existingHls={editReklam?.video_hls_url}
        onImageChange={(e: ChangeEvent<HTMLInputElement>) => {
          const f = e.target.files?.[0];
          if (f) {
            setImageFile(f);
            setImagePreview(URL.createObjectURL(f));
            setVideoFile(null);
          }
        }}
        onVideoChange={(e: ChangeEvent<HTMLInputElement>) => {
          const f = e.target.files?.[0];
          if (f) {
            setVideoFile(f);
            setImagePreview("");
            setImageFile(null);
          }
        }}
        onClearImage={() => {
          setImagePreview("");
          setImageFile(null);
        }}
        onClearVideo={() => {
          setVideoFile(null);
        }}
      />

      <LinkSelector
        linkType={linkType}
        setLinkType={setLinkType}
        linkTarget={linkTarget}
        setLinkTarget={setLinkTarget}
        data={dbData}
      />

      {/* Checkbox for is_active (Checked by default for new entries) */}
      <div className="flex items-center gap-3 px-1 py-2">
        <label
          htmlFor="is_active"
          className="text-sm font-medium cursor-pointer"
        >
          چالاک لەسەر سکرین
        </label>
        <input
          id="is_active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-5 h-5 accent-primary cursor-pointer"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary text-black p-2.5 rounded-lg font-medium"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            "پاشەکەوتکردن"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border p-2.5 rounded-lg hover:bg-muted transition-colors"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
