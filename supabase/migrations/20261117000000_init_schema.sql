-- TaskFlow Supabase Schema Migration
-- Database schema for personal task manager with PWA & FCM notifications

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL,
    title TEXT NOT NULL,
    subject TEXT,
    description TEXT,
    deadline TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    external_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for optimal task querying and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_deadline_status ON public.tasks (deadline ASC, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks (priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at DESC);

-- 2. Notification Tokens Table
CREATE TABLE IF NOT EXISTS public.notification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id ON public.notification_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_token ON public.notification_tokens (token);

-- 3. Notification Logs Table (to prevent duplicate reminders)
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID DEFAULT NULL,
    reminder_type TEXT NOT NULL, -- e.g. 'overdue', 'due_today', '48h', '24h'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_task_reminder ON public.notification_logs (task_id, reminder_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tokens_updated_at ON public.notification_tokens;
CREATE TRIGGER trigger_tokens_updated_at
    BEFORE UPDATE ON public.notification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Default permissive policy for single-user/development when auth is optional:
-- (Allows full access if user_id is null or matches auth.uid())
CREATE POLICY "Allow select for public or authenticated user"
    ON public.tasks FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Allow insert for public or authenticated user"
    ON public.tasks FOR INSERT
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Allow update for public or authenticated user"
    ON public.tasks FOR UPDATE
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Allow delete for public or authenticated user"
    ON public.tasks FOR DELETE
    USING (user_id IS NULL OR user_id = auth.uid());

-- Token policies
CREATE POLICY "Allow token management"
    ON public.notification_tokens FOR ALL
    USING (user_id IS NULL OR user_id = auth.uid());

-- Log policies
CREATE POLICY "Allow log access"
    ON public.notification_logs FOR ALL
    USING (user_id IS NULL OR user_id = auth.uid());
