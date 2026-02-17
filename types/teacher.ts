import { ChangeEvent, RefObject } from "react";

export interface Teacher {
  id: string;
  name: string;
  expertise: string;
  email: string;
  thumbnail: string;
  cover_img: string;
}

export interface TeacherImageInputsProps {
  thumbnailPreview: string | null;
  coverPreview: string | null;
  teacher: Teacher;
  onThumbClick: () => void;
  onCoverClick: () => void;
  thumbRef: RefObject<HTMLInputElement | null>;
  coverRef: RefObject<HTMLInputElement | null>;
  onThumbChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface TeacherEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  onUpdate: () => void;
}
