export interface Reklam {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  link_type: string;
  video_hls_url: string;
  link_target: string;
  display_order: number;
  is_active: boolean;
  background_color: string;
  text_color: string;
}

export interface ReklamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editReklam?: Reklam | null;
}

export type LinkType = "course" | "video" | "document" | "external" | "none";

export interface ReklamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editReklam?: Reklam | null;
}
