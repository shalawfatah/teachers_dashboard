import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function uploadThumbnail(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${Math.random()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("course_images")
    .upload(filePath, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("course_images").getPublicUrl(filePath);
  return publicUrl;
}

export async function saveCourse(
  formData: {
    title: string;
    description: string;
    grade: string;
    subject: string;
  },
  thumbnailUrl: string,
  editCourseId?: string,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const courseData = {
    ...formData,
    thumbnail: thumbnailUrl,
    teacher_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (editCourseId) {
    const { error } = await supabase
      .from("courses")
      .update(courseData)
      .eq("id", editCourseId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("courses").insert([courseData]);
    if (error) throw error;
  }
}
