'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

export interface RaisedHand {
  userId: string;
  userName: string;
  timestamp: number;
  position: number;
}

interface RaiseHandContextType {
  raisedHands: RaisedHand[];
  isHandRaised: boolean;
  raiseHand: () => void;
  lowerHand: () => void;
  lowerHandForUser: (userId: string) => void;
  currentUserPosition: number | null;
}

const RaiseHandContext = createContext<RaiseHandContextType | undefined>(undefined);

export const RaiseHandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const call = useCall();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const getCurrentUserId = useCallback(() => {
    return localParticipant?.userId || `user-${Date.now()}`;
  }, [localParticipant?.userId]);

  const getCurrentUserName = useCallback(() => {
    return localParticipant?.name || 'You';
  }, [localParticipant?.name]);

  const broadcastRaiseHand = useCallback(
    (action: 'raise' | 'lower', userId: string, userName: string) => {
      if (!call) return;

      try {
        const eventData = {
          type: 'raise_hand',
          action,
          userId,
          userName,
          timestamp: Date.now(),
        };

        call.sendCustomEvent(eventData);
      } catch (error) {
        console.error('Failed to broadcast raise hand event:', error);
      }
    },
    [call]
  );

  const raiseHand = useCallback(() => {
    if (isHandRaised) return;

    const userId = getCurrentUserId();
    const userName = getCurrentUserName();
    const timestamp = Date.now();
    const position = raisedHands.length + 1;

    const newHand: RaisedHand = {
      userId,
      userName,
      timestamp,
      position,
    };

    setRaisedHands((prev) => [...prev, newHand]);
    setIsHandRaised(true);

    broadcastRaiseHand('raise', userId, userName);
  }, [isHandRaised, raisedHands.length, getCurrentUserId, getCurrentUserName, broadcastRaiseHand]);

  const lowerHand = useCallback(() => {
    const userId = getCurrentUserId();
    setRaisedHands((prev) => prev.filter((hand) => hand.userId !== userId));
    setIsHandRaised(false);

    broadcastRaiseHand('lower', userId, getCurrentUserName());
  }, [getCurrentUserId, getCurrentUserName, broadcastRaiseHand]);

  const lowerHandForUser = useCallback(
    (userId: string) => {
      setRaisedHands((prev) => prev.filter((hand) => hand.userId !== userId));

      if (userId === getCurrentUserId()) {
        setIsHandRaised(false);
      }

      broadcastRaiseHand('lower', userId, '');
    },
    [getCurrentUserId, broadcastRaiseHand]
  );

  const currentUserPosition = raisedHands.find((hand) => hand.userId === getCurrentUserId())?.position ?? null;

  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: any) => {
      if (event.type !== 'raise_hand') return;

      const { action, userId, userName, timestamp } = event;

      if (action === 'raise') {
        setRaisedHands((prev) => {
          const exists = prev.some((hand) => hand.userId === userId);
          if (exists) return prev;

          const position = prev.length + 1;
          return [
            ...prev,
            {
              userId,
              userName,
              timestamp,
              position,
            },
          ];
        });
      } else if (action === 'lower') {
        setRaisedHands((prev) => prev.filter((hand) => hand.userId !== userId));
      }
    };

    call.on('custom_event' as any, handleCustomEvent);

    return () => {
      call.off('custom_event' as any, handleCustomEvent);
    };
  }, [call]);

  return (
    <RaiseHandContext.Provider
      value={{
        raisedHands,
        isHandRaised,
        raiseHand,
        lowerHand,
        lowerHandForUser,
        currentUserPosition,
      }}
    >
      {children}
    </RaiseHandContext.Provider>
  );
};

export const useRaiseHand = () => {
  const context = useContext(RaiseHandContext);
  if (!context) {
    throw new Error('useRaiseHand must be used within RaiseHandProvider');
  }
  return context;
};
