import { useMemo, useRef, useState } from 'react';
import { HiChatAlt2, HiPaperAirplane, HiX, HiMicrophone, HiStop, HiVolumeUp } from 'react-icons/hi';
import { listingsAPI } from '../../services/api';

const ListingAIAssistant = ({ listingId }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [lastAudioSrc, setLastAudioSrc] = useState('');
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi, I can help with this listing only. Ask about quantity, expiry, donor contact, or pickup details.',
    },
  ]);

  const canSend = useMemo(() => message.trim().length > 0 && !sending, [message, sending]);

  const playAudio = async (audioBase64, mimeType = 'audio/mpeg') => {
    if (!audioBase64 || !audioPlayerRef.current) {
      setAudioUnavailable(true);
      return;
    }

    const src = `data:${mimeType};base64,${audioBase64}`;
    setLastAudioSrc(src);
    setAudioBlocked(false);
    setAudioUnavailable(false);

    try {
      audioPlayerRef.current.src = src;
      audioPlayerRef.current.load();
      await audioPlayerRef.current.play();
    } catch (error) {
      console.log('Audio autoplay blocked:', error?.message || error);
      setAudioBlocked(true);
    }
  };

  const sendMessage = async (incomingText) => {
    const userText = (incomingText ?? message).trim();
    if (!userText || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setMessage('');
    setSending(true);

    try {
      const res = await listingsAPI.askChatbot(listingId, {
        message: userText,
        preferredLanguage: language,
        includeAudio: true,
      });
      const reply = res?.data?.reply || 'I can only help with questions about this current listing.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      await playAudio(res?.data?.audioBase64, res?.data?.audioMimeType || 'audio/mpeg');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err.message || 'I can only help with questions about this current listing.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Voice input is not supported in this browser. Please use Chrome or type your message.',
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Spanish' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (!transcript.trim()) return;
      setMessage(transcript);
      sendMessage(transcript);
    };

    recognition.start();
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors from browser recognition lifecycle.
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-surface-200 bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 bg-surface-50">
            <div>
              <p className="text-sm font-bold text-surface-900">Listing AI Assistant</p>
              <p className="text-[11px] text-surface-500">NGO only • current product details</p>
            </div>
            <div className="flex items-center gap-1">
              {lastAudioSrc && (
                <button
                  className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-600"
                  onClick={() => {
                    if (!audioPlayerRef.current) return;
                    audioPlayerRef.current.src = lastAudioSrc;
                    audioPlayerRef.current.play().catch(() => setAudioBlocked(true));
                  }}
                  aria-label="Replay voice"
                  title="Replay voice"
                >
                  <HiVolumeUp className="w-4 h-4" />
                </button>
              )}
              <button
                className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-600"
                onClick={() => setOpen(false)}
                aria-label="Close AI chat"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-3 pt-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-surface-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>

          <div className="h-72 overflow-y-auto p-3 space-y-2 bg-white">
            {messages.map((m, idx) => (
              <div key={`${m.role}-${idx}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-secondary text-white'
                      : 'bg-surface-100 text-surface-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="text-xs text-surface-500 px-1">Assistant is typing...</div>
            )}
            {audioBlocked && (
              <div className="text-[11px] text-amber-700 px-1">
                Audio autoplay was blocked. Tap the speaker icon in header to replay.
              </div>
            )}
            {audioUnavailable && (
              <div className="text-[11px] text-amber-700 px-1">
                ElevenLabs audio is unavailable for this reply. Check server key/voice settings.
              </div>
            )}
          </div>

          <div className="p-3 border-t border-surface-200 bg-white flex gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`rounded-xl px-3 py-2 text-black ${isListening ? 'bg-red-500' : 'bg-surface-700'}`}
              aria-label="Toggle voice input"
              title="Voice input"
            >
              {isListening ? <HiStop className="w-4 h-4" /> : <HiMicrophone className="w-4 h-4" />}
            </button>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Ask about this listing..."
              className="flex-1 rounded-xl border border-surface-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className="rounded-xl bg-primary px-3 py-2 text-secondary disabled:opacity-50"
              aria-label="Send message"
            >
              <HiPaperAirplane className="w-4 h-4" />
            </button>
          </div>

          <audio ref={audioPlayerRef} className="hidden" />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-secondary text-white p-4 shadow-[0_20px_40px_-20px_rgba(6,78,59,0.8)] hover:scale-105 transition"
          aria-label="Open listing AI assistant"
        >
          <HiChatAlt2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ListingAIAssistant;
