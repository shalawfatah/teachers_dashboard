// app/upload/page.tsx (or app/dashboard/page.tsx)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
};

export default function UploadVideoPage() {
  const supabase = createClient();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);

      // Get current logged-in teacher
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in");
        router.push("/login");
        return;
      }

      // Fetch all courses belonging to this teacher
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCourses(data || []);

      // Auto-select first course if available
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    // Validate file size (e.g., max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      setError("File size must be less than 2GB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-fill title from filename if empty
    if (!videoTitle) {
      const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setVideoTitle(filename);
    }
  };

  const handleUpload = async () => {
    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }

    if (!selectedFile || !videoTitle.trim()) {
      setError("Please provide a title and select a video file");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      // TODO: Add Bunny.net upload logic here
      // For now, just simulate upload
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }

      alert("Upload complete! (Logic not implemented yet)");

      // Reset form
      setVideoTitle("");
      setSelectedFile(null);
      setPreviewUrl("");
      setProgress(0);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Upload and manage your course videos
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {courses.length === 0 ? (
          // No Courses State
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Courses Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You need to create a course before you can upload videos. Contact
              your administrator to create courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Form */}
            <div className="lg:col-span-2">
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Course Selection */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <label
                  htmlFor="course"
                  className="block text-lg font-semibold text-gray-900 mb-3"
                >
                  Select Course *
                </label>
                <select
                  id="course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  disabled={uploading}
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {selectedCourseId && (
                  <p className="mt-3 text-sm text-gray-600">
                    Selected:{" "}
                    <span className="font-semibold">
                      {courses.find((c) => c.id === selectedCourseId)?.title}
                    </span>
                  </p>
                )}
              </div>

              {/* Video Title */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <label
                  htmlFor="title"
                  className="block text-lg font-semibold text-gray-900 mb-3"
                >
                  Video Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g., Introduction to React Hooks"
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={uploading}
                />
              </div>

              {/* File Upload */}
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Video File *
                </label>

                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-96 border-3 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:border-blue-400">
                    <div className="flex flex-col items-center justify-center pt-7 pb-8">
                      <svg
                        className="w-20 h-20 mb-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-3 text-lg text-gray-600">
                        <span className="font-semibold text-blue-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        MP4, MOV, AVI, WebM (MAX. 2GB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </label>
                ) : (
                  <div className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                          <svg
                            className="w-10 h-10 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-lg truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatFileSize(selectedFile.size)} •{" "}
                            {selectedFile.type}
                          </p>
                        </div>
                      </div>
                      {!uploading && (
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl("");
                          }}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Video Preview */}
                    {previewUrl && (
                      <div className="mt-6">
                        <video
                          src={previewUrl}
                          controls
                          className="w-full rounded-lg shadow-lg"
                          style={{ maxHeight: "400px" }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Uploading to Bunny.net...
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setVideoTitle("");
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setError("");
                  }}
                  disabled={uploading}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Clear Form
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    !selectedCourseId ||
                    !selectedFile ||
                    !videoTitle.trim() ||
                    uploading
                  }
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all"
                >
                  {uploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Info & Guidelines */}
            <div className="lg:col-span-1">
              {/* Course Summary */}
              {selectedCourseId && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">
                    Selected Course
                  </h3>
                  {(() => {
                    const course = courses.find(
                      (c) => c.id === selectedCourseId,
                    );
                    return course ? (
                      <div>
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h4 className="font-semibold text-gray-900">
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {course.description}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Upload Guidelines */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Upload Guidelines
                  </h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Formats: MP4, MOV, AVI, WebM</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Max size: 2GB</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Recommended: 1080p (1920x1080)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Videos are Premium by default</span>
                  </li>
                </ul>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  💡 Pro Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use descriptive titles for better SEO</li>
                  <li>• Ensure good lighting and audio quality</li>
                  <li>• Keep videos focused and concise</li>
                  <li>• Upload during off-peak hours for faster speeds</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
