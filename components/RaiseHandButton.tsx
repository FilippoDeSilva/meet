'use client';

import { Hand } from 'lucide-react';
import { useRaiseHand } from '@/contexts/RaiseHandContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const RaiseHandButton = () => {
  const { raisedHands, isHandRaised, raiseHand, lowerHand, lowerHandForUser, currentUserPosition } = useRaiseHand();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={isHandRaised ? lowerHand : raiseHand}
          className={`p-2 rounded-full transition-all duration-200 relative ${
            isHandRaised
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'hover:bg-gray-700 text-white'
          }`}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <div className="flex items-center gap-2">
            <Hand size={20} />
            {raisedHands.length > 0 && (
              <span className="text-xs font-semibold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {raisedHands.length}
              </span>
            )}
            {isHandRaised && currentUserPosition && (
              <span className="text-xs font-bold bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center">
                {currentUserPosition}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      {raisedHands.length > 0 && (
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-72">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400">
            RAISED HANDS ({raisedHands.length})
          </div>
          <DropdownMenuSeparator className="bg-gray-700" />
          {raisedHands.map((hand, index) => (
            <div key={hand.userId}>
              <DropdownMenuItem
                onClick={() => lowerHandForUser(hand.userId)}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-700 px-3 py-2"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-gray-900 text-xs font-bold">
                    {hand.position}
                  </div>
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
