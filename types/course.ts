export interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCourse?: {
    id: string;
    title: string;
    description: string;
    grade: string;
    subject: string;
    thumbnail?: string;
  } | null;
}

export interface CourseProps {
  id: string;
  title: string;
  description: string;
  grade: 7 | 8 | 9 | 10 | 11 | 12;
  subject: string;
  teacher_id: string;
  thumbnail: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  teacher_id: string;
  created_at: string;
  thumbnail?: string;
}

export type CoursePickerItem = Pick<CourseProps, "id" | "title">;
