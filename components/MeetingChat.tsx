'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';

interface MeetingChatProps {
  meetingId: string;
  onClose?: () => void;
}

const MeetingChat = ({ meetingId, onClose }: MeetingChatProps) => {
  const { user } = useAuth();
  const [chatClient, setChatClient] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [components, setComponents] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    let clientInstance: any = null;

    const initializeChat = async () => {
      console.log('[Chat] Starting initialization with user:', user?.id);
      
      if (!user) {
        console.log('[Chat] No user available for chat');
        return;
      }

      try {
        console.log('[Chat] Step 1: Importing stream-chat modules...');
        // @ts-ignore - Dynamic imports at runtime
        const streamChat = await import('stream-chat');
        // @ts-ignore - Dynamic imports at runtime
        const streamChatReact = await import('stream-chat-react');
        
        console.log('[Chat] Step 2: Modules imported successfully');
        
        // Load CSS dynamically
        // @ts-ignore - CSS import at runtime
        await import('stream-chat-react/dist/css/v2/index.css');
        console.log('[Chat] Step 3: CSS loaded');

        if (!isMounted) return;

        setComponents({
          StreamChat: streamChat.StreamChat,
          Chat: streamChatReact.Chat,
          Channel: streamChatReact.Channel,
          ChannelHeader: streamChatReact.ChannelHeader,
          MessageInput: streamChatReact.MessageInput,
          MessageList: streamChatReact.MessageList,
          Window: streamChatReact.Window,
          Thread: streamChatReact.Thread,
        });
        console.log('[Chat] Step 4: Components set');

        // Get chat token from your backend
        console.log('[Chat] Step 5: Fetching chat token for user:', user.id);
        const response = await fetch('/api/chat-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, meetingId }),
        });

        console.log('[Chat] Step 6: Token response status:', response.status);
        
        if (!response.ok) {
          const error = await response.json();
          console.error('[Chat] Token error response:', error);
          throw new Error(error.error || 'Failed to get chat token');
        }

        const { token, apiKey } = await response.json();
        console.log('[Chat] Step 7: Got token and apiKey');

        if (!isMounted) return;

        // Initialize Stream Chat client - use getInstance to avoid duplicate connections
        console.log('[Chat] Step 8: Creating Stream Chat client with apiKey:', apiKey);
        clientInstance = streamChat.StreamChat.getInstance(apiKey);
        
        // Check if already connected
        if (!clientInstance.userID) {
          console.log('[Chat] Step 9: Connecting user to Stream Chat...');
          await clientInstance.connectUser(
            {
              id: user.id,
              name: user.user_metadata?.full_name || user.email || 'Anonymous',
              image: user.user_metadata?.avatar_url,
            },
            token
          );
          console.log('[Chat] Step 10: User connected to Stream Chat');
        } else {
          console.log('[Chat] Step 9-10: User already connected');
        }

        if (!isMounted) return;

        // Get channel for this meeting (server already set it up)
        console.log('[Chat] Step 11: Getting channel for meeting:', meetingId);
        const channelInstance = clientInstance.channel('messaging', `meeting-${meetingId}`);

        console.log('[Chat] Step 12: Watching channel...');
        await channelInstance.watch();
        console.log('[Chat] Step 12.5: Channel watched successfully');
        
        if (isMounted) {
          setChatClient(clientInstance);
          setChannel(channelInstance);
          setIsLoading(false);
          console.log('[Chat] Step 14: Chat initialized successfully!');
        }
      } catch (error) {
        console.error('[Chat] Error during initialization:', error);
        console.error('[Chat] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [user, meetingId]);

  if (isLoading || !chatClient || !components || !channel) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  const { Chat: ChatComponent, Channel: ChannelComponent, ChannelHeader: ChannelHeaderComponent, MessageInput: MessageInputComponent, MessageList: MessageListComponent, Window: WindowComponent, Thread: ThreadComponent } = components;

  return (
    <div className="relative h-full w-full bg-gray-900">
      <ChatComponent client={chatClient} theme="dark">
        <ChannelComponent channel={channel}>
          <WindowComponent>
            <ChannelHeaderComponent />
            <MessageListComponent />
            <MessageInputComponent />
          </WindowComponent>
          <ThreadComponent />
        </ChannelComponent>
      </ChatComponent>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default MeetingChat;
