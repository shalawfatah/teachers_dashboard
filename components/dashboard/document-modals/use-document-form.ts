import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DocumentFormProps } from "@/types/document";
import { CourseProps } from "@/types/course";

type CoursePickerItem = Pick<CourseProps, "id" | "title">;

export default function useDocumentForm({
  onSuccess,
  editDocument,
}: Partial<DocumentFormProps>) {
  const supabase = createClient();
  const [state, setState] = useState({
    title: editDocument?.title || "",
    courseId: editDocument?.course_id || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<CoursePickerItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchCourses = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", user.id)
      .order("title");
    setCourses((data as CoursePickerItem[]) || []);
  }, [supabase]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDocument && !file) return alert("تکایە فایلێک هەڵبژێرە");
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileData = editDocument
        ? {
          file_url: editDocument.file_url,
          file_path: editDocument.file_path,
          file_name: editDocument.file_name,
          file_size: editDocument.file_size,
          file_type: editDocument.file_type,
        }
        : null;

      if (file) {
        if (editDocument?.file_path) {
          await supabase.storage
            .from("documents")
            .remove([editDocument.file_path]);
        }

        const filePath = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("documents").getPublicUrl(filePath);

        fileData = {
          file_url: publicUrl,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        };
      }

      const docPayload = {
        title: state.title,
        course_id: state.courseId || null,
        teacher_id: user.id,
        ...fileData,
      };

      const query = editDocument
        ? supabase
          .from("documents")
          .update(docPayload)
          .eq("id", editDocument.id)
        : supabase.from("documents").insert([docPayload]);

      const { error } = await query;
      if (error) throw error;

      onSuccess?.();
    } catch (err) {
      console.error("Submit error:", err);
      alert("هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردن");
    } finally {
      setUploading(false);
    }
  };

  return { state, setState, file, setFile, courses, uploading, handleSubmit };
}
