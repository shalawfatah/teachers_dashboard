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
  // You'll need to add these to your environment variables
  const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;

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

  // Return the video URL (you can customize this based on your Bunny.net setup)
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
