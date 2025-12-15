'use client';

import { useEffect } from 'react';
import { CallControls } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

interface CallControlsWrapperProps {
  onLeave?: () => void;
}

const CallControlsWrapper = ({ onLeave }: CallControlsWrapperProps) => {
  const router = useRouter();

  const handleLeave = () => {
    if (onLeave) {
      onLeave();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    // Add CSS for reaction animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes reactionFloat {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-200px) scale(1.2);
        }
      }

      .reaction-animation {
        animation: reactionFloat 1s ease-out forwards;
        pointer-events: none;
        position: fixed;
        font-size: 2rem;
        z-index: 1000;
      }

      /* Hide the raised hand reaction button (✋) */
      .str-video__reactions-menu__button {
        position: relative;
      }

      .str-video__reactions-menu__button:has-text("✋") {
        display: none !important;
      }

      /* Add more reactions dynamically */
      .str-video__reactions-menu {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
      }
    `;
    document.head.appendChild(style);

    // Hide the raised hand reaction button (✋)
    const hideRaisedHandButton = () => {
      const buttons = document.querySelectorAll('.str-video__reactions-menu__button');
      buttons.forEach((button) => {
        if (button.textContent?.includes('✋')) {
          (button as HTMLElement).style.display = 'none';
        }
      });
    };

    // Add click handler to animate reactions
    const addReactionAnimation = () => {
      const buttons = document.querySelectorAll('.str-video__reactions-menu__button');
      buttons.forEach((button) => {
        if (!button.textContent?.includes('✋')) {
          const handleClick = (e: Event) => {
            const emoji = button.textContent;
            const rect = (button as HTMLElement).getBoundingClientRect();
            const reaction = document.createElement('div');
            reaction.className = 'reaction-animation';
            reaction.textContent = emoji;
            reaction.style.left = rect.left + rect.width / 2 - 16 + 'px';
            reaction.style.top = rect.top + 'px';
            document.body.appendChild(reaction);
            setTimeout(() => reaction.remove(), 1000);
          };
          button.addEventListener('click', handleClick);
        }
      });
    };

    // Run on mount and when reactions menu appears
    hideRaisedHandButton();
    addReactionAnimation();
    
    // Watch for DOM changes to hide the button and add animations if it appears later
    const observer = new MutationObserver(() => {
      hideRaisedHandButton();
      addReactionAnimation();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      style.remove();
    };
  }, []);

  return <CallControls onLeave={handleLeave} />;
};

export default CallControlsWrapper;
