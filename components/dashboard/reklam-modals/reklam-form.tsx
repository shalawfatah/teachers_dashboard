"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUp, VideoIcon, X, Loader2 } from "lucide-react";
import { LinkType, ReklamFormProps } from "@/types/reklam";

// ─── Media Helpers ───────────────────────────────────────────────────────────

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

async function uploadVideoToBunny(
  file: File,
  onProgress: (p: number) => void,
): Promise<{ hlsUrl: string; iframeUrl: string }> {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;

  if (!LIBRARY_ID || !API_KEY) throw new Error("Bunny credentials missing");

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

  const uploadRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    { method: "PUT", headers: { AccessKey: API_KEY }, body: file },
  );
  if (!uploadRes.ok) throw new Error("Failed to upload to Bunny");

  onProgress(100);

  const iframeUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;
  const hlsUrl = CDN_HOSTNAME
    ? `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`
    : `https://vz-${LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`;

  return { hlsUrl, iframeUrl };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReklamForm({
  onSuccess,
  onCancel,
  editReklam,
}: ReklamFormProps) {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("none");
  const [linkTarget, setLinkTarget] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingHlsUrl, setExistingHlsUrl] = useState("");
  const [existingVideoUrl, setExistingVideoUrl] = useState("");

  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]);
  const [documents, setDocuments] = useState<
    { id: string; title: string; file_url?: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editReklam) {
      setTitle(editReklam.title);
      setDescription(editReklam.description || "");
      setLinkType(editReklam.link_type);
      setLinkTarget(editReklam.link_target || "");
      setDisplayOrder(editReklam.display_order);
      setIsActive(editReklam.is_active);
      setExistingImageUrl(editReklam.image_url || "");
      setExistingHlsUrl(editReklam.video_hls_url || "");
      setExistingVideoUrl(editReklam.video_url || "");
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
        .select("id, title, file_url")
        .eq("teacher_id", user.id)
        .order("title"),
    ]);

    setCourses(c || []);
    setVideos(v || []);
    setDocuments(d || []);
  };

  // ─── HANDLERS ───
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setVideoFile(null); // Clear video if image is chosen
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setImageFile(null); // Clear image if video is chosen
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(imageFile || existingImageUrl) && !(videoFile || existingHlsUrl)) {
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
      let hlsUrl = existingHlsUrl;
      let iframeUrl = existingVideoUrl;

      if (imageFile) {
        imageUrl = await uploadReklamImage(imageFile);
        hlsUrl = "";
        iframeUrl = "";
      }

      if (videoFile) {
        const result = await uploadVideoToBunny(videoFile, setVideoProgress);
        hlsUrl = result.hlsUrl;
        iframeUrl = result.iframeUrl;
        imageUrl = "";
      }

      const payload = {
        title,
        description,
        image_url: imageUrl || null,
        video_url: iframeUrl || null,
        video_hls_url: hlsUrl || null,
        link_type: linkType,
        link_target: linkTarget || null,
        display_order: displayOrder,
        is_active: isActive,
        teacher_id: user.id,
      };

      if (editReklam) {
        await supabase.from("reklam").update(payload).eq("id", editReklam.id);
      } else {
        await supabase.from("reklam").insert([payload]);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("هەڵەیەک ڕوویدا");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-right">
          ناونیشان *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg text-sm text-right"
          dir="rtl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-right">
          وەسف
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm resize-none text-right"
          dir="rtl"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-right">میدیا *</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border h-32">
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setImageFile(null);
                    setExistingImageUrl("");
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer ${videoFile || existingHlsUrl ? "opacity-40 pointer-events-none" : "hover:bg-muted/30"}`}
              >
                <ImageUp className="w-7 h-7 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="relative">
            {videoFile || existingHlsUrl ? (
              <div className="relative flex flex-col items-center justify-center h-32 border rounded-lg bg-muted/40 text-center px-2">
                <VideoIcon className="w-7 h-7 text-primary mb-1" />
                <span className="text-[10px] truncate w-full">
                  {videoFile ? videoFile.name : "ڤیدیۆی پاشەکەوتکراو"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setExistingHlsUrl("");
                    setExistingVideoUrl("");
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer ${imagePreview ? "opacity-40 pointer-events-none" : "hover:bg-muted/30"}`}
              >
                <VideoIcon className="w-7 h-7 text-muted-foreground" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-right">
            کلیک دەچێتە
          </label>
          <select
            value={linkType}
            onChange={(e) => {
              setLinkType(e.target.value as LinkType);
              setLinkTarget("");
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-right"
            dir="rtl"
          >
            <option value="none">بێ لینک</option>
            <option value="course">خول</option>
            <option value="video">ڤیدیۆ</option>
            <option value="document">داگرتن</option>
            <option value="external">لینک</option>
          </select>
        </div>

        {linkType !== "none" && (
          <div className="animate-in fade-in slide-in-from-top-1">
            <label className="block text-sm font-medium mb-1.5 text-right">
              هەڵبژاردنی ئامانج
            </label>
            {linkType === "external" ? (
              <input
                type="url"
                placeholder="https://..."
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            ) : (
              <select
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-right"
                dir="rtl"
                required
              >
                <option value="">هەڵبژێرە...</option>
                {linkType === "course" &&
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                {linkType === "video" &&
                  videos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                {linkType === "document" &&
                  documents.map((d) => (
                    <option key={d.id} value={d.file_url}>
                      {d.title}
                    </option>
                  ))}
              </select>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "پاشەکەوتکردن"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
