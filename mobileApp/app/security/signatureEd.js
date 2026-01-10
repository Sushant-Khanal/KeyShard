import * as Crypto from 'expo-crypto';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (m) => Promise.resolve(sha512(m));

export { ed };