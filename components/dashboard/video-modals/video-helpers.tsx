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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
