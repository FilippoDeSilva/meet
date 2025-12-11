'use client';

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

  return <CallControls onLeave={handleLeave} />;
};

export default CallControlsWrapper;
