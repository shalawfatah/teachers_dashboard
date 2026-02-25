"use client";
import { DocumentFormProps } from "@/types/document";
import useDocumentForm from "./use-document-form";
import FileDropzone from "./file-dropzone";
import FilePreview from "./file-preview";

export function DocumentForm(props: DocumentFormProps) {
  const { state, setState, file, setFile, courses, uploading, handleSubmit } =
    useDocumentForm(props);
  const formatSize = (b: number) =>
    b < 1048576
      ? `${(b / 1024).toFixed(0)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <input
          className="w-full px-3 py-2 border rounded-lg text-sm"
          value={state.title}
          onChange={(e) => setState({ ...state, title: e.target.value })}
          placeholder="ناونیشانی دۆکیومێنت"
          required
        />

        <select
          className="w-full px-3 py-2 border rounded-lg text-sm"
          value={state.courseId}
          onChange={(e) => setState({ ...state, courseId: e.target.value })}
        >
          <option value="">بەبێ خول</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <FileDropzone onFileSelect={(file) => setFile(file)}>
          {(file || props.editDocument) && (
            <FilePreview
              file={file}
              existingName={props.editDocument?.file_name}
              onRemove={() => setFile(null)}
              formatSize={formatSize}
            />
          )}
        </FileDropzone>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 bg-primary text-white p-2 rounded-lg text-sm"
        >
          {uploading
            ? "ئەپلۆدکردن..."
            : props.editDocument
              ? "نوێکردنەوە"
              : "زیادکردن"}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          پاشگەزبوونەوە
        </button>
      </div>
    </form>
  );
}
