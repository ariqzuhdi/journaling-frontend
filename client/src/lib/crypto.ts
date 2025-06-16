const encoder = new TextEncoder()
const decoder = new TextDecoder()

export async function deriveKeyFromString(password: string): Promise<CryptoKey> {
    const salt = encoder.encode('journal-app-fixed-salt');
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100_000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    )
}

//Encrypting plain text to base64 string
export async function encrypt(plainText: string, key: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(plainText)

    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded,
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

//Decrypting frorm base64 string to plain text
export async function decrypt(base64CipherText: string, key: CryptoKey): Promise<string> {
    const combined = Uint8Array.from(atob(base64CipherText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
    );

    return decoder.decode(decrypted)
}

// Untuk menyimpan key ke session (base64)
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(raw))));
}

// Untuk membaca kembali key dari session (base64)
export async function importKeyFromBase64(base64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}
