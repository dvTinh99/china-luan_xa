// ============================================================================
// Bridge Message Types — Communication between Nuxt (host) and Godot (game)
// ============================================================================

/** Current bridge protocol version */
export const BRIDGE_VERSION = 1 as const;

// ---------------------------------------------------------------------------
// Event type enums
// ---------------------------------------------------------------------------

/** Events sent from Nuxt → Godot */
export enum NuxtToGodotEvent {
  /** Initial handshake response after GAME_READY */
  GAME_INIT = 'GAME_INIT',
  /** Player data payload */
  PLAYER_DATA = 'PLAYER_DATA',
  /** World/region data payload */
  WORLD_DATA = 'WORLD_DATA',
  /** Set audio volume/mute state */
  SET_AUDIO = 'SET_AUDIO',
  /** Pause the game loop */
  PAUSE_GAME = 'PAUSE_GAME',
  /** Resume the game loop */
  RESUME_GAME = 'RESUME_GAME',
}

/** Events sent from Godot → Nuxt */
export enum GodotToNuxtEvent {
  /** Game has loaded and is ready to receive data */
  GAME_READY = 'GAME_READY',
  /** Game encountered an unrecoverable error */
  GAME_ERROR = 'GAME_ERROR',
  /** Player interacted with an NPC */
  INTERACT_NPC = 'INTERACT_NPC',
  /** Player entered a new region */
  ENTER_REGION = 'ENTER_REGION',
  /** Player initiated combat */
  START_COMBAT = 'START_COMBAT',
  /** Game requests navigating to a Nuxt route */
  OPEN_APP_ROUTE = 'OPEN_APP_ROUTE',
}

/** Union of all bridge event types */
export type BridgeEventType = NuxtToGodotEvent | GodotToNuxtEvent;

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

/** GAME_INIT payload sent after receiving GAME_READY */
export interface GameInitPayload {
  player: {
    id: string;
    username: string;
    character: {
      id: string;
      name: string;
      level: number;
      exp: number;
    };
  };
  world: {
    regions: Array<{
      id: string;
      name: string;
      unlocked: boolean;
    }>;
  };
  config: {
    bridgeVersion: number;
    audioEnabled: boolean;
    locale: string;
  };
}

/** GAME_READY payload (sent by Godot when ready) */
export interface GameReadyPayload {
  engineVersion: string;
}

/** GAME_ERROR payload */
export interface GameErrorPayload {
  code: string;
  message: string;
  fatal: boolean;
}

/** INTERACT_NPC payload */
export interface InteractNpcPayload {
  npcId: string;
  npcName: string;
  dialogueId?: string;
}

/** ENTER_REGION payload */
export interface EnterRegionPayload {
  regionId: string;
  regionName: string;
}

/** START_COMBAT payload */
export interface StartCombatPayload {
  encounterId: string;
  enemies: Array<{
    id: string;
    name: string;
    level: number;
  }>;
}

/** OPEN_APP_ROUTE payload */
export interface OpenAppRoutePayload {
  route: string;
  params?: Record<string, string>;
}

/** SET_AUDIO payload */
export interface SetAudioPayload {
  enabled: boolean;
  volume: number; // 0.0 – 1.0
}

/** PLAYER_DATA payload */
export interface PlayerDataPayload {
  id: string;
  username: string;
  character: {
    id: string;
    name: string;
    level: number;
    exp: number;
  };
}

/** WORLD_DATA payload */
export interface WorldDataPayload {
  regions: Array<{
    id: string;
    name: string;
    unlocked: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Payload map — maps event types to their payload shapes
// ---------------------------------------------------------------------------

export interface BridgePayloadMap {
  // Nuxt → Godot
  [NuxtToGodotEvent.GAME_INIT]: GameInitPayload;
  [NuxtToGodotEvent.PLAYER_DATA]: PlayerDataPayload;
  [NuxtToGodotEvent.WORLD_DATA]: WorldDataPayload;
  [NuxtToGodotEvent.SET_AUDIO]: SetAudioPayload;
  [NuxtToGodotEvent.PAUSE_GAME]: undefined;
  [NuxtToGodotEvent.RESUME_GAME]: undefined;

  // Godot → Nuxt
  [GodotToNuxtEvent.GAME_READY]: GameReadyPayload;
  [GodotToNuxtEvent.GAME_ERROR]: GameErrorPayload;
  [GodotToNuxtEvent.INTERACT_NPC]: InteractNpcPayload;
  [GodotToNuxtEvent.ENTER_REGION]: EnterRegionPayload;
  [GodotToNuxtEvent.START_COMBAT]: StartCombatPayload;
  [GodotToNuxtEvent.OPEN_APP_ROUTE]: OpenAppRoutePayload;
}

// ---------------------------------------------------------------------------
// Bridge message envelope
// ---------------------------------------------------------------------------

/**
 * Every postMessage between Nuxt and Godot is wrapped in this envelope.
 * `version` must match BRIDGE_VERSION for the message to be accepted.
 */
export interface BridgeMessage<T extends BridgeEventType = BridgeEventType> {
  /** Protocol version — must match BRIDGE_VERSION */
  version: number;
  /** Event type identifier */
  type: T;
  /** Optional correlation ID for request/response pairing */
  requestId?: string;
  /** Event-specific payload */
  payload: T extends keyof BridgePayloadMap ? BridgePayloadMap[T] : unknown;
}

// ---------------------------------------------------------------------------
// Helper: set of all known event type strings (for validation)
// ---------------------------------------------------------------------------

export const ALL_BRIDGE_EVENTS = new Set<string>([
  ...Object.values(NuxtToGodotEvent),
  ...Object.values(GodotToNuxtEvent),
]);
