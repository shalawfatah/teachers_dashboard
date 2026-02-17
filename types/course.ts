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
  id:string;
  title: string;
  description: string;
  grade: 7 | 8 | 9 | 10 | 11 | 12;
  subject: string;
  teacher_id: string;
  thumbnail: string;
}
