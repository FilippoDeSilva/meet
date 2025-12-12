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
        if (action === 'raise') {
          await call.sendReaction({
            type: 'raised-hand',
            emoji_code: ':raised_hand:',
            custom: {
              timestamp: Date.now(),
              userName: localParticipant?.name || 'You',
            },
          });
        } else {
          await call.sendReaction({
            type: 'raised-hand',
            emoji_code: ':raised_hand:',
            custom: {
              clearAfterTimeout: true,
            },
          });
        }
      } catch (error) {
        console.error('Failed to broadcast raise hand reaction:', error);
      }
    },
    [call, localParticipant?.name]
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

    const userId = getCurrentUserId();
    const userName = getCurrentUserName();
    const timestamp = Date.now();

    const newHand: RaisedHand = {
      userId,
      userName,
      timestamp,
      position: 0,
    };

    setRaisedHands((prev) => {
      const updated = [...prev, newHand];
      updateRaisedHandsWithPosition(updated);
      return updated;
    });
    setIsHandRaised(true);
    await broadcastRaiseHand('raise');
  }, [isHandRaised, getCurrentUserId, getCurrentUserName, broadcastRaiseHand, updateRaisedHandsWithPosition]);

  const lowerHand = useCallback(async () => {
    const userId = getCurrentUserId();
    setRaisedHands((prev) => {
      const updated = prev.filter((hand) => hand.userId !== userId);
      updateRaisedHandsWithPosition(updated);
      return updated;
    });
    setIsHandRaised(false);
    await broadcastRaiseHand('lower');
  }, [getCurrentUserId, broadcastRaiseHand, updateRaisedHandsWithPosition]);

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
    const updateRaisedHandsFromParticipants = () => {
      const hands: RaisedHand[] = [];

      participants.forEach((participant) => {
        if (participant.reaction?.type === 'raised-hand') {
          const hand: RaisedHand = {
            userId: participant.userId,
            userName: participant.name || participant.userId,
            timestamp: participant.reaction.custom?.timestamp || Date.now(),
            position: 0,
          };
          hands.push(hand);
        }
      });

      if (hands.length > 0 || raisedHands.length > 0) {
        updateRaisedHandsWithPosition(hands);
      }
    };

    updateRaisedHandsFromParticipants();
  }, [participants, updateRaisedHandsWithPosition, raisedHands.length]);

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
