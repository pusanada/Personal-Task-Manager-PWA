import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TaskCreateInput } from '@/types/task';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { data: [], message: 'Supabase server not configured, running in local-first mode' },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: TaskCreateInput = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { message: 'Task received, local storage used on client', data: body },
        { status: 201 }
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: body.title.trim(),
          subject: body.subject?.trim() || null,
          description: body.description?.trim() || null,
          deadline: body.deadline || null,
          priority: body.priority || 'Medium',
          status: body.status || 'Pending',
          external_url: body.external_url?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
