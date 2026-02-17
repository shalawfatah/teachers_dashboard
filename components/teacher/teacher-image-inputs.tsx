import { kurdish_text } from "@/lib/kurdish_text";
import { TeacherImageInputsProps } from "@/types/teacher";
import Image from "next/image";

export function TeacherImageInputs({
  thumbnailPreview,
  coverPreview,
  teacher,
  onThumbClick,
  onCoverClick,
  thumbRef,
  coverRef,
  onThumbChange,
  onCoverChange,
}: TeacherImageInputsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          {kurdish_text.profile_picture}
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
            <Image
              height={100}
              width={100}
              src={thumbnailPreview || teacher.thumbnail}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <button
            type="button"
            onClick={onThumbClick}
            className="px-4 py-2 bg-foreground/5 rounded-lg text-sm"
          >
            {kurdish_text.choose_profile_pic}
          </button>
          <input
            ref={thumbRef}
            type="file"
            accept="image/*"
            onChange={onThumbChange}
            className="hidden"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          {kurdish_text.cover_picture}
        </label>
        <div className="w-full h-40 rounded-lg overflow-hidden bg-muted mb-3">
          <Image
            src={coverPreview || teacher.cover_img}
            height={100}
            width={100}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <button
          type="button"
          onClick={onCoverClick}
          className="px-4 py-2 bg-foreground/5 rounded-lg text-sm"
        >
          {kurdish_text.choose_cover_pic}
        </button>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          onChange={onCoverChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
