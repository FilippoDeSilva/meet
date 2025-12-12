'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  raiseHand: () => Promise<void>;
  lowerHand: () => Promise<void>;
  lowerHandForUser: (userId: string) => Promise<void>;
  currentUserPosition: number | null;
}

const RaiseHandContext = createContext<RaiseHandContextType | undefined>(undefined);

export const RaiseHandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const call = useCall();
  const { useLocalParticipant, useParticipants } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();
  const eventListenerRef = useRef<((event: any) => void) | null>(null);

  const getCurrentUserId = useCallback(() => {
    return localParticipant?.userId || `user-${Date.now()}`;
  }, [localParticipant?.userId]);

  const getCurrentUserName = useCallback(() => {
    return localParticipant?.name || 'You';
  }, [localParticipant?.name]);

  const broadcastRaiseHand = useCallback(
    async (action: 'raise' | 'lower') => {
      if (!call) return;

      try {
        const eventData = {
          type: 'raise_hand_event',
          action,
          userId: getCurrentUserId(),
          userName: getCurrentUserName(),
          timestamp: Date.now(),
        };

        await call.sendCustomEvent(eventData);
      } catch (error) {
        console.error('Failed to broadcast raise hand event:', error);
      }
    },
    [call, getCurrentUserId, getCurrentUserName]
  );

  const updateRaisedHandsWithPosition = useCallback((hands: RaisedHand[]) => {
    const sortedHands = hands.sort((a, b) => a.timestamp - b.timestamp);
    const handsWithPosition = sortedHands.map((hand, index) => ({
      ...hand,
      position: index + 1,
    }));
    setRaisedHands(handsWithPosition);
  }, []);

  const raiseHand = useCallback(async () => {
    if (isHandRaised) return;

    setIsHandRaised(true);
    await broadcastRaiseHand('raise');
  }, [isHandRaised, broadcastRaiseHand]);

  const lowerHand = useCallback(async () => {
    setIsHandRaised(false);
    await broadcastRaiseHand('lower');
  }, [broadcastRaiseHand]);

  const lowerHandForUser = useCallback(
    async (userId: string) => {
      if (userId === getCurrentUserId()) {
        setIsHandRaised(false);
      }

      setRaisedHands((prev) => {
        const updated = prev.filter((hand) => hand.userId !== userId);
        updateRaisedHandsWithPosition(updated);
        return updated;
      });
    },
    [getCurrentUserId, updateRaisedHandsWithPosition]
  );

  const currentUserPosition = raisedHands.find((hand) => hand.userId === getCurrentUserId())?.position ?? null;

  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: any) => {
      if (event.type !== 'raise_hand_event') return;

      const { action, userId, userName, timestamp } = event;

      if (action === 'raise') {
        setRaisedHands((prev) => {
          const exists = prev.some((hand) => hand.userId === userId);
          if (exists) return prev;

          const newHand: RaisedHand = {
            userId,
            userName,
            timestamp,
            position: 0,
          };

          const updated = [...prev, newHand];
          const sortedHands = updated.sort((a, b) => a.timestamp - b.timestamp);
          const handsWithPosition = sortedHands.map((hand, index) => ({
            ...hand,
            position: index + 1,
          }));
          return handsWithPosition;
        });
      } else if (action === 'lower') {
        setRaisedHands((prev) => {
          const updated = prev.filter((hand) => hand.userId !== userId);
          const sortedHands = updated.sort((a, b) => a.timestamp - b.timestamp);
          const handsWithPosition = sortedHands.map((hand, index) => ({
            ...hand,
            position: index + 1,
          }));
          return handsWithPosition;
        });
      }
    };

    eventListenerRef.current = handleCustomEvent;
    call.on('custom_event' as any, handleCustomEvent);

    return () => {
      if (eventListenerRef.current) {
        call.off('custom_event' as any, eventListenerRef.current);
      }
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
