import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.CHAT_ENCRYPTION_KEY, 'hex');

/**
 * Encrypts a text message using AES-256-CBC
 * @param {string} text - The plaintext message to encrypt
 * @returns {{ encrypted: string, iv: string }} - Encrypted content and initialization vector (both base64)
 */
export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    encrypted,
    iv: iv.toString('base64'),
  };
};

/**
 * Decrypts an encrypted message using AES-256-CBC
 * @param {string} encrypted - The encrypted message (base64)
 * @param {string} iv - The initialization vector (base64)
 * @returns {string} - The decrypted plaintext message
 */
export const decrypt = (encrypted, iv) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'base64'));
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
