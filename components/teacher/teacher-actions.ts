import { createClient } from "@/lib/supabase/client";

export async function uploadTeacherImage(
  file: File,
  teacherId: string,
  type: "thumbnails" | "covers",
  oldUrl?: string,
) {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${type}/${teacherId}_${type}_${Date.now()}.${fileExt}`;

  // Delete old image if it exists
  if (oldUrl) {
    const oldPath = oldUrl.split("/teacher-images/")[1];
    if (oldPath)
      await supabase.storage.from("teacher-images").remove([oldPath]);
  }

  const { error } = await supabase.storage
    .from("teacher-images")
    .upload(filePath, file);
  if (error) throw error;

  return supabase.storage.from("teacher-images").getPublicUrl(filePath).data
    .publicUrl;
}
