// ============================================================================
// LinguaWorld — Cloudflare R2 Storage Provider (S3-Compatible)
// ============================================================================

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import type { AudioStorageProvider, StorageUploadResult } from './types';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string; // Optional CDN domain, e.g. "https://cdn.linguaworld.dev"
}

export class CloudflareR2StorageProvider implements AudioStorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: R2Config) {
    this.bucket = config.bucketName;
    this.publicUrl = (config.publicUrl || '').replace(/\/$/, '');

    // Cloudflare R2 S3-compatible endpoint
    const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    mimeType = 'audio/mpeg',
  ): Promise<StorageUploadResult> {
    const cleanKey = key.replace(/^\/+/, '');
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: cleanKey,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return {
      key: cleanKey,
      url: this.getUrl(cleanKey),
      size: buffer.length,
      mimeType,
    };
  }

  async delete(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, '');
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, '');
    if (this.publicUrl) {
      return `${this.publicUrl}/${cleanKey}`;
    }
    // Direct R2 bucket endpoint fallback
    return `https://${this.bucket}.r2.cloudflarestorage.com/${cleanKey}`;
  }

  async exists(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, '');
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async download(key: string): Promise<Buffer | null> {
    const cleanKey = key.replace(/^\/+/, '');
    try {
      const res = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
        }),
      );
      if (!res.Body) return null;
      const byteArray = await res.Body.transformToByteArray();
      return Buffer.from(byteArray);
    } catch {
      return null;
    }
  }
}

