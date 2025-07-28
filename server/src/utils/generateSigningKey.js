// filepath: generateSigningKey.js
import { randomBytes } from 'crypto';

console.log(randomBytes(64).toString('base64'));