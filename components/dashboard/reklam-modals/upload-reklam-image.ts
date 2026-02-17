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
): Promise<{ hlsUrl: string; iframeUrl: string }> {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;

  if (!LIBRARY_ID || !API_KEY) {
    throw new Error("Bunny credentials missing");
  }

  // Step 1 — create video entry
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: { AccessKey: API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ title: file.name }),
    },
  );

  if (!createRes.ok) {
    throw new Error("Failed to create Bunny video");
  }

  const { guid: videoId } = await createRes.json();
  onProgress(20);

  // Step 2 — upload file
  const uploadRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    {
      method: "PUT",
      headers: { AccessKey: API_KEY },
      body: file,
    },
  );

  if (!uploadRes.ok) {
    throw new Error("Failed to upload to Bunny");
  }

  onProgress(100);

  // Return full HLS URL using YOUR actual CDN hostname
  const hlsUrl = CDN_HOSTNAME
    ? `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`
    : `https://vz-${LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`;

  const iframeUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;

  return { hlsUrl, iframeUrl };
}
