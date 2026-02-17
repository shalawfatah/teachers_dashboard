"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUp, VideoIcon, X, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LinkType = "course" | "video" | "document" | "external" | "none";

interface Reklam {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  video_bunny_id: string;
  link_type: LinkType;
  link_target: string;
  display_order: number;
  is_active: boolean;
}

interface ReklamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editReklam?: Reklam | null;
}

// ─── Image upload (Supabase) ──────────────────────────────────────────────────

async function uploadReklamImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("reklam_images")
    .upload(path, file);
  if (error) throw error;
  return supabase.storage.from("reklam_images").getPublicUrl(path).data
    .publicUrl;
}

// ─── Video upload (Bunny.net) ─────────────────────────────────────────────────

async function uploadVideoToBunny(
  file: File,
  onProgress: (p: number) => void,
): Promise<{ videoId: string; embedUrl: string }> {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  if (!LIBRARY_ID || !API_KEY) throw new Error("Bunny credentials missing");

  // Step 1 — create video entry
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: { AccessKey: API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ title: file.name }),
    },
  );
  if (!createRes.ok) throw new Error("Failed to create Bunny video");
  const { guid: videoId } = await createRes.json();

  onProgress(20);

  // Step 2 — upload file
  const uploadRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    { method: "PUT", headers: { AccessKey: API_KEY }, body: file },
  );
  if (!uploadRes.ok) throw new Error("Failed to upload to Bunny");

  onProgress(100);

  return {
    videoId,
    embedUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReklamForm({
  onSuccess,
  onCancel,
  editReklam,
}: ReklamFormProps) {
  const supabase = createClient();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("none");
  const [linkTarget, setLinkTarget] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // media state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // existing media (when editing)
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingBunnyId, setExistingBunnyId] = useState("");

  // dropdown options
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]);
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>(
    [],
  );

  const [saving, setSaving] = useState(false);

  // ── Populate form when editing ────────────────────────────────────────────

  useEffect(() => {
    if (editReklam) {
      setTitle(editReklam.title);
      setDescription(editReklam.description || "");
      setLinkType(editReklam.link_type);
      setLinkTarget(editReklam.link_target || "");
      setDisplayOrder(editReklam.display_order);
      setIsActive(editReklam.is_active);
      setExistingImageUrl(editReklam.image_url || "");
      setExistingBunnyId(editReklam.video_bunny_id || "");
      setImagePreview(editReklam.image_url || "");
    }
    fetchDropdowns();
  }, [editReklam]);

  const fetchDropdowns = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: c }, { data: v }, { data: d }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title")
        .eq("teacher_id", user.id)
        .order("title"),
      supabase.from("videos").select("id, title").order("title"),
      supabase
        .from("documents")
        .select("id, title")
        .eq("teacher_id", user.id)
        .order("title"),
    ]);

    setCourses(c || []);
    setVideos(v || []);
    setDocuments(d || []);
  };

  // ── Image handling ─────────────────────────────────────────────────────────

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    // Clear video if image selected
    setVideoFile(null);
    setVideoProgress(0);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl("");
  };

  // ── Video handling ─────────────────────────────────────────────────────────

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setVideoProgress(0);
    // Clear image if video selected
    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl("");
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoProgress(0);
    setExistingBunnyId("");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImage = imageFile || existingImageUrl;
    const hasVideo = videoFile || existingBunnyId;
    if (!hasImage && !hasVideo) {
      alert("تکایە یان وێنە یان ڤیدیۆیەک هەڵبژێرە");
      return;
    }
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = existingImageUrl;
      let bunnyVideoId = existingBunnyId;
      let embedUrl = existingBunnyId
        ? `https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${existingBunnyId}`
        : "";

      // Upload new image
      if (imageFile) {
        imageUrl = await uploadReklamImage(imageFile);
        bunnyVideoId = "";
        embedUrl = "";
      }

      // Upload new video
      if (videoFile) {
        const result = await uploadVideoToBunny(videoFile, setVideoProgress);
        bunnyVideoId = result.videoId;
        embedUrl = result.embedUrl;
        imageUrl = "";
      }

      const payload = {
        title,
        description,
        image_url: imageUrl || null,
        video_url: embedUrl || null,
        video_bunny_id: bunnyVideoId || null,
        link_type: linkType,
        link_target: linkTarget || null,
        display_order: displayOrder,
        is_active: isActive,
        teacher_id: user.id,
      };

      if (editReklam) {
        const { error } = await supabase
          .from("reklam")
          .update(payload)
          .eq("id", editReklam.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reklam").insert([payload]);
        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("هەڵەیەک ڕوویدا");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">ناونیشان *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="بنووسە..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">وەسف</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="بنووسە..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Media — Image OR Video (mutually exclusive) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">میدیا *</label>
        <p className="text-xs text-muted-foreground -mt-2">
          یان وێنە یان ڤیدیۆ هەڵبژێرە — ئەگەر ڤیدیۆ بێت وێنە پێویست ناکات
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Image upload */}
          <div className="relative">
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border h-32">
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                  وێنە
                </span>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center px-3 ${videoFile || existingBunnyId ? "opacity-40 pointer-events-none" : "hover:border-primary/50 hover:bg-muted/30"}`}
              >
                <ImageUp className="w-7 h-7 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">
                  وێنە ئەپلۆد بکە
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Video upload */}
          <div className="relative">
            {videoFile || existingBunnyId ? (
              <div className="relative flex flex-col items-center justify-center h-32 border rounded-lg bg-muted/40 px-3 text-center">
                <VideoIcon className="w-7 h-7 text-primary mb-1" />
                <span className="text-xs font-medium truncate max-w-full">
                  {videoFile
                    ? videoFile.name
                    : `Bunny: ${existingBunnyId.slice(0, 8)}...`}
                </span>
                {videoProgress > 0 && videoProgress < 100 && (
                  <div className="w-full mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {videoProgress}%
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearVideo}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary/80 text-white px-2 py-0.5 rounded-full">
                  ڤیدیۆ
                </span>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center px-3 ${imageFile || imagePreview ? "opacity-40 pointer-events-none" : "hover:border-primary/50 hover:bg-muted/30"}`}
              >
                <VideoIcon className="w-7 h-7 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">
                  ڤیدیۆ ئەپلۆد بکە
                </span>
                <span className="text-xs text-muted-foreground/60">
                  Bunny.net
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Link Type */}
      <div>
        <label className="block text-sm font-medium mb-1.5">کلیک دەچێتە</label>
        <select
          value={linkType}
          onChange={(e) => {
            setLinkType(e.target.value as LinkType);
            setLinkTarget("");
          }}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="none">بێ لینک</option>
          <option value="course">خول</option>
          <option value="video">ڤیدیۆ</option>
          <option value="document">دۆکیومێنت (داگرتن)</option>
          <option value="external">لینکی دەرەکی</option>
        </select>
      </div>

      {/* Link Target (conditional) */}
      {linkType === "course" && (
        <div>
          <label className="block text-sm font-medium mb-1.5">خول *</label>
          <select
            value={linkTarget}
            onChange={(e) => setLinkTarget(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">خولێک هەڵبژێرە</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {linkType === "video" && (
        <div>
          <label className="block text-sm font-medium mb-1.5">ڤیدیۆ *</label>
          <select
            value={linkTarget}
            onChange={(e) => setLinkTarget(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">ڤیدیۆیەک هەڵبژێرە</option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {linkType === "document" && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            دۆکیومێنت *
          </label>
          <select
            value={linkTarget}
            onChange={(e) => setLinkTarget(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">دۆکیومێنتێک هەڵبژێرە</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {linkType === "external" && (
        <div>
          <label className="block text-sm font-medium mb-1.5">لینک *</label>
          <input
            type="url"
            value={linkTarget}
            onChange={(e) => setLinkTarget(e.target.value)}
            required
            placeholder="https://..."
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      )}

      {/* Display Order + Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">ڕیز *</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
            required
            min="1"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="flex flex-col justify-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium">چالاک</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "پاشەکەوتکردن..." : editReklam ? "نوێکردنەوە" : "زیادکردن"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border rounded-lg hover:bg-muted text-sm"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
