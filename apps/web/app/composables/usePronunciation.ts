// ============================================================================
// LinguaWorld — Mandarin Pronunciation Engine (Web Speech Synthesis + Audio Stream API)
// ============================================================================

export interface PronounceOptions {
  rate?: number;     // Speed: 0.85 is ideal for language learners to hear tones clearly
  pitch?: number;    // Pitch: default 1.0
  audioUrl?: string; // Optional recorded audio fallback
}

// Module-level state & utterance retention to prevent Chromium GC bug
const isPlaying = ref(false);
const currentText = ref<string | null>(null);
let activeAudioElement: HTMLAudioElement | null = null;
const activeUtterances = new Set<SpeechSynthesisUtterance>();
let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voice listener immediately on client side
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function usePronunciation() {
  function getChineseVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Preference hierarchy for natural Mandarin pronunciation
    // 1. Specific standard Chinese voices across macOS, Windows, iOS, Android, Chrome
    const preferredPatterns = [
      'tingting',
      'ting-ting',
      'xiaoxiao',
      'yunxi',
      'huihui',
      'yaoyao',
      'li-mu',
      'google 普通话',
      'sinji',
      'meijia',
    ];

    for (const pattern of preferredPatterns) {
      const match = voices.find((v) => v.name.toLowerCase().includes(pattern));
      if (match) return match;
    }

    // 2. Any zh-CN / zh voice
    return (
      voices.find((v) => v.lang.replace('_', '-').toLowerCase() === 'zh-cn') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ||
      null
    );
  }

  function stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      activeUtterances.clear();
    }
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    }
    isPlaying.value = false;
    currentText.value = null;
  }

  function speak(text: string, options: PronounceOptions = {}) {
    if (!text || typeof window === 'undefined') return;

    // Stop any ongoing speech
    stop();

    // 1. If explicit pre-recorded audioUrl is provided, attempt that first
    if (options.audioUrl) {
      playAudioFile(options.audioUrl, text, options);
      return;
    }

    // 2. Play via Browser Web Speech Synthesis
    playSpeechSynthesis(text, options);
  }

  function playAudioFile(url: string, text: string, options: PronounceOptions) {
    try {
      const audio = new Audio(url);
      activeAudioElement = audio;
      isPlaying.value = true;
      currentText.value = text;

      audio.onended = () => {
        if (activeAudioElement === audio) {
          activeAudioElement = null;
          isPlaying.value = false;
          currentText.value = null;
        }
      };

      audio.onerror = () => {
        // Fallback to Web Speech Synthesis if audio file fails to load/decode
        if (activeAudioElement === audio) {
          activeAudioElement = null;
        }
        playSpeechSynthesis(text, options);
      };

      audio.play().catch(() => {
        if (activeAudioElement === audio) {
          activeAudioElement = null;
        }
        playSpeechSynthesis(text, options);
      });
    } catch {
      playSpeechSynthesis(text, options);
    }
  }

  function playSpeechSynthesis(text: string, options: PronounceOptions) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      // Direct stream fallback
      playServerStream(text, options);
      return;
    }

    // Workaround for Chrome/WebKit speech synthesis pause bug
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 1.0;

    const voice = getChineseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Keep reference in module-level Set to prevent V8 garbage-collecting the utterance
    activeUtterances.add(utterance);

    utterance.onstart = () => {
      isPlaying.value = true;
      currentText.value = text;
    };

    utterance.onend = () => {
      activeUtterances.delete(utterance);
      if (currentText.value === text) {
        isPlaying.value = false;
        currentText.value = null;
      }
    };

    utterance.onerror = (e) => {
      activeUtterances.delete(utterance);
      // If error is not a manual cancel, fall back to server audio stream
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[Pronunciation] SpeechSynthesis error:', e.error, '- attempting server stream fallback');
        playServerStream(text, options);
      } else {
        isPlaying.value = false;
        currentText.value = null;
      }
    };

    window.speechSynthesis.speak(utterance);

    // Some versions of Chrome pause immediately after speak; resume unblocks it
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  function playServerStream(text: string, options: PronounceOptions) {
    try {
      const rateParam = options.rate ? `&rate=${options.rate}` : '';
      const streamUrl = `/api/audio/stream?text=${encodeURIComponent(text)}${rateParam}`;
      const audio = new Audio(streamUrl);
      activeAudioElement = audio;
      isPlaying.value = true;
      currentText.value = text;

      audio.onended = () => {
        if (activeAudioElement === audio) {
          activeAudioElement = null;
          isPlaying.value = false;
          currentText.value = null;
        }
      };

      audio.onerror = () => {
        if (activeAudioElement === audio) {
          activeAudioElement = null;
          isPlaying.value = false;
          currentText.value = null;
        }
      };

      audio.play().catch((e) => {
        console.warn('[Pronunciation] Server stream playback rejected:', e);
        if (activeAudioElement === audio) {
          activeAudioElement = null;
          isPlaying.value = false;
          currentText.value = null;
        }
      });
    } catch {
      isPlaying.value = false;
      currentText.value = null;
    }
  }

  return {
    speak,
    stop,
    isPlaying: readonly(isPlaying),
    currentText: readonly(currentText),
  };
}
