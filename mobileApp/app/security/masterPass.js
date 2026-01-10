import { argon2d, argon2i, argon2id } from '@noble/hashes/argon2.js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { bytesToHex } from "@noble/hashes/utils";
import { hkdf } from '@noble/hashes/hkdf.js';
import * as Crypto from 'expo-crypto';
import { sha256 } from '@noble/hashes/sha2.js';
import { fromByteArray, toByteArray } from 'react-native-quick-base64';

import { ed } from './signatureEd';

const encoder= new TextEncoder()
const vaultKeyUnit8= encoder.encode('vault-key')
const userKeyUnit8= encoder.encode('user-key')
const privateKeyUnit8= encoder.encode('private-key')
const challenge= toByteArray("123456")







// t= Number of iterations
// m= Memory cost
// p= Parallelism
// maxmem= Maximum memory cost

 async function genMasterKey(password,salt){
    try{
    
    const arg1 = argon2id(password, salt, { t: 2, m: 1024, p: 1, maxmem: 2 ** 32 - 1 });
    const hk1=  hkdf(sha256, arg1,undefined,vaultKeyUnit8, 32);
    const hk2=  hkdf(sha256,arg1,undefined,userKeyUnit8, 32);
    const privateKey=  hkdf(sha256,arg1,undefined,privateKeyUnit8, 32);
    const publicKey= await ed.getPublicKeyAsync(privateKey)
    const signature = await ed.signAsync(challenge, privateKey);
    const isValid = await ed.verifyAsync(signature, challenge, publicKey);



    

    const userKeyHash= sha256(hk2)
    const publicKeyBase64= fromByteArray(publicKey)

    console.log("Unit8 VaultKey: ",hk1)
    console.log("Unit8 UserKey: ",hk2)
    console.log("Uint8 PrivateKey: ",privateKey)
    console.log("Base64 UserHash: ",userKeyHash)
    console.log("publicKey: ",publicKey)
    console.log("signature: ",signature)
    console.log("isValid",isValid)
    
    
   
     
       
    return {vaultKey:fromByteArray(hk1),userHash:bytesToHex(userKeyHash),publicKeyBase64:publicKeyBase64,privateKey:privateKey}
    }catch(e){
        console.log(e)
    }
}

export default genMasterKey





