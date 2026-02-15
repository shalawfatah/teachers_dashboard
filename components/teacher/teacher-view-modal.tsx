"use client";

import { useEffect } from "react";

interface Teacher {
  id: string;
  name: string;
  expertise: string;
  email: string;
  thumbnail: string;
  cover_img: string;
}

interface TeacherViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
}

export function TeacherViewModal({
  isOpen,
  onClose,
  teacher,
}: TeacherViewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // thumbnail and cover_img now store full URLs, use them directly
  const coverUrl = teacher.cover_img || null;
  const thumbnailUrl = teacher.thumbnail || null;

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors flex items-center justify-center group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Cover image */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Profile section */}
        <div className="relative px-8 pb-8">
          {/* Avatar */}
          <div className="absolute -top-16 right-8">
            <div className="w-32 h-32 rounded-full ring-4 ring-background overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="pt-20">
            <h2 className="text-3xl font-bold mb-2">{teacher.name}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              {teacher.expertise}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    البريد الإلكتروني
                  </p>
                  <p className="font-medium">{teacher.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    <rect width="20" height="14" x="2" y="6" rx="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الخبرة</p>
                  <p className="font-medium">{teacher.expertise}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
