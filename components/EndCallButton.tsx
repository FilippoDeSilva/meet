'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    router.push('/');
  };

  return (
    <button
      onClick={endCall}
      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      End call for everyone
    </button>
  );
};

export default EndCallButton;
