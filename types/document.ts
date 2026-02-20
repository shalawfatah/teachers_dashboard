export interface DocumentProps {
  id: string;
  teacher_id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface DocumentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editDocument?: DocumentProps | null;
}
