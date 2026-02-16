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

export async function uploadVideoToBunny(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME; // e.g., "vz-xxxxx.b-cdn.net"

  if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY) {
    throw new Error("Bunny.net credentials not configured");
  }

  // Create a video in Bunny.net library
  const createResponse = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: file.name,
      }),
    },
  );

  if (!createResponse.ok) {
    throw new Error("Failed to create video in Bunny.net");
  }

  const createData = await createResponse.json();
  const videoId = createData.guid;

  // Upload the video file
  const uploadResponse = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
      },
      body: file,
    },
  );

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload video to Bunny.net");
  }

  // Return the direct HLS playlist URL (works with expo-video)
  // If you have a CDN hostname configured, use it
  if (BUNNY_CDN_HOSTNAME) {
    return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
  }

  // Otherwise, use the default video delivery URL
  return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`;
}

/**
 * Get video information from Bunny.net including all available URLs
 */
export async function getBunnyVideoInfo(videoId: string): Promise<{
  hlsUrl: string;
  mp4Urls: Array<{ quality: string; url: string }>;
  thumbnailUrl: string;
}> {
  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
  const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;

  if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY) {
    throw new Error("Bunny.net credentials not configured");
  }

  const response = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_API_KEY,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video info from Bunny.net");
  }

  const data = await response.json();
  const baseUrl = BUNNY_CDN_HOSTNAME
    ? `https://${BUNNY_CDN_HOSTNAME}/${videoId}`
    : `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}`;

  return {
    hlsUrl: `${baseUrl}/playlist.m3u8`,
    mp4Urls: [
      { quality: "360p", url: `${baseUrl}/play_360p.mp4` },
      { quality: "480p", url: `${baseUrl}/play_480p.mp4` },
      { quality: "720p", url: `${baseUrl}/play_720p.mp4` },
      { quality: "1080p", url: `${baseUrl}/play_1080p.mp4` },
    ],
    thumbnailUrl: `${baseUrl}/thumbnail.jpg`,
  };
}

/**
 * Extract video ID from Bunny.net URL (iframe or direct)
 */
export function extractBunnyVideoId(url: string): string | null {
  // Match iframe URL: https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
  const iframeMatch = url.match(/embed\/\d+\/([a-f0-9-]+)/i);
  if (iframeMatch) return iframeMatch[1];

  // Match direct URL: https://vz-xxxxx.b-cdn.net/VIDEO_ID/playlist.m3u8
  const directMatch = url.match(/b-cdn\.net\/([a-f0-9-]+)/i);
  if (directMatch) return directMatch[1];

  return null;
}

/**
 * Convert iframe URL to direct video URL
 */
export async function convertIframeToDirectUrl(
  iframeUrl: string,
): Promise<string> {
  const videoId = extractBunnyVideoId(iframeUrl);
  if (!videoId) {
    throw new Error("Invalid Bunny.net URL");
  }

  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;

  if (BUNNY_CDN_HOSTNAME) {
    return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
  }

  return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/playlist.m3u8`;
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

export async function saveVideo(
  formData: { title: string; link: string; course_id: string; free: boolean },
  thumbnailUrl: string,
  editVideoId?: string,
) {
  const supabase = createClient();
  const videoData = {
    ...formData,
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
