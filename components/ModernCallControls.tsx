'use client';

import { CallControls } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

interface ModernCallControlsProps {
  onLeave?: () => void;
}

const ModernCallControls = ({ onLeave }: ModernCallControlsProps) => {
  const router = useRouter();

  const handleLeave = () => {
    if (onLeave) {
      onLeave();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <style>{`
        .str-video__call-controls {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          gap: 8px !important;
        }

        .str-video__call-controls button {
          width: 44px !important;
          height: 44px !important;
          border-radius: 50% !important;
          background: rgba(107, 114, 128, 0.6) !important;
          border: 2px solid rgba(107, 114, 128, 0.3) !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          padding: 0 !important;
          position: relative !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        }

        .str-video__call-controls button:hover {
          background: rgba(107, 114, 128, 0.9) !important;
          border-color: rgba(107, 114, 128, 0.6) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          transform: scale(1.05) !important;
        }

        .str-video__call-controls button:active {
          transform: scale(0.95) !important;
        }

        .str-video__call-controls button svg {
          width: 18px !important;
          height: 18px !important;
        }

        .str-video__call-controls button[data-testid="call-controls-leave-button"] {
          background: linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38)) !important;
          border-color: rgb(185, 28, 28) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-leave-button"]:hover {
          background: linear-gradient(135deg, rgb(220, 38, 38), rgb(185, 28, 28)) !important;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-mic-button"] {
          background: rgba(107, 114, 128, 0.6) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-mic-button"]:hover {
          background: rgba(107, 114, 128, 0.9) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-mic-button"].str-video__call-controls-active {
          background: linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74)) !important;
          border-color: rgb(16, 185, 129) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-camera-button"] {
          background: rgba(107, 114, 128, 0.6) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-camera-button"]:hover {
          background: rgba(107, 114, 128, 0.9) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-camera-button"].str-video__call-controls-active {
          background: linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74)) !important;
          border-color: rgb(16, 185, 129) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-screen-share-button"] {
          background: rgba(107, 114, 128, 0.6) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-screen-share-button"]:hover {
          background: rgba(107, 114, 128, 0.9) !important;
        }

        .str-video__call-controls button[data-testid="call-controls-screen-share-button"].str-video__call-controls-active {
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235)) !important;
          border-color: rgb(29, 78, 216) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
        }

        @media (max-width: 640px) {
          .str-video__call-controls button {
            width: 40px !important;
            height: 40px !important;
          }

          .str-video__call-controls button svg {
            width: 20px !important;
            height: 20px !important;
          }
        }
      `}</style>
      <CallControls onLeave={handleLeave} />
    </div>
  );
};

export default ModernCallControls;
