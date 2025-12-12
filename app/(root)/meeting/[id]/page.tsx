'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { RaiseHandProvider } from '@/contexts/RaiseHandContext';

const MeetingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-up');
    }
  }, [isLoading, user, router]);

  if (isLoading || isCallLoading) return <Loader />;

  if (!user) return null;

  if (!call) return (
    <p className="text-center text-3xl font-bold text-white">
      Call Not Found
    </p>
  );

  // get more info about custom call type:  https://getstream.io/video/docs/react/guides/configuring-call-types/
  const notAllowed = call.type === 'invited' && !call.state.members.find((m) => m.user.id === user.id);

  if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          <RaiseHandProvider>
            {!isSetupComplete ? (
              <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
            ) : (
              <MeetingRoom />
            )}
          </RaiseHandProvider>
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
