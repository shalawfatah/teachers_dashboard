export interface VideoProps {
  id: string;
  title: string;
  link: string;
  course_id: string;
  thumbnail: string;
  free: boolean;
}

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editVideo?: {
    id: string;
    title: string;
    link: string;
    video_hls_url?: string;
    course_id: string;
    free: boolean;
    thumbnail?: string;
  } | null;
}

export type VideoData = {
  iframeUrl: string;
  hlsUrl: string;
} | null;

export interface Video {
  id: string;
  title: string;
  link: string;
  course_id: string;
  free: boolean;
  created_at: string;
  thumbnail?: string;
  video_hls_url?: string;
  courses?: { title: string };
}
