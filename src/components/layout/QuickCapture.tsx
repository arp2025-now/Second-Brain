import { useState, useRef, useEffect } from 'react';
import { Sparkles, Link, StickyNote, Lightbulb, Loader2, Mic, Square } from 'lucide-react';
import { isUrl } from '../../lib/n8n';
import { ItemType } from '../../types';

// Type declarations for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface QuickCaptureProps {
  onCapture: (input: string, type: ItemType) => Promise<void>;
  isProcessing: boolean;
}

export function QuickCapture({ onCapture, isProcessing }: QuickCaptureProps) {
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'auto'>('auto');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognitionAPI = (window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }).SpeechRecognition || (window as Window & {
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }).webkitSpeechRecognition;

    setSpeechSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript + ' ');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden hover:border-indigo-200 transition-colors">
      {/* Input area */}
      <div className="p-4 pb-2">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... speak now" : "Paste a link, write a note, or capture an idea..."}
            rows={1}
            className={`flex-1 resize-none text-gray-900 placeholder-gray-400 focus:outline-none text-lg ${
              isListening ? 'bg-red-50 rounded-lg px-3 py-2' : ''
            }`}
            disabled={isProcessing}
          />

          {/* Voice input button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`
                flex-shrink-0 p-3 rounded-xl transition-all
                ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Voice recording indicator */}
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Recording... Click stop or press Capture when done
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="px-4 pb-4 flex items-center justify-between gap-4">
        {/* Type selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {types.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all
                ${
                  selectedType === value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold
            transition-all
            ${
              input.trim() && !isProcessing
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Processing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Capture
            </>
          )}
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-indigo-50/50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono text-xs">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono text-xs">Enter</kbd>
          {' to capture'}
          {speechSupported && (
            <span className="ml-3 text-indigo-500">
              <Mic className="w-3 h-3 inline mr-1" />
              Voice input available
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
