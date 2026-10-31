// ============================================================================
// Game API Contracts
// ============================================================================

/** A region in the game world */
export interface WorldRegion {
  id: string;
  name: string;
  unlocked: boolean;
}

/** Character data returned from bootstrap */
export interface BootstrapCharacter {
  id: string;
  name: string;
  level: number;
  exp: number;
}

/** Player data returned from bootstrap */
export interface BootstrapPlayer {
  id: string;
  username: string;
  character: BootstrapCharacter;
}

/** World data returned from bootstrap */
export interface BootstrapWorld {
  regions: WorldRegion[];
}

/** Config data returned from bootstrap */
export interface BootstrapConfig {
  bridgeVersion: number;
}

/** Full game bootstrap response payload */
export interface GameBootstrapResponse {
  version: number;
  player: BootstrapPlayer;
  world: BootstrapWorld;
  config: BootstrapConfig;
}
