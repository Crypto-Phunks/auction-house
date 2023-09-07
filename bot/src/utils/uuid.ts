import crypto from 'crypto';

export const stringToUUID = (input: string) => {
  const hash = crypto.createHash('sha1').update(input).digest('hex');
  const chars = hash.split('');

  // Here we mimic a version 4 UUID except with the first 12 characters
  // coming from the hash and the last 20 characters coming from the hash.
  // You can customize this as you see fit.
  return [
    ...chars.slice(0, 8),
    '-',
    ...chars.slice(8, 12),
    '-4', // Use '4' to indicate this is a "version 4" UUID
    ...chars.slice(13, 16),
    '-',
    ...chars.slice(16, 20),
    '-',
    ...chars.slice(20, 32),
  ].join('');
}