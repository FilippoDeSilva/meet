import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { recordingService } from '@/lib/recording';

export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabaseServer.auth.admin.getUserById(
      request.headers.get('x-user-id') || ''
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseServer
      .from('meeting_recordings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabaseServer.auth.admin.getUserById(
      request.headers.get('x-user-id') || ''
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { meeting_id, recording_url, title, description } = body;

    if (!meeting_id || !recording_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('meeting_recordings')
      .insert({
        meeting_id,
        user_id: user.id,
        recording_url,
        title,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating recording:', error);
    return NextResponse.json(
      { error: 'Failed to create recording' },
      { status: 500 }
    );
  }
}
