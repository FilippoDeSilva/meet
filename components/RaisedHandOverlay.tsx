'use client';

import React from 'react';
import { Hand } from 'lucide-react';
import { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { useRaiseHand } from '@/contexts/RaiseHandContext';

interface RaisedHandOverlayProps {
  participant: StreamVideoParticipant;
}

const RaisedHandOverlay: React.FC<RaisedHandOverlayProps> = ({ participant }) => {
  const { raisedHands } = useRaiseHand();
  const raisedHand = raisedHands.find((hand) => hand.userId === participant.userId);

  if (!raisedHand) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-4 z-20">
      <div className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full shadow-lg animate-bounce">
        <Hand size={20} className="font-bold flex-shrink-0" />
        <span className="text-sm font-bold whitespace-nowrap">Hand raised #{raisedHand.position}</span>
      </div>
    </div>
  );
};

export default RaisedHandOverlay;
