import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TaskCreateInput } from '@/types/task';

export async function POST(request: Request) {
  try {
    const { tasks }: { tasks: TaskCreateInput[] } = await request.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided for import' }, { status: 400 });
    }

    // Filter valid tasks
    const validTasks = tasks
      .filter((t) => t.title && t.title.trim())
      .map((t) => ({
        title: t.title.trim(),
        subject: t.subject?.trim() || null,
        description: t.description?.trim() || null,
        deadline: t.deadline || null,
        priority: t.priority || 'Medium',
        status: t.status || 'Pending',
        external_url: t.external_url?.trim() || null,
      }));

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: true,
          imported: validTasks.length,
          data: validTasks,
          message: 'Saved to local storage on client',
        },
        { status: 201 }
      );
    }

    const { data, error } = await supabase.from('tasks').insert(validTasks).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        imported: data.length,
        data,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during import';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
