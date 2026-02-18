"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileUp, X, File } from "lucide-react";
import type { Document } from "../documents-table";

interface DocumentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editDocument?: Document | null;
}

export function DocumentForm({
  onSuccess,
  onCancel,
  editDocument,
}: DocumentFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // FIX: fetchCourses wrapped in useCallback to prevent unnecessary re-renders
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
    setCourses(data || []);
  }, [supabase]);

  useEffect(() => {
    if (editDocument) {
      setTitle(editDocument.title);
      setCourseId(editDocument.course_id || "");
    }
    fetchCourses();
  }, [editDocument, fetchCourses]); // fetchCourses is now a stable dependency

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

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

      const docData = {
        title,
        course_id: courseId || null,
        teacher_id: user.id,
        ...fileData,
      };

      if (editDocument) {
        const { error } = await supabase
          .from("documents")
          .update(docData)
          .eq("id", editDocument.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("documents").insert([docData]);
        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving document:", error);
      alert("هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردن");
    } finally {
      setUploading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">ناونیشان *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="ناونیشانی دۆکیومێنت"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Course (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          خول{" "}
          <span className="text-muted-foreground font-normal">
            (ئارەزوومەندانە)
          </span>
        </label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">بەبێ خول</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          فایل {!editDocument && "*"}
          {editDocument && (
            <span className="text-muted-foreground font-normal">
              {" "}
              (بۆ گۆڕین هەڵبژێرە)
            </span>
          )}
        </label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50"
            }`}
        >
          {file ? (
            // File selected preview
            <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[220px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 hover:bg-muted-foreground/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : editDocument ? (
            // Existing file info
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <File className="w-5 h-5" />
                <span>{editDocument.file_name}</span>
              </div>
              <label className="cursor-pointer text-sm text-primary hover:underline">
                کلیک بکە بۆ گۆڕین
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            // Empty state
            <label className="cursor-pointer space-y-2 block">
              <FileUp className="w-10 h-10 text-muted-foreground/50 mx-auto" />
              <p className="text-sm text-muted-foreground">
                فایل راکێشە ئێرە یان{" "}
                <span className="text-primary font-medium">کلیک بکە</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, Word, Excel, PowerPoint, ZIP
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
        >
          {uploading
            ? "ئەپلۆدکردن..."
            : editDocument
              ? "نوێکردنەوە"
              : "زیادکردن"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-muted text-sm"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
