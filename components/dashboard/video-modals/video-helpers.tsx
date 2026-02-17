import { createClient } from "@/lib/supabase/client";

export async function uploadVideoThumbnail(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const filePath = `${Math.random()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("video_thumbnails")
    .upload(filePath, file);
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from("video_thumbnails").getPublicUrl(filePath);
  return publicUrl;
}

/**
 * Uploads a video to Bunny.net and returns both iframe and HLS URLs.
 * Made onProgress optional to prevent "is not a function" errors.
 */
export async function uploadVideoToBunny(
  file: File,
  onProgress?: (p: number) => void, // Added '?' to make it optional
): Promise<{ iframeUrl: string; hlsUrl: string; videoId: string }> {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;

  if (!LIBRARY_ID || !API_KEY) throw new Error("Bunny credentials missing");

  // Step 1: Create Video Entry
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: { AccessKey: API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ title: file.name }),
    },
  );

  if (!createRes.ok) throw new Error("Failed to create video entry on Bunny");
  const { guid: videoId } = await createRes.json();

  // Safely call onProgress
  if (typeof onProgress === "function") onProgress(20);

  // Step 2: Upload Binary
  const uploadRes = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    {
      method: "PUT",
      headers: { AccessKey: API_KEY },
      body: file,
    },
  );

  if (!uploadRes.ok) throw new Error("Failed to upload video file to Bunny");

  // Safely call onProgress
  if (typeof onProgress === "function") onProgress(100);

  // Step 3: Construct URLs
  const hlsUrl = CDN_HOSTNAME
    ? `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`
    : `https://vz-${LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`;

  return {
    iframeUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
    hlsUrl: hlsUrl,
    videoId: videoId,
  };
}

/**
 * Saves video data to Supabase.
 * Supports the new video_hls_url column.
 */
/**
 * Saves video data to Supabase.
 * Smarter version: Extracts specific URLs even if the whole Bunny object is passed.
 */
export async function saveVideo(
  formData: {
    title: string;
    link: any;
    video_hls_url?: string;
    course_id: string;
    free: boolean;
  },
  thumbnailUrl: string,
  editVideoId?: string,
) {
  const supabase = createClient();

  let finalLink = formData.link;
  let finalHls = formData.video_hls_url;

  // CHECK: If the UI passed the whole object { iframeUrl, hlsUrl, videoId } as 'link'
  if (formData.link && typeof formData.link === "object") {
    finalLink = formData.link.iframeUrl;
    finalHls = formData.link.hlsUrl;
  }

  const videoData = {
    title: formData.title,
    course_id: formData.course_id,
    free: formData.free,
    link: finalLink, // This will now be the string "https://iframe..."
    video_hls_url: finalHls, // This will now be the string "https://vz-..."
    thumbnail: thumbnailUrl,
    updated_at: new Date().toISOString(),
  };

  if (editVideoId) {
    const { error } = await supabase
      .from("videos")
      .update(videoData)
      .eq("id", editVideoId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("videos").insert([videoData]);
    if (error) throw error;
  }
}

/**
 * Extracts video ID from Bunny.net URL (iframe or direct)
 */
export function extractBunnyVideoId(url: string): string | null {
  const iframeMatch = url.match(/embed\/\d+\/([a-f0-9-]+)/i);
  if (iframeMatch) return iframeMatch[1];

  const playerMatch = url.match(
    /player\.mediadelivery\.net\/embed\/\d+\/([a-f0-9-]+)/i,
  );
  if (playerMatch) return playerMatch[1];

  const directMatch = url.match(/b-cdn\.net\/([a-f0-9-]+)/i);
  if (directMatch) return directMatch[1];

  return null;
}

/**
 * Get video information from Bunny.net including all available URLs
 */
export async function getBunnyVideoInfo(videoId: string): Promise<{
  embedUrl: string;
  hlsUrl: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
}> {
  const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;

  if (!LIBRARY_ID || !API_KEY)
    throw new Error("Bunny.net credentials not configured");

  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    { headers: { AccessKey: API_KEY } },
  );

  if (!response.ok) throw new Error("Failed to fetch video info");
  const data = await response.json();

  const hlsUrl = CDN_HOSTNAME
    ? `https://${CDN_HOSTNAME}/${data.guid}/playlist.m3u8`
    : `https://vz-${LIBRARY_ID}.b-cdn.net/${data.guid}/playlist.m3u8`;

  return {
    embedUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${data.guid}`,
    hlsUrl: hlsUrl,
    videoId: data.guid,
    title: data.title,
    thumbnailUrl: data.thumbnailFileName
      ? `https://vz-${LIBRARY_ID}.b-cdn.net/${data.guid}/${data.thumbnailFileName}`
      : `https://vz-${LIBRARY_ID}.b-cdn.net/${data.guid}/thumbnail.jpg`,
  };
}

export async function getTeacherCourses(): Promise<
  Array<{ id: string; title: string }>
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("teacher_id", user.id)
    .order("title");

  if (error) throw error;
  return data || [];
}
