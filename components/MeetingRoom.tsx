'use client';
import { useState, useEffect, useRef } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Users, LayoutList, Maximize2, Minimize2, Settings, Copy, Check, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import RaiseHandButton from './RaiseHandButton';
import CallControlsWrapper from './CallControlsWrapper';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CustomSpeakerLayout from './CustomSpeakerLayout';
import CustomGridLayout from './CustomGridLayout';
import dynamic from 'next/dynamic';

const MeetingChat = dynamic(() => import('./MeetingChat'), { ssr: false });

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const { user } = useAuth();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const countedMessageIdsRef = useRef<Set<string>>(new Set());
  const { useCallCallingState, useCallEndedAt } = useCallStateHooks();
  const call = useCall();
  const callEndedAt = useCallEndedAt();

  const callingState = useCallCallingState();
  const meetingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const meetingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${meetingId}`;

  // Hard refresh when call ends to trigger state update
  useEffect(() => {
    if (callEndedAt) {
      // Use a small delay to ensure the state is properly updated before refresh
      const timer = setTimeout(() => {
        window.location.reload();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [callEndedAt]);

  // Initialize Stream Chat client and listen for messages globally (even when chat is closed)
  useEffect(() => {
    let isMounted = true;
    let clientInstance: any = null;
    let channelInstance: any = null;
    let unsubscribe: (() => void) | null = null;

    const initializeGlobalChatListener = async () => {
      if (!user) {
        console.log('[Global Chat] No user available');
        return;
      }

      try {
        console.log('[Global Chat] Initializing global message listener');
        // @ts-ignore - Dynamic imports at runtime
        const streamChat = await import('stream-chat');

        // Get chat token from backend
        const response = await fetch('/api/chat-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, meetingId }),
        });

        if (!response.ok) {
          console.error('[Global Chat] Failed to get token');
          return;
        }

        const { token, apiKey } = await response.json();

        if (!isMounted) return;

        // Initialize Stream Chat client
        clientInstance = streamChat.StreamChat.getInstance(apiKey);

        // Check if already connected
        if (!clientInstance.userID) {
          await clientInstance.connectUser(
            {
              id: user.id,
              name: user.user_metadata?.full_name || user.email || 'Anonymous',
              image: user.user_metadata?.avatar_url,
            },
            token
          );
          console.log('[Global Chat] User connected');
        }

        if (!isMounted) return;

        // Get channel
        channelInstance = clientInstance.channel('messaging', `meeting-${meetingId}`);
        await channelInstance.watch();
        console.log('[Global Chat] Channel watched');

        // Count initial unseen messages
        const messages = channelInstance.state?.messages || [];
        messages.forEach((msg: any) => {
          const messageId = msg.id;
          const messageSender = msg.user?.id;

          if (messageId && messageSender !== user.id && !countedMessageIdsRef.current.has(messageId)) {
            countedMessageIdsRef.current.add(messageId);
          }
        });

        const initialCount = countedMessageIdsRef.current.size;
        if (isMounted) {
          setUnreadChatCount(initialCount);
          console.log('[Global Chat] Initial unread count:', initialCount);
        }

        // Listen for new messages
        const handleNewMessage = (event: any) => {
          if (!isMounted) return;
          
          const message = event.message;
          const messageId = message?.id;
          const messageSender = message?.user?.id;

          if (messageId && messageSender !== user.id && !countedMessageIdsRef.current.has(messageId)) {
            countedMessageIdsRef.current.add(messageId);
            setUnreadChatCount(countedMessageIdsRef.current.size);
            console.log('[Global Chat] New message - Total unread:', countedMessageIdsRef.current.size);
          }
        };

        channelInstance.on('message.new', handleNewMessage);

        unsubscribe = () => {
          if (channelInstance) {
            channelInstance.off('message.new', handleNewMessage);
          }
        };
      } catch (error) {
        console.error('[Global Chat] Error:', error);
      }
    };

    initializeGlobalChatListener();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, meetingId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (!isFullscreen) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const toggleLayout = () => {
    const layouts: CallLayoutType[] = ['grid', 'speaker-left', 'speaker-right'];
    const currentIndex = layouts.indexOf(layout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    setLayout(layouts[nextIndex]);
  };

  const openShortcuts = () => {
    const shortcutsBtn = document.querySelector('[title="Keyboard shortcuts"]') as HTMLButtonElement;
    shortcutsBtn?.click();
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onToggleMic: () => call?.microphone.toggle(),
    onToggleCamera: () => call?.camera.toggle(),
    onToggleScreenShare: () => call?.screenShare.toggle(),
    onToggleParticipants: () => setShowParticipants((prev) => !prev),
    onToggleFullscreen: () => handleFullscreen(),
    onRaiseHand: () => {
      const raiseHandBtn = document.querySelector('[title="Raise hand"]') as HTMLButtonElement;
      raiseHandBtn?.click();
    },
    onToggleLayout: () => toggleLayout(),
    onShowShortcuts: () => openShortcuts(),
    onLeaveCall: () => router.push('/'),
  });

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <CustomGridLayout />;
      case 'speaker-right':
        return <CustomSpeakerLayout participantsBarPosition="left" />;
      default:
        return <CustomSpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full bg-gray-900 overflow-hidden text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Meeting</h1>
          <div className="h-6 w-px bg-gray-600" />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            title="Copy meeting link"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span className="hidden sm:inline">Copy link</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <KeyboardShortcutsModal />
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Settings">
            <Settings size={20} />
          </button>
          <button
            onClick={() => {
              setShowChat(!showChat);
              if (!showChat) {
                setUnreadChatCount(0);
              }
            }}
            className={`relative p-2 rounded-full transition-colors ${showChat ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-700'}`}
            title="Chat"
          >
            <MessageCircle size={20} />
            {unreadChatCount > 0 && !showChat && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Participants"
          >
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex w-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <CallLayout />
        </div>
        
        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 max-w-full sm:w-80 md:w-96 lg:w-96 bg-gray-800 border-l border-gray-700 overflow-hidden flex flex-col">
            <MeetingChat 
              meetingId={meetingId} 
              onClose={() => setShowChat(false)}
              countedMessageIds={countedMessageIdsRef.current}
            />
          </div>
        )}

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold text-lg">Participants</h2>
            </div>
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}
      </div>

      {/* Control Bar - Google Meet Style */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {/* Microphone, Camera, Screen Share from CallControls */}
          <CallControlsWrapper onLeave={() => router.push(`/`)} />

          {/* Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Layout">
              <LayoutList size={18} className="text-white sm:w-5 sm:h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                    className="hover:bg-gray-700 cursor-pointer text-sm"
                  >
                    {item}
                  </DropdownMenuItem>
                  {index < 2 && <DropdownMenuSeparator className="bg-gray-700" />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 size={18} className="text-white sm:w-5 sm:h-5" />
            ) : (
              <Maximize2 size={18} className="text-white sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Raise Hand Button */}
          <RaiseHandButton />

          {/* Call Stats - Hidden on mobile */}
          <div className="hidden md:block">
            <CallStatsButton />
          </div>

          {/* End Call Button */}
          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
