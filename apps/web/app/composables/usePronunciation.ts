// ============================================================================
// LinguaWorld — Mandarin Pronunciation Engine (Web Speech Synthesis + Audio API)
// ============================================================================

export interface PronounceOptions {
  rate?: number;     // Speed: 0.85 is ideal for language learners to hear tones clearly
  pitch?: number;    // Pitch: default 1.0
  audioUrl?: string; // Optional recorded audio fallback
}

// Shared module-level reactive state across all components
const isPlaying = ref(false);
const currentText = ref<string | null>(null);
let audioElement: HTMLAudioElement | null = null;

export function usePronunciation() {
  // Find the highest quality Chinese voice available on the device
  function getChineseVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Preference hierarchy for natural Mandarin pronunciation
    // 1. zh-CN specific voice
    // 2. Ting-Ting (macOS/iOS standard) or Li-Mu / Yaoyao
    // 3. Google 普通话 (Chrome/Android)
    // 4. Any voice starting with zh
    const preferredNames = ['ting-ting', 'li-mu', 'yaoyao', 'google 普通话', 'xiaoxiao', 'yunxi', 'huihui'];

    for (const name of preferredNames) {
      const match = voices.find((v) => v.name.toLowerCase().includes(name));
      if (match) return match;
    }

    return (
      voices.find((v) => v.lang.replace('_', '-').toLowerCase() === 'zh-cn') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ||
      null
    );
  }

  // Pre-load voices on client
  onMounted(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  });

  function stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      audioElement = null;
    }
    isPlaying.value = false;
    currentText.value = null;
  }

  function speak(text: string, options: PronounceOptions = {}) {
    if (!text || typeof window === 'undefined') return;

    // Stop any ongoing speech
    stop();

    // 1. If pre-recorded audioUrl is provided, try playing audio file first
    if (options.audioUrl) {
      try {
        audioElement = new Audio(options.audioUrl);
        isPlaying.value = true;
        currentText.value = text;

        audioElement.onended = () => {
          isPlaying.value = false;
          currentText.value = null;
          audioElement = null;
        };

        audioElement.onerror = () => {
          // Fallback to SpeechSynthesis if audio file fails
          playSpeechSynthesis(text, options);
        };

        audioElement.play().catch(() => {
          playSpeechSynthesis(text, options);
        });
        return;
      } catch (e) {
        // Fallback
      }
    }

    // 2. Browser Web Speech Synthesis
    playSpeechSynthesis(text, options);
  }

  function playSpeechSynthesis(text: string, options: PronounceOptions) {
    if (!window.speechSynthesis) {
      console.warn('[Pronunciation] SpeechSynthesis API not supported by browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = options.rate ?? 0.85; // Slightly slower than 1.0 for tone clarity
    utterance.pitch = options.pitch ?? 1.0;

    const voice = getChineseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      isPlaying.value = true;
      currentText.value = text;
    };

    utterance.onend = () => {
      isPlaying.value = false;
      currentText.value = null;
    };

    utterance.onerror = (e) => {
      // Ignore interruption cancels
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('[Pronunciation] Speech error:', e.error);
      }
      isPlaying.value = false;
      currentText.value = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  return {
    speak,
    stop,
    isPlaying: readonly(isPlaying),
    currentText: readonly(currentText),
  };
}
