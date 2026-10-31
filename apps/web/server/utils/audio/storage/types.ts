// ============================================================================
// LinguaWorld — Audio Storage Provider Interface (Audio_system.md §3, §5)
// ============================================================================

export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface AudioStorageProvider {
  /**
   * Upload binary audio buffer to object storage
   */
  upload(
    key: string,
    data: Buffer | Uint8Array,
    mimeType?: string,
  ): Promise<StorageUploadResult>;

  /**
   * Delete an object from storage by key
   */
  delete(key: string): Promise<boolean>;

  /**
   * Resolve public or signed CDN URL for playback
   */
  getUrl(key: string): string;

  /**
   * Check whether an object exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * Read raw audio data from storage
   */
  download(key: string): Promise<Buffer | null>;
}

