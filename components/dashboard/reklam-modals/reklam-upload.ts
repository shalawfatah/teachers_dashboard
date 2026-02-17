import { createClient } from "@/lib/supabase/client";

export async function uploadReklamImage(file: File): Promise<string> {
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

export async function uploadVideoToBunny(
  file: File,
  onProgress: (p: number) => void,
) {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  if (!LIBRARY_ID || !API_KEY) throw new Error("Bunny credentials missing");

  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: { AccessKey: API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ title: file.name }),
    },
  );
  const { guid: videoId } = await createRes.json();

  onProgress(20);
  await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    {
      method: "PUT",
      headers: { AccessKey: API_KEY },
      body: file,
    },
  );

  onProgress(100);
  return {
    iframeUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
    hlsUrl: `https://vz-${LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`,
  };
}
