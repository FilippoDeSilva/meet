import StreamRecordingsList from '@/components/StreamRecordingsList';

const RecordingsPage = () => {
  return (
    <section className="flex size-full flex-col gap-6 text-white">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Recordings
        </h1>
        <p className="text-gray-400">Manage and view all your meeting recordings</p>
      </div>

      <StreamRecordingsList />
    </section>
  );
};

export default RecordingsPage;
