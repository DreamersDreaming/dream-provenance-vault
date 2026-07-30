import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { ObjectStore } from "./vault-service";

export interface B2Config {
  endpoint: string;
  region: string;
  bucket: string;
  keyId: string;
  applicationKey: string;
}

export function readB2Config(
  env: Partial<Record<string, string | undefined>>
): B2Config {
  const endpoint = env.B2_ENDPOINT;
  const region = env.B2_REGION;
  const bucket = env.B2_BUCKET;
  const keyId = env.B2_KEY_ID;
  const applicationKey = env.B2_APPLICATION_KEY;

  if (!endpoint || !region || !bucket || !keyId || !applicationKey) {
    throw new Error("B2 connection is not configured");
  }

  return { endpoint, region, bucket, keyId, applicationKey };
}

export class B2ObjectStore implements ObjectStore {
  private readonly client: S3Client;

  constructor(private readonly config: B2Config) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey
      }
    });
  }

  async put(
    key: string,
    body: Uint8Array | string,
    contentType: string
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "private, max-age=0, no-store"
      })
    );
  }

  async getText(key: string): Promise<string | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key
        })
      );
      return result.Body ? await result.Body.transformToString("utf-8") : null;
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      if (status === 404) {
        return null;
      }
      throw error;
    }
  }

  async signedGetUrl(key: string, expiresSeconds: number): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      }),
      { expiresIn: expiresSeconds }
    );
  }
}

export function createB2Store(
  env: Partial<Record<string, string | undefined>> = process.env
): B2ObjectStore {
  return new B2ObjectStore(readB2Config(env));
}
