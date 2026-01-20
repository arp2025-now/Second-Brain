import { useState, useRef, useEffect } from 'react';
import { Sparkles, Link, StickyNote, Lightbulb, Send, Loader2 } from 'lucide-react';
import { isUrl } from '../../lib/n8n';
import { ItemType } from '../../types';

interface QuickCaptureProps {
  onCapture: (input: string, type: ItemType) => Promise<void>;
  isProcessing: boolean;
}

export function QuickCapture({ onCapture, isProcessing }: QuickCaptureProps) {
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'auto'>('auto');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    let type: ItemType = selectedType === 'auto' ? 'note' : selectedType;

    // Auto-detect if input is a URL
    if (selectedType === 'auto' && isUrl(input.trim())) {
      type = 'link';
    }

    await onCapture(input.trim(), type);
    setInput('');
    setSelectedType('auto');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const types = [
    { value: 'auto', label: 'Auto', icon: Sparkles },
    { value: 'link', label: 'Link', icon: Link },
    { value: 'note', label: 'Note', icon: StickyNote },
    { value: 'idea', label: 'Idea', icon: Lightbulb },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Input area */}
      <div className="p-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste a link, write a note, or capture an idea..."
          rows={1}
          className="w-full resize-none text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
          disabled={isProcessing}
        />
      </div>

      {/* Actions bar */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Type selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {types.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                transition-colors
                ${
                  selectedType === value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-colors
            ${
              input.trim() && !isProcessing
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Capture
            </>
          )}
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Ctrl</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Enter</kbd> to quickly capture
        </p>
      </div>
    </div>
  );
}
