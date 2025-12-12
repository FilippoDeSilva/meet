'use client';

import { useState } from 'react';
import { useStreamRecordings } from '@/hooks/useStreamRecordings';
import Loader from './Loader';
import { Play, Copy, Check, Download, Trash2, RefreshCw, Film, Clock } from 'lucide-react';
import { useToast } from './ui/use-toast';

const StreamRecordingsList = () => {
  const { recordings, isLoading, error, deleteRecording, refreshRecordings } = useStreamRecordings();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyLink = async (url: string, recordingId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(recordingId);
      toast({ title: 'Link copied to clipboard' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({ title: 'Failed to copy link' });
    }
  };

  const handleDeleteRecording = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;

    try {
      setDeletingId(filename);
      await deleteRecording(filename);
      toast({ title: 'Recording deleted', description: 'Recording has been removed from your list' });
    } catch (err) {
      console.error('Failed to delete recording:', err);
      toast({ title: 'Failed to delete recording', description: 'Please try again' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshRecordings();
      toast({ title: 'Recordings refreshed' });
    } catch (err) {
      console.error('Failed to refresh recordings:', err);
      toast({ title: 'Failed to refresh recordings' });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-md text-center">
          <Film size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-400 text-lg mb-6">Error loading recordings</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto font-medium"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with stats and refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Recordings</h2>
          <p className="text-gray-400">
            {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'} saved
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {!recordings || recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-12 max-w-md text-center">
            <Film size={64} className="mx-auto mb-6 text-blue-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No recordings yet</h3>
            <p className="text-gray-400">
              Start a meeting and enable recording to see your recordings here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording) => {
            const recordingDate = new Date(recording.start_time);
            const isHovered = hoveredId === recording.filename;

            return (
              <div
                key={recording.filename}
                onMouseEnter={() => setHoveredId(recording.filename)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative bg-gradient-to-br from-dark-2 to-dark-3 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Thumbnail with overlay */}
                <div className="relative w-full h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Play size={56} className="text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Hover play button */}
                  {isHovered && (
                    <a
                      href={recording.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    >
                      <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 transition-colors">
                        <Play size={32} className="fill-current" />
                      </div>
                    </a>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-white font-semibold text-lg truncate mb-3 group-hover:text-blue-400 transition-colors">
                    {recording.filename || 'Recording'}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock size={14} className="text-blue-400" />
                      <span>{recordingDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Film size={14} className="text-purple-400" />
                      <span>{recordingDate.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <a
                      href={recording.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      <Play size={16} />
                      <span className="hidden sm:inline">Play</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink(recording.url, recording.filename)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        copiedId === recording.filename
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                      }`}
                      title="Copy link"
                    >
                      {copiedId === recording.filename ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>

                    <a
                      href={recording.url}
                      download
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
                      title="Download recording"
                    >
                      <Download size={16} />
                    </a>

                    <button
                      onClick={() => handleDeleteRecording(recording.filename)}
                      disabled={deletingId === recording.filename}
                      className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete recording"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 pointer-events-none transition-all duration-300" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StreamRecordingsList;
