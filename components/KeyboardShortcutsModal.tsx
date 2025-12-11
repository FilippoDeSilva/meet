'use client';

import { useState } from 'react';
import { X, Keyboard } from 'lucide-react';

const KeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Ctrl + D', action: 'Toggle microphone' },
    { key: 'Ctrl + E', action: 'Toggle camera' },
    { key: 'Ctrl + Shift + S', action: 'Toggle screen share' },
    { key: 'Ctrl + Shift + P', action: 'Toggle participants' },
    { key: 'Ctrl + Shift + C', action: 'Toggle chat' },
    { key: 'F', action: 'Toggle fullscreen' },
    { key: 'Ctrl + Shift + H', action: 'Raise hand' },
    { key: 'L', action: 'Toggle layout' },
    { key: '?', action: 'Show shortcuts' },
    { key: 'Escape', action: 'Leave call' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        title="Keyboard shortcuts"
      >
        <Keyboard size={20} className="text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300">{shortcut.action}</span>
                  <kbd className="px-3 py-1 bg-gray-700 text-gray-100 rounded text-sm font-mono border border-gray-600">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsModal;
