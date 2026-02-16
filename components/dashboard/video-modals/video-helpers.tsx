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

  if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY) {
    throw new Error("Bunny.net credentials not configured");
  }

  // Step 1: Create a video in Bunny.net library
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
    const errorText = await createResponse.text();
    console.error("Bunny.net create error:", errorText);
    throw new Error("Failed to create video in Bunny.net");
  }

  const createData = await createResponse.json();
  const videoId = createData.guid;

  console.log("Created video with ID:", videoId);

  // Step 2: Upload the video file
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
    const errorText = await uploadResponse.text();
    console.error("Bunny.net upload error:", errorText);
    throw new Error("Failed to upload video to Bunny.net");
  }

  console.log("Video uploaded successfully");

  // Step 3: Get the video details to get the correct video ID
  // Sometimes Bunny.net assigns a different ID after processing
  const detailsResponse = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_API_KEY,
      },
    },
  );

  if (!detailsResponse.ok) {
    console.error("Failed to fetch video details, using original ID");
  } else {
    const videoDetails = await detailsResponse.json();
    console.log("Video details:", videoDetails);

    // Use the video ID from details if available
    if (videoDetails.guid) {
      console.log("Using video ID from details:", videoDetails.guid);
    }
  }

  // Step 4: Return the embed player URL (works with both iframe and expo-video)
  // This is the safest URL format that always works
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

/**
 * Convert Bunny.net URL to the format needed for expo-video
 * Takes any Bunny URL and returns the iframe embed URL
 */
export function getBunnyEmbedUrl(videoIdOrUrl: string): string {
  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

  // If it's already a full URL, extract the video ID
  if (videoIdOrUrl.includes("http")) {
    const videoId = extractBunnyVideoId(videoIdOrUrl);
    if (videoId) {
      return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
    }
  }

  // Otherwise assume it's just the video ID
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoIdOrUrl}`;
}

/**
 * Get video information from Bunny.net including all available URLs
 */
export async function getBunnyVideoInfo(videoId: string): Promise<{
  embedUrl: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
}> {
  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;

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

  return {
    embedUrl: `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${data.guid}`,
    videoId: data.guid,
    title: data.title,
    thumbnailUrl: data.thumbnailFileName
      ? `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${data.guid}/${data.thumbnailFileName}`
      : `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${data.guid}/thumbnail.jpg`,
  };
}

/**
 * Extract video ID from Bunny.net URL (iframe or direct)
 */
export function extractBunnyVideoId(url: string): string | null {
  // Match iframe URL: https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
  const iframeMatch = url.match(/embed\/\d+\/([a-f0-9-]+)/i);
  if (iframeMatch) return iframeMatch[1];

  // Match player URL: https://player.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
  const playerMatch = url.match(
    /player\.mediadelivery\.net\/embed\/\d+\/([a-f0-9-]+)/i,
  );
  if (playerMatch) return playerMatch[1];

  // Match direct URL: https://vz-xxxxx.b-cdn.net/VIDEO_ID/playlist.m3u8
  const directMatch = url.match(/b-cdn\.net\/([a-f0-9-]+)/i);
  if (directMatch) return directMatch[1];

  return null;
}

/**
 * Convert any Bunny URL to iframe embed URL
 */
export function convertToEmbedUrl(url: string): string {
  const videoId = extractBunnyVideoId(url);
  if (!videoId) {
    throw new Error("Invalid Bunny.net URL");
  }

  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
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
