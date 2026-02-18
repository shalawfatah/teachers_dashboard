import { LinkType } from "@/types/reklam";
import { Dispatch, SetStateAction } from "react";

interface SelectorItem {
  id: string;
  title: string;
}

// Update Document specifically because it uses file_url as value
interface SelectorDocument extends SelectorItem {
  file_url: string;
}

interface SelectorData {
  courses: SelectorItem[];
  videos: SelectorItem[];
  documents: SelectorDocument[];
}

interface LinkSelectorProps {
  linkType: LinkType;
  setLinkType: Dispatch<SetStateAction<LinkType>>;
  linkTarget: string;
  setLinkTarget: (value: string) => void;
  data: SelectorData;
}

export function LinkSelector({
  linkType,
  setLinkType,
  linkTarget,
  setLinkTarget,
  data,
}: LinkSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-right">
          ئامانجی ریکلام
        </label>
        <select
          value={linkType}
          dir="rtl"
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-black"
          onChange={(e) => {
            setLinkType(e.target.value as LinkType);
            setLinkTarget("");
          }}
        >
          <option value="none">بێ لینک</option>
          <option value="course">خول</option>
          <option value="video">ڤیدیۆ</option>
          <option value="document">داگرتن</option>
          <option value="external">لینک</option>
        </select>
      </div>
      {linkType !== "none" && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <label className="block text-sm font-medium mb-1.5 text-right">
            هەڵبژاردنی ئامانج
          </label>
          {linkType === "external" ? (
            <input
              type="url"
              value={linkTarget}
              onChange={(e) => setLinkTarget(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="https://..."
            />
          ) : (
            <select
              value={linkTarget}
              onChange={(e) => setLinkTarget(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-right text-black"
              dir="rtl"
              required
            >
              <option value="">هەڵبژێرە...</option>
              {linkType === "course" &&
                data.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              {linkType === "video" &&
                data.videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              {linkType === "document" &&
                data.documents.map((d) => (
                  <option key={d.id} value={d.file_url}>
                    {d.title}
                  </option>
                ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
