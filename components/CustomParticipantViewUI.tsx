'use client';

import React from 'react';
import { Hand } from 'lucide-react';
import { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { useRaiseHand } from '@/contexts/RaiseHandContext';

interface CustomParticipantViewUIProps {
  participant: StreamVideoParticipant;
  children: React.ReactNode;
}

const CustomParticipantViewUI: React.FC<CustomParticipantViewUIProps> = ({
  participant,
  children,
}) => {
  const { raisedHands } = useRaiseHand();
  const raisedHand = raisedHands.find((hand) => hand.userId === participant.userId);

  return (
    <div className="relative w-full h-full">
      {children}
      {raisedHand && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-4">
          <div className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-3 py-2 rounded-full shadow-lg animate-pulse">
            <Hand size={18} className="font-bold" />
            <span className="text-sm font-bold">Hand raised (#{raisedHand.position})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomParticipantViewUI;
