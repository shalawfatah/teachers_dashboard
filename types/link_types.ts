import { LinkType } from "@/types/reklam";
import { Dispatch, SetStateAction } from "react";

interface SelectorItem {
  id: string;
  title: string;
}

interface SelectorDocument extends SelectorItem {
  file_url: string;
}

interface SelectorData {
  courses: SelectorItem[];
  videos: SelectorItem[];
  documents: SelectorDocument[];
}

export interface LinkSelectorProps {
  linkType: LinkType;
  setLinkType: Dispatch<SetStateAction<LinkType>>;
  linkTarget: string;
  setLinkTarget: (value: string) => void;
  data: SelectorData;
}
