'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useAuth } from '@/hooks/useAuth';

import { tokenProvider } from '@/actions/stream.actions';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.id) return;
    if (!API_KEY) {
      console.error('Stream API key is missing');
      return;
    }

    const userId = user.id;
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: userId,
        name: user.email || userId,
      },
      tokenProvider: async () => tokenProvider(userId),
    });

    setVideoClient(client);
  }, [user?.id]);

  // Render children even if Stream client is not ready yet
  // The Stream components will handle the loading state internally
  if (videoClient) {
    return <StreamVideo client={videoClient}>{children}</StreamVideo>;
  }

  return <>{children}</>;
};

export default StreamVideoProvider;
