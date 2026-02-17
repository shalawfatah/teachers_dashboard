"use client";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { ReklamFormProps, LinkType } from "@/types/reklam";
import { uploadReklamImage, uploadVideoToBunny } from "./reklam-upload";
import { MediaSelector } from "./media-selector";
import { LinkSelector } from "./link-selector";

// Define internal data structure for type safety
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
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(editReklam?.image_url || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dbData, setDbData] = useState<DbData>({
    courses: [],
    videos: [],
    documents: [],
  });

  // FIX: fetchDropdowns wrapped in useCallback to stabilize the reference
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
  }, [fetchDropdowns]); // Now safe to include here

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
        teacher_id: user?.id,
      };

      // FIX: Changed ternary expression into a proper awaited call
      if (editReklam) {
        await supabase.from("reklam").update(payload).eq("id", editReklam.id);
      } else {
        await supabase.from("reklam").insert([payload]);
      }
      
      onSuccess();
    } catch (err) {
      // FIX: Log or use the error to satisfy the linter
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-primary text-white p-2.5 rounded-lg"
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
          className="flex-1 border p-2.5 rounded-lg"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
