// ============================================================================
// LinguaWorld — Frontend Audio Manager (Audio_system.md §8)
// ============================================================================

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5;

export interface PlayAudioOptions {
  audioUrl?: string | null;
  audioAssetId?: string | null;
  text: string;
  speed?: PlaybackSpeed;
}

// Global shared playback state across all UI components
const playbackStatus = ref<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
const activeText = ref<string | null>(null);
const activeUrl = ref<string | null>(null);
const activeSpeed = ref<PlaybackSpeed>(1.0);
const durationMs = ref(0);
const currentPositionMs = ref(0);
const lastError = ref<string | null>(null);

let globalAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, HTMLAudioElement>();

export function useAudioManager() {
  const { speak: fallbackSpeak, stop: fallbackStop, isPlaying: isPronouncing, currentText: pronouncingText } = usePronunciation();

  // Watch speech synthesis status to sync with global playback status
  watch(isPronouncing, (playing) => {
    if (globalAudio === null) {
      if (playing) {
        playbackStatus.value = 'playing';
        if (pronouncingText.value) {
          activeText.value = pronouncingText.value;
        }
      } else if (playbackStatus.value === 'playing') {
        playbackStatus.value = 'idle';
        activeText.value = null;
      }
    }
  });

  function setSpeed(speed: PlaybackSpeed) {
    activeSpeed.value = speed;
    if (globalAudio) {
      globalAudio.playbackRate = speed;
    }
  }

  function stop() {
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio = null;
    }
    fallbackStop();
    playbackStatus.value = 'idle';
    activeText.value = null;
    activeUrl.value = null;
    currentPositionMs.value = 0;
  }

  function pause() {
    if (globalAudio && playbackStatus.value === 'playing') {
      globalAudio.pause();
      playbackStatus.value = 'paused';
    } else {
      stop();
    }
  }

  function resume() {
    if (globalAudio && playbackStatus.value === 'paused') {
      globalAudio
        .play()
        .then(() => {
          playbackStatus.value = 'playing';
        })
        .catch((e) => {
          lastError.value = e.message;
          playbackStatus.value = 'error';
        });
    }
  }

  function replay() {
    if (activeText.value) {
      play({
        audioUrl: activeUrl.value,
        text: activeText.value,
        speed: activeSpeed.value,
      });
    }
  }

  async function play(options: PlayAudioOptions) {
    if (!options.text && !options.audioUrl && !options.audioAssetId) return;

    // 1. Stop any currently playing audio to prevent overlapping voices
    stop();

    const speed = options.speed ?? activeSpeed.value;
    activeSpeed.value = speed;
    activeText.value = options.text;
    lastError.value = null;

    let targetUrl = options.audioUrl;

    // 2. If audioAssetId was passed but no direct URL, resolve URL from API
    if (!targetUrl && options.audioAssetId) {
      try {
        playbackStatus.value = 'loading';
        const res = await $fetch<any>(`/api/audio/${options.audioAssetId}`);
        targetUrl = res?.data?.asset?.url || null;
      } catch (err: any) {
        console.warn('[AudioManager] Failed to resolve audio by asset ID:', err);
      }
    }

    activeUrl.value = targetUrl;

    // 3. Play via HTMLAudioElement if a published audio URL is available
    if (targetUrl) {
      try {
        playbackStatus.value = 'loading';

        let audio = audioCache.get(targetUrl);
        if (!audio) {
          audio = new Audio(targetUrl);
          audioCache.set(targetUrl, audio);
        }

        globalAudio = audio;
        audio.playbackRate = speed;

        audio.oncanplay = () => {
          if (audio) {
            durationMs.value = Math.round((audio.duration || 0) * 1000);
          }
        };

        audio.ontimeupdate = () => {
          if (audio) {
            currentPositionMs.value = Math.round(audio.currentTime * 1000);
          }
        };

        audio.onended = () => {
          playbackStatus.value = 'idle';
          activeText.value = null;
          currentPositionMs.value = 0;
          globalAudio = null;
        };

        audio.onerror = () => {
          console.warn('[AudioManager] File audio playback error, falling back to TTS');
          globalAudio = null;
          playFallback(options.text, speed);
        };

        await audio.play();
        playbackStatus.value = 'playing';
        return;
      } catch (e: any) {
        console.warn('[AudioManager] HTMLAudio playback failed, falling back to TTS:', e);
        globalAudio = null;
        playFallback(options.text, speed);
        return;
      }
    }

    // 4. Graceful Fallback: Web Speech API & Server Stream
    playFallback(options.text, speed);
  }

  function playFallback(text: string, speed: PlaybackSpeed) {
    globalAudio = null;
    playbackStatus.value = 'playing';
    activeText.value = text;

    fallbackSpeak(text, {
      rate: Math.min(1.2, speed * 0.85),
    });
  }

  return {
    play,
    pause,
    resume,
    stop,
    replay,
    setSpeed,
    status: readonly(playbackStatus),
    activeText: readonly(activeText),
    activeUrl: readonly(activeUrl),
    activeSpeed: readonly(activeSpeed),
    durationMs: readonly(durationMs),
    currentPositionMs: readonly(currentPositionMs),
    lastError: readonly(lastError),
  };
}
