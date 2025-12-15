import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - Dynamic import at runtime
import { StreamChat } from 'stream-chat';

export async function POST(req: NextRequest) {
  try {
    const { userId, meetingId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const secret = process.env.STREAM_SECRET_KEY;

    if (!apiKey || !secret) {
      console.error('Missing Stream credentials:', {
        apiKey: !!apiKey,
        secret: !!secret,
      });
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize Stream Chat server-side with admin privileges
    const serverClient = StreamChat.getInstance(apiKey, secret);

    // Generate token for the user
    const token = serverClient.createToken(userId);

    // If meetingId is provided, set up the channel server-side
    if (meetingId) {
      try {
        const channelId = `meeting-${meetingId}`;
        console.log('[Chat API] Setting up channel:', channelId, 'for user:', userId);

        // Create or get the channel with server-side admin privileges
        const channel = serverClient.channel('messaging', channelId, {
          members: [userId],
        });

        // Create the channel (or update if exists)
        await channel.create();
        console.log('[Chat API] Channel created/updated:', channelId);

        // Add user as a member with admin privileges
        await channel.addMembers([userId]);
        console.log('[Chat API] User added to channel:', userId);
      } catch (err: any) {
        // Log but don't fail - channel might already exist
        console.log('[Chat API] Channel setup note:', err?.message);
      }
    }

    return NextResponse.json({ token, apiKey });
  } catch (error) {
    console.error('Error generating chat token:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat token' },
      { status: 500 }
    );
  }
}
