'use client';

import React, { useEffect, useRef } from 'react';
import { SpeakerLayout, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useRaiseHand } from '@/contexts/RaiseHandContext';

interface CustomSpeakerLayoutProps {
  participantsBarPosition?: 'left' | 'right';
}

const CustomSpeakerLayout: React.FC<CustomSpeakerLayoutProps> = ({
  participantsBarPosition = 'right',
}) => {
  const { raisedHands } = useRaiseHand();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    const updateRaisedHandBadges = () => {
      const allContainers = Array.from(document.querySelectorAll('[class*="participant"]'));
      const videoContainers = Array.from(document.querySelectorAll('[data-testid*="participant"]'));

      participants.forEach((participant) => {
        const participantName = participant.name || participant.userId;
        
        // Check if participant has a raised-hand reaction
        const hasRaisedHand = participant.reaction?.type === 'raised-hand';
        const raisedHand = hasRaisedHand
          ? raisedHands.find((hand) => hand.userId === participant.userId)
          : null;

        let containerFound: HTMLElement | null = null;

        // First try to find in video containers
        for (const container of videoContainers) {
          const htmlContainer = container as HTMLElement;
          const nameElement = htmlContainer.querySelector('[data-testid*="participant-name"]');
          const nameText = nameElement?.textContent?.trim() || '';
          const fullText = htmlContainer.textContent?.trim() || '';

          if (
            nameText === participantName ||
            nameText === participant.userId ||
            fullText.includes(participantName) ||
            fullText.includes(participant.userId)
          ) {
            containerFound = htmlContainer;
            break;
          }
        }

        // If not found, try general participant containers
        if (!containerFound) {
          for (const container of allContainers) {
            const htmlContainer = container as HTMLElement;
            const nameElement = htmlContainer.querySelector('[data-testid*="participant-name"]');
            const nameText = nameElement?.textContent?.trim() || '';
            const fullText = htmlContainer.textContent?.trim() || '';

            if (
              nameText === participantName ||
              nameText === participant.userId ||
              fullText.includes(participantName) ||
              fullText.includes(participant.userId)
            ) {
              containerFound = htmlContainer;
              break;
            }
          }
        }

        if (containerFound) {
          let badge = containerFound.querySelector('[data-raised-hand-badge]') as HTMLElement;

          if (raisedHand && hasRaisedHand) {
            if (!badge) {
              badge = document.createElement('div');
              badge.setAttribute('data-raised-hand-badge', 'true');
              badge.className = 'absolute top-3 right-3 bg-gray-800 text-yellow-400 px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 z-20 font-semibold text-sm border border-yellow-400/30 hover:bg-gray-700 transition-all duration-200';
              badge.innerHTML = `<span style="font-size: 16px;">✋</span><span>#${raisedHand.position}</span>`;
              if (containerFound.style.position !== 'absolute' && containerFound.style.position !== 'relative') {
                containerFound.style.position = 'relative';
              }
              containerFound.appendChild(badge);
            } else {
              badge.innerHTML = `<span style="font-size: 16px;">✋</span><span>#${raisedHand.position}</span>`;
            }
          } else if (badge) {
            badge.remove();
          }
        }
      });
    };

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(updateRaisedHandBadges, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [raisedHands, participants]);

  return <SpeakerLayout participantsBarPosition={participantsBarPosition} />;
};

export default CustomSpeakerLayout;
