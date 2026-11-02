import {
  BRIDGE_VERSION,
  ALL_BRIDGE_EVENTS,
  NuxtToGodotEvent,
  GodotToNuxtEvent,
  type BridgeMessage,
  type BridgeEventType,
  type BridgePayloadMap,
  type GameInitPayload,
} from '@linguaworld/shared-types';
import type { GameBootstrapResponse } from '@linguaworld/api-contracts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BridgeStatus = 'loading' | 'ready' | 'error';

type EventCallback<T extends GodotToNuxtEvent = GodotToNuxtEvent> = (
  payload: T extends keyof BridgePayloadMap ? BridgePayloadMap[T] : unknown,
) => void;

/** Timeout (ms) for waiting for GAME_READY after iframe loads */
const GAME_READY_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useGameBridge(iframeRef: Ref<HTMLIFrameElement | null>) {
  const config = useRuntimeConfig();
  const configuredOrigin = config.public.gameOrigin as string;

  // Origin helper: supports configured game origin as well as current window origin (same-origin MVP)
  function getTargetOrigin(): string {
    if (typeof window !== 'undefined' && (configuredOrigin === 'http://localhost:3000' || !configuredOrigin)) {
      return window.location.origin;
    }
    return configuredOrigin || '*';
  }

  function isAllowedOrigin(origin: string): boolean {
    if (origin === configuredOrigin) return true;
    if (typeof window !== 'undefined' && origin === window.location.origin) return true;
    return false;
  }

  // Reactive state
  const status = ref<BridgeStatus>('loading');
  const error = ref<string | null>(null);

  // Event listeners map
  const listeners = new Map<GodotToNuxtEvent, Set<EventCallback>>();

  // Timeout handle
  let readyTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // ---------------------------------------------------------------------------
  // Send a typed message to the Godot iframe
  // ---------------------------------------------------------------------------
  function send<T extends NuxtToGodotEvent>(
    type: T,
    payload?: T extends keyof BridgePayloadMap ? BridgePayloadMap[T] : undefined,
    requestId?: string,
  ) {
    const iframe = iframeRef.value;
    if (!iframe?.contentWindow) {
      console.warn('[GameBridge] Cannot send — iframe not available');
      return;
    }

    const message: BridgeMessage<T> = {
      version: BRIDGE_VERSION,
      type,
      payload: payload as BridgeMessage<T>['payload'],
      ...(requestId ? { requestId } : {}),
    };

    console.log('[GameBridge] Sending:', type, payload);
    iframe.contentWindow.postMessage(message, getTargetOrigin());
  }

  // ---------------------------------------------------------------------------
  // Validate an incoming message
  // ---------------------------------------------------------------------------
  function isValidBridgeMessage(data: unknown): data is BridgeMessage {
    if (typeof data !== 'object' || data === null) return false;
    const msg = data as Record<string, unknown>;
    if (msg.version !== BRIDGE_VERSION) return false;
    if (typeof msg.type !== 'string') return false;
    if (!ALL_BRIDGE_EVENTS.has(msg.type)) return false;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Handle incoming postMessage events
  // ---------------------------------------------------------------------------
  function handleMessage(event: MessageEvent) {
    // Strict origin validation
    if (!isAllowedOrigin(event.origin)) {
      return;
    }

    // Validate envelope
    if (!isValidBridgeMessage(event.data)) {
      console.warn('[GameBridge] Invalid message envelope:', event.data);
      return;
    }

    const msg = event.data as BridgeMessage;
    console.log('[GameBridge] Received:', msg.type, msg.payload);

    // Handle built-in events
    switch (msg.type) {
      case GodotToNuxtEvent.GAME_READY:
        handleGameReady();
        break;
      case GodotToNuxtEvent.GAME_ERROR:
        handleGameError(msg.payload as { message: string; fatal: boolean });
        break;
    }

    // Dispatch to registered listeners
    const eventType = msg.type as GodotToNuxtEvent;
    const callbacks = listeners.get(eventType);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb(msg.payload);
        } catch (err) {
          console.error(`[GameBridge] Error in ${eventType} listener:`, err);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Handle GAME_READY: fetch bootstrap data and send GAME_INIT
  // ---------------------------------------------------------------------------
  async function handleGameReady() {
    // Clear the timeout
    if (readyTimeoutId) {
      clearTimeout(readyTimeoutId);
      readyTimeoutId = null;
    }

    try {
      // Fetch bootstrap data from the server
      const response = await $fetch<{ data: GameBootstrapResponse }>('/api/game/bootstrap');
      const bootstrap = response.data;

      // Build GAME_INIT payload
      const initPayload: GameInitPayload = {
        player: {
          id: bootstrap.player.id,
          username: bootstrap.player.username,
          character: {
            id: bootstrap.player.character.id,
            name: bootstrap.player.character.name,
            level: bootstrap.player.character.level,
            exp: bootstrap.player.character.exp,
          },
        },
        world: {
          regions: bootstrap.world.regions,
        },
        chakra: {
          active_chakra_tier: (bootstrap as any).chakra?.activeChakraTier || 1,
          aura_color_hex: (bootstrap as any).chakra?.auraColorHex || '#EF4444',
          highest_unlocked_tier: (bootstrap as any).chakra?.highestUnlockedTier || 0,
          unlocked_regions: (bootstrap as any).chakra?.unlockedRegions || ['region_novice_village'],
        },
        config: {
          bridgeVersion: bootstrap.config.bridgeVersion,
          audioEnabled: true,
          locale: 'zh-CN',
        },
      };

      // Send GAME_INIT to Godot
      send(NuxtToGodotEvent.GAME_INIT, initPayload);
      status.value = 'ready';
      error.value = null;

      console.log('[GameBridge] Game initialized successfully');
    } catch (err) {
      console.error('[GameBridge] Failed to bootstrap game:', err);
      status.value = 'error';
      error.value = 'Failed to load game data. Please try again.';
    }
  }

  // ---------------------------------------------------------------------------
  // Handle GAME_ERROR
  // ---------------------------------------------------------------------------
  function handleGameError(payload: { message: string; fatal: boolean }) {
    console.error('[GameBridge] Game error:', payload);
    if (payload.fatal) {
      status.value = 'error';
      error.value = payload.message || 'The game encountered a fatal error.';
    }
  }

  // ---------------------------------------------------------------------------
  // Register an event listener
  // ---------------------------------------------------------------------------
  function on<T extends GodotToNuxtEvent>(eventType: T, callback: EventCallback<T>) {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    listeners.get(eventType)!.add(callback as EventCallback);
  }

  // ---------------------------------------------------------------------------
  // Remove an event listener
  // ---------------------------------------------------------------------------
  function off<T extends GodotToNuxtEvent>(eventType: T, callback: EventCallback<T>) {
    listeners.get(eventType)?.delete(callback as EventCallback);
  }

  // ---------------------------------------------------------------------------
  // Start the ready timeout
  // ---------------------------------------------------------------------------
  function startReadyTimeout() {
    readyTimeoutId = setTimeout(() => {
      if (status.value === 'loading') {
        status.value = 'error';
        error.value = `Game did not respond within ${GAME_READY_TIMEOUT_MS / 1000} seconds.`;
        console.error('[GameBridge] GAME_READY timeout');
      }
    }, GAME_READY_TIMEOUT_MS);
  }

  // ---------------------------------------------------------------------------
  // Retry connection
  // ---------------------------------------------------------------------------
  function retry() {
    status.value = 'loading';
    error.value = null;

    // Reload the iframe
    const iframe = iframeRef.value;
    if (iframe) {
      iframe.src = iframe.src;
    }

    startReadyTimeout();
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  onMounted(() => {
    window.addEventListener('message', handleMessage);
    startReadyTimeout();
  });

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
    if (readyTimeoutId) {
      clearTimeout(readyTimeoutId);
    }
    listeners.clear();
  });

  return {
    status: readonly(status),
    error: readonly(error),
    send,
    on,
    off,
    retry,
  };
}
