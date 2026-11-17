# 🚀 TaskFlow — Personal Task Manager PWA

TaskFlow is a production-ready Progressive Web App (PWA) designed specifically for university students. It automatically imports tasks and deadlines from course syllabi and assignment Excel spreadsheets, organizes them chronologically, and highlights urgent deadlines in a dedicated **"Today's Focus"** dashboard.

---

## 🌟 Key Features

### 1. Excel Import & Intelligent Task Extraction
- **Drag-and-Drop & File Picker**: Upload `.xlsx` and `.xls` files effortlessly.
- **Thai & English Header Matching**: Automatic detection for column aliases:
  - **Task Name**: `ชื่องาน`, `งาน`, `หัวข้องาน`, `Task Name`, `Title`, `Assignment`, `Todo`
  - **Subject / Course**: `วิชา`, `รหัสวิชา`, `หมวดหมู่`, `Subject`, `Course`, `Project`
  - **Deadline / Due Date**: `กำหนดส่ง`, `วันครบกำหนด`, `เดดไลน์`, `Deadline`, `Due Date`
  - **Priority**: `ความสำคัญ`, `ระดับความสำคัญ`, `Priority`, `Urgency`
  - **Description**: `รายละเอียด`, `คำอธิบาย`, `Notes`, `Description`
  - **Link**: `ลิงก์`, `เอกสารอ้างอิง`, `URL`, `Task Link`
- **Fallback Column Mapping**: Interactive dropdown mapper to customize fields if auto-detection misses non-standard headers.
- **Multi-Sheet Support**: Select any worksheet from multi-tab workbooks.
- **Robust Date Parsing**: Interprets Excel serial numbers, Buddhist Era (BE พ.ศ. 2567/2568/2569) dates, Thai month names, and formatted ISO dates into `Asia/Bangkok` (+07:00) timezone.
- **Interactive Preview Table**:
  - Exclude/include specific rows with checkboxes
  - Inline editing to correct missing fields before importing
  - Duplicate detection against current batch and existing database tasks
  - Comprehensive import summary modal (Total, Imported, Skipped, Invalid).

### 2. Task Management & Chronological Sorting
- **Deadlines Sorted Chronologically**: Overdue tasks at the top, followed by nearest upcoming deadlines.
- **Countdown Indicators**: Real-time remaining time tags (e.g. `Overdue (2h ago)`, `4h left`, `2d left`).
- **Priority Indicators**: High (🔴), Medium (🟡), and Low (🟢) badges.
- **Status Workflow**: Pending, In Progress, and Completed.
- **Fast Search & Filters**: Filter by status (Active, All, Completed), priority, and course subject.
- **Manual Task Creation & Editing**: Responsive modal to add or modify assignments with date/time pickers and link attachments.
- **Safe Deletion**: Deletion confirmation modal to prevent accidental data loss.

### 3. "Today's Focus" Urgent Dashboard
- Dedicated view of incomplete tasks requiring immediate attention:
  - Overdue tasks (prominently labeled)
  - Tasks due today (before midnight `Asia/Bangkok`)
  - Tasks due within the next 48 hours
- Instant check-off with optimistic UI update and gamified study focus streak meter.

### 4. Progressive Web App (PWA) & Offline-First Shell
- **App Installation**: Installable as a native app on Chrome, Edge, Safari (iOS/macOS), and Android.
- **Offline Shell**: Built with `@ducanh2912/next-pwa` caching the application shell and static assets via service workers.
- **Offline Banner**: Clear indicator when offline; seamless local-first caching so tasks can be viewed and added without internet.
- **Responsive Navigation**: Desktop sidebar + mobile top/bottom navigation bars.

### 5. Web Push Notifications (Firebase Cloud Messaging)
- **Explicit Permission Opt-in**: Prompts for notification permissions only upon user action in Settings.
- **FCM Web Push Registration**: Registers device tokens with Supabase and service worker.
- **Scheduled Reminder Cron**: Server-side endpoint (`/api/notifications/cron`) to trigger automated reminders (48h advance warning, due today morning, overdue alerts) using Firebase Admin SDK while preventing duplicate logs.
- **Test Notification Trigger**: Instant notification test button in Settings.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router) with React 19 & TypeScript
- **Styling**: Tailwind CSS with custom Dark / Light mode support
- **Icons**: Lucide React
- **PWA**: `@ducanh2912/next-pwa` with custom Web App Manifest & Service Worker
- **Push Notifications**: Firebase Cloud Messaging (FCM) & Firebase Admin SDK
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Spreadsheet Parsing**: SheetJS (`xlsx`)
- **Date Handling**: `date-fns` and `date-fns-tz` (`Asia/Bangkok` timezone)
- **Deployment**: Vercel & GitHub Actions CI/CD

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts, PWA meta, and theme provider
│   ├── page.tsx                # Dashboard with Today's Focus & stats
│   ├── tasks/page.tsx          # Chronologically sorted task management
│   ├── import/page.tsx         # Excel upload, column mapping & preview
│   ├── settings/page.tsx       # Notifications, reminder windows & theme settings
│   └── api/
│       ├── tasks/route.ts      # Task CRUD API
│       ├── tasks/[id]/route.ts # Single task PUT / DELETE
│       ├── import/route.ts     # Bulk task import endpoint
│       └── notifications/
│           ├── register/route.ts # Register FCM device token
│           ├── send/route.ts     # Send test notification
│           └── cron/route.ts     # Scheduled deadline reminder worker
├── components/
│   ├── dashboard/              # GreetingHeader, TaskStatsOverview, TodaysFocusSection, UpcomingDeadlinesSection
│   ├── tasks/                  # TaskCard, TaskModal, DeleteConfirmModal, TaskFilterBar
│   ├── import/                 # ExcelDropzone, ColumnMapper, ImportPreviewTable, ImportSummaryModal
│   ├── layout/                 # Sidebar, MobileTopNav, MobileBottomNav, OfflineBanner
│   └── ui/                     # Button, Badge, Input, Select, Modal
├── lib/
│   ├── supabase/               # Supabase browser client & server admin client
│   ├── firebase/               # FCM web client & Firebase Admin SDK
│   ├── excel/                  # Workbook parser, Thai/EN column matcher, validator
│   ├── dates/                  # Asia/Bangkok timezone utilities, relative time countdown
│   └── utils/                  # Tailwind cn utility, local-first offline storage
├── hooks/                      # useTasks, useOfflineStatus, useTheme
├── types/                      # task.ts, excel.ts, notification.ts
└── services/                   # taskService.ts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ / v22+ / v24+
- **pnpm** (recommended) or **npm**

### 2. Installation

```bash
# Clone or navigate to the repository
cd "Personal Task Manager PWA"

# Install dependencies using pnpm
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your configuration keys:

```ini
# Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase Cloud Messaging (Web Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin SDK (Server)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----\n"
```

*(Note: If Supabase or Firebase environment variables are omitted initially, TaskFlow gracefully falls back to its built-in local-first offline engine so you can immediately test and use the app).*

### 4. Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and run the schema migration file located at:
   [`supabase/migrations/20261117000000_init_schema.sql`](supabase/migrations/20261117000000_init_schema.sql).
4. The migration creates `tasks`, `notification_tokens`, and `notification_logs` tables with appropriate indexes and RLS policies.

### 5. Running Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Running Automated Tests

```bash
pnpm test
```

Executes the automated unit test suite covering:
- Thai Buddhist Era & Western date parsing
- Excel serial date calculations
- Thai and English column header matching
- Chronological sorting and overdue prioritizing
- Duplicate task and empty row validation

---

## 🌐 Production Build & Vercel Deployment

### 1. Build Verification

```bash
pnpm build
```

Creates an optimized standalone build with PWA service worker generation at `/sw.js`.

### 2. Deploy to Vercel

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, paste the keys from your `.env.local`.
5. Click **Deploy**. Vercel will build and deploy the Next.js PWA with automated HTTPS.

### 3. Setting Up Scheduled Reminders (Vercel Cron)

To run the scheduled reminder worker periodically, add `vercel.json` or configure a cron job to call `/api/notifications/cron` every morning (e.g. at 08:00 Asia/Bangkok):

```json
{
  "crons": [
    {
      "path": "/api/notifications/cron",
      "schedule": "0 1 * * *"
    }
  ]
}
```

---

## 📱 Installing on Mobile Devices (PWA)

- **Android / Chrome / Edge**: Click the **"Install App"** button in the sidebar, or tap the browser menu (⋮) -> **"Add to Home screen"** / **"Install app"**.
- **iOS / Safari**: Tap the **Share** button (box with upward arrow) -> scroll down and tap **"Add to Home Screen"**.

---

## 📄 License

MIT License. Built for university student productivity.
