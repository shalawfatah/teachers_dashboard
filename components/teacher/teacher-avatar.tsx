"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { TeacherViewModal } from "./teacher-view-modal";
import { TeacherEditModal } from "./teacher-edit-modal";
import { createClient } from "@/lib/supabase/client";
import { kurdish_text } from "@/lib/kurdish_text";
import Image from "next/image";
import { Teacher } from "@/types/teacher";

const supabase = createClient();

export function TeacherAvatar() {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTeacher() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("teachers")
          .select("*")
          .eq("email", user.email)
          .single();

        if (data) {
          setTeacher(data);
        }
      }
    }

    fetchTeacher();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    if (user) {
      const { data } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", user.email)
        .single();

      if (data) {
        setTeacher(data);
      }
    }
  };

  if (!teacher) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
    );
  }

  // thumbnail now stores full URL, use it directly
  const avatarUrl = teacher.thumbnail || null;

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="group relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-foreground/10 hover:ring-foreground/30 transition-all duration-300 focus:outline-none focus:ring-foreground/50"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              height={100}
              width={100}
              alt={teacher.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-background border border-foreground/10 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-foreground/10">
              <p className="font-semibold text-sm truncate">{teacher.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {teacher.expertise}
              </p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setIsViewModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-right text-sm hover:bg-foreground/5 transition-colors flex items-center justify-end gap-2"
              >
                <span>{kurdish_text.view_profile}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-right text-sm hover:bg-foreground/5 transition-colors flex items-center justify-end gap-2"
              >
                <span>{kurdish_text.edit_profile}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <TeacherViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        teacher={teacher}
      />

      <TeacherEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        teacher={teacher}
        onUpdate={handleRefresh}
      />
    </>
  );
}
