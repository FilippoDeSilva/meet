'use client';

import React from 'react';
import { Hand } from 'lucide-react';
import { useRaiseHand } from '@/contexts/RaiseHandContext';

interface ParticipantWithRaisedHandProps {
  userId: string;
  userName: string;
  children: React.ReactNode;
}

const ParticipantWithRaisedHand: React.FC<ParticipantWithRaisedHandProps> = ({
  userId,
  userName,
  children,
}) => {
  const { raisedHands } = useRaiseHand();
  const raisedHand = raisedHands.find((hand) => hand.userId === userId);

  return (
    <div className="relative w-full h-full">
      {children}
      {raisedHand && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-gray-900 px-2 py-1 rounded-full shadow-lg z-10">
          <Hand size={16} className="font-bold" />
          <span className="text-xs font-bold">#{raisedHand.position}</span>
        </div>
      )}
    </div>
  );
};

export default ParticipantWithRaisedHand;
