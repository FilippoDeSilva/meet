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
  const raiseHandTimestampsRef = useRef<Map<string, number>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentUserId = useCallback(() => {
    return localParticipant?.userId || `user-${Date.now()}`;
  }, [localParticipant?.userId]);

  const getCurrentUserName = useCallback(() => {
    return localParticipant?.name || 'You';
  }, [localParticipant?.name]);

  const raiseHand = useCallback(async () => {
    if (!call || isHandRaised) return;

    try {
      const timestamp = Date.now();
      const userId = getCurrentUserId();
      raiseHandTimestampsRef.current.set(userId, timestamp);
      
      await call.sendReaction({
        type: 'raised-hand',
        emoji_code: ':raised_hand:',
        custom: {
          timestamp,
          userName: getCurrentUserName(),
        },
      });
      
      setIsHandRaised(true);

      // Start refresh interval to keep reaction alive (refresh every 3 seconds)
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(async () => {
        try {
          await call.sendReaction({
            type: 'raised-hand',
            emoji_code: ':raised_hand:',
            custom: {
              timestamp,
              userName: getCurrentUserName(),
            },
          });
        } catch (error) {
          console.error('Failed to refresh raise hand reaction:', error);
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to raise hand:', error);
    }
  }, [call, isHandRaised, getCurrentUserId, getCurrentUserName]);

  const lowerHand = useCallback(async () => {
    if (!call) return;

    try {
      const userId = getCurrentUserId();
      raiseHandTimestampsRef.current.delete(userId);
      
      // Clear the refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      await call.sendReaction({
        type: 'raised-hand',
        emoji_code: ':raised_hand:',
        custom: {
          clearAfterTimeout: true,
        },
      });
      
      setIsHandRaised(false);
    } catch (error) {
      console.error('Failed to lower hand:', error);
    }
  }, [call, getCurrentUserId]);

  const lowerHandForUser = useCallback(
    async (userId: string) => {
      if (userId === getCurrentUserId()) {
        await lowerHand();
      }
    },
    [getCurrentUserId, lowerHand]
  );

  const currentUserPosition = raisedHands.find((hand) => hand.userId === getCurrentUserId())?.position ?? null;

  // Update raised hands from participants' reactions
  useEffect(() => {
    const hands: RaisedHand[] = [];

    participants.forEach((participant) => {
      if (participant.reaction?.type === 'raised-hand') {
        const timestamp = participant.reaction.custom?.timestamp || Date.now();
        hands.push({
          userId: participant.userId,
          userName: participant.name || participant.userId,
          timestamp,
          position: 0,
        });
      }
    });

    // Sort by timestamp and assign positions
    const sortedHands = hands.sort((a, b) => a.timestamp - b.timestamp);
    const handsWithPosition = sortedHands.map((hand, index) => ({
      ...hand,
      position: index + 1,
    }));

    setRaisedHands(handsWithPosition);

    // Update isHandRaised based on current user's reaction
    const currentUserHasRaisedHand = handsWithPosition.some(
      (hand) => hand.userId === getCurrentUserId()
    );
    setIsHandRaised(currentUserHasRaisedHand);
  }, [participants, getCurrentUserId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

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
