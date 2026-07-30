import type { ObjectStore } from "./vault-service";

export class TestMemoryStore implements ObjectStore {
  readonly objects = new Map<string, Uint8Array>();

  async put(
    key: string,
    body: Uint8Array | string,
    _contentType: string
  ): Promise<void> {
    this.objects.set(
      key,
      typeof body === "string" ? new TextEncoder().encode(body) : body
    );
  }

  async getText(key: string): Promise<string | null> {
    const value = this.objects.get(key);
    return value ? new TextDecoder().decode(value) : null;
  }

  async signedGetUrl(key: string, expiresSeconds: number): Promise<string> {
    return `https://signed.example/${key}?expires=${expiresSeconds}`;
  }
}
