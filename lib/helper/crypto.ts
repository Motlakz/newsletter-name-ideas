import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16; // AES block size

export function encrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY, 'base64');
    if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length} bytes. Expected 32 bytes.`);
    }
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY, 'base64');
    if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length} bytes. Expected 32 bytes.`);
    }
    const [ivPart, encryptedPart] = text.split(':');
    if (!ivPart || !encryptedPart) throw new Error('Malformed encrypted string');
    const iv = Buffer.from(ivPart, 'hex');
    const encrypted = Buffer.from(encryptedPart, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
}
