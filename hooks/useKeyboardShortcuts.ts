'use client';

import { useEffect } from 'react';

interface ShortcutsConfig {
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  onToggleScreenShare?: () => void;
  onToggleParticipants?: () => void;
  onToggleChat?: () => void;
  onToggleFullscreen?: () => void;
  onRaiseHand?: () => void;
  onLeaveCall?: () => void;
  onToggleLayout?: () => void;
  onShowShortcuts?: () => void;
}

export const useKeyboardShortcuts = (config: ShortcutsConfig) => {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + D: Toggle microphone
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        config.onToggleMic?.();
      }

      // Ctrl/Cmd + E: Toggle camera
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        config.onToggleCamera?.();
      }

      // Ctrl/Cmd + Shift + S: Toggle screen share
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        config.onToggleScreenShare?.();
      }

      // Ctrl/Cmd + Shift + P: Toggle participants
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        config.onToggleParticipants?.();
      }

      // Ctrl/Cmd + Shift + C: Toggle chat
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        config.onToggleChat?.();
      }

      // F: Toggle fullscreen
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        config.onToggleFullscreen?.();
      }

      // Ctrl/Cmd + Shift + H: Raise hand
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        config.onRaiseHand?.();
      }

      // L: Toggle layout
      if (event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        config.onToggleLayout?.();
      }

      // ?: Show shortcuts
      if (event.key === '?') {
        event.preventDefault();
        config.onShowShortcuts?.();
      }

      // Escape: Leave call
      if (event.key === 'Escape') {
        event.preventDefault();
        config.onLeaveCall?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);
};
