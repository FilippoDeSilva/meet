'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ShareableMeetingLinkProps {
  meetingId: string;
}

const ShareableMeetingLink = ({ meetingId }: ShareableMeetingLinkProps) => {
  const [copied, setCopied] = useState(false);

  const meetingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${meetingId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-dark-2 p-4">
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-400 mb-1">MEETING LINK</p>
        <p className="text-sm text-white truncate font-mono">{meetingUrl}</p>
      </div>
      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-semibold transition-all duration-200 ${
          copied
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {copied ? (
          <>
            <Check size={16} />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ShareableMeetingLink;
