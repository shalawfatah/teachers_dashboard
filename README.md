# 📚 Teaching Platform - Full-Stack Education Management System

A comprehensive educational platform built with **Next.js** (web dashboard) and **React Native/Expo** (mobile app) for teachers and students. Features course management, video hosting via Bunny.net, document sharing, promotional carousels, and real-time stats.

---

## 🎯 Overview

This platform enables teachers to:

- Manage courses, videos, and documents
- Upload content (videos to Bunny.net CDN, documents to Supabase Storage)
- Create promotional slides (reklam) with images or videos
- Track student enrollment and engagement
- Customize their profile with avatars and cover images

Students get:

- Full-screen promotional carousel on dashboard
- Access to courses and video content
- Document downloads
- Real-time progress tracking

---

## 🏗️ Tech Stack

### Web Dashboard (Admin/Teacher)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React, Tailwind CSS, Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (images/documents)
- **Video CDN**: Bunny.net
- **Auth**: Supabase Auth

### Mobile App (Student)

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **UI**: React Native Paper, Expo Linear Gradient
- **Video**: expo-video, react-native-webview
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

---

## 📁 Project Structure

```
project-root/
├── web/                          # Next.js dashboard
│   ├── app/
│   │   ├── (protected)/          # Teacher routes
│   │   │   ├── courses/          # Course management
│   │   │   ├── videos/           # Video library
│   │   │   ├── documents/        # Document management
│   │   │   ├── reklam/           # Promotional slides
│   │   │   └── profile/          # Teacher profile
│   │   └── (auth)/               # Login/signup
│   ├── components/
│   │   ├── courses/
│   │   ├── videos/
│   │   ├── documents/
│   │   └── reklam/
│   └── lib/
│       └── supabase/             # Supabase client
│
└── mobile/                       # Expo mobile app
    ├── app/
    │   ├── (student)/            # Student routes
    │   │   ├── courses/          # Browse courses
    │   │   └── profile/          # Student profile
    │   ├── (auth)/               # Login/signup
    │   └── video/[id].tsx        # Video player
    ├── components/
    │   ├── content/
    │   │   ├── ReklamCarousel/   # Full-screen promo carousel
    │   │   └── VideoPlayer/
    │   └── ui/
    └── lib/
        └── supabase.ts           # Supabase client
```

---

**Built with ❤️ for educators and students**
