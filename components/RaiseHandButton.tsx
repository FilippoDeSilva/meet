'use client';

import { useState } from 'react';
import { Hand } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface RaisedHand {
  userId: string;
  userName: string;
  timestamp: number;
}

const RaiseHandButton = () => {
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const handleRaiseHand = () => {
    if (!isHandRaised) {
      const newHand: RaisedHand = {
        userId: `user-${Date.now()}`,
        userName: 'You',
        timestamp: Date.now(),
      };
      setRaisedHands([...raisedHands, newHand]);
      setIsHandRaised(true);
    } else {
      setRaisedHands(raisedHands.filter((hand) => hand.userName !== 'You'));
      setIsHandRaised(false);
    }
  };

  const handleLowerHand = (userId: string) => {
    setRaisedHands(raisedHands.filter((hand) => hand.userId !== userId));
    if (userId.includes('user-')) {
      setIsHandRaised(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={handleRaiseHand}
          className={`p-2 rounded-full transition-all duration-200 ${
            isHandRaised
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'hover:bg-gray-700 text-white'
          }`}
          title="Raise hand"
        >
          <div className="flex items-center gap-2">
            <Hand size={20} />
            {raisedHands.length > 0 && (
              <span className="text-xs font-semibold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {raisedHands.length}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      {raisedHands.length > 0 && (
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-64">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400">
            QUESTIONS ({raisedHands.length})
          </div>
          <DropdownMenuSeparator className="bg-gray-700" />
          {raisedHands.map((hand, index) => (
            <div key={hand.userId}>
              <DropdownMenuItem
                onClick={() => handleLowerHand(hand.userId)}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">{hand.userName}</span>
                </div>
                <span className="text-xs text-gray-400">Lower</span>
              </DropdownMenuItem>
              {index < raisedHands.length - 1 && (
                <DropdownMenuSeparator className="bg-gray-700" />
              )}
            </div>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default RaiseHandButton;
