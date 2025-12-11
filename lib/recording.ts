import { supabase } from '@/lib/supabase';

export interface MeetingRecording {
  id: string;
  meeting_id: string;
  user_id: string;
  title?: string;
  description?: string;
  recording_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export const recordingService = {
  async createRecording(
    meetingId: string,
    recordingUrl: string,
    data?: Partial<MeetingRecording>
  ): Promise<MeetingRecording | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data: recording, error } = await supabase
      .from('meeting_recordings')
      .insert({
        meeting_id: meetingId,
        user_id: user.id,
        recording_url: recordingUrl,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return recording;
  },

  async getRecordings(): Promise<MeetingRecording[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRecordingById(id: string): Promise<MeetingRecording | null> {
    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updateRecording(
    id: string,
    updates: Partial<MeetingRecording>
  ): Promise<MeetingRecording | null> {
    const { data, error } = await supabase
      .from('meeting_recordings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRecording(id: string): Promise<void> {
    const { error } = await supabase
      .from('meeting_recordings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPublicRecordings(): Promise<MeetingRecording[]> {
    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
