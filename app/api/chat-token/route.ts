import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - Dynamic import at runtime
import { StreamChat } from 'stream-chat';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

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

    // Initialize Stream Chat server-side
    const serverClient = StreamChat.getInstance(apiKey, secret);

    // Generate token for the user
    const token = serverClient.createToken(userId);

    return NextResponse.json({ token, apiKey });
  } catch (error) {
    console.error('Error generating chat token:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat token' },
      { status: 500 }
    );
  }
}
