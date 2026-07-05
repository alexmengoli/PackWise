export function createLocalId(): string {
  const browserCrypto: Crypto | undefined = globalThis.crypto;

  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID();
  }

  if (browserCrypto) {
    return createRandomUuid(browserCrypto);
  }

  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createRandomUuid(browserCrypto: Crypto): string {
  const bytes: Uint8Array = browserCrypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex: string[] = Array.from(bytes, byteToHex);

  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

function byteToHex(byte: number): string {
  return byte.toString(16).padStart(2, '0');
}
