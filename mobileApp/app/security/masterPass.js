import { argon2d, argon2i, argon2id } from '@noble/hashes/argon2.js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { bytesToHex } from "@noble/hashes/utils";
import { hkdf } from '@noble/hashes/hkdf.js';
import * as Crypto from 'expo-crypto';
import { sha256 } from '@noble/hashes/sha2.js';
import { fromByteArray } from 'react-native-quick-base64';


const encoder= new TextEncoder()
const vaultKeyUnit8= encoder.encode('vault-key')
const userKeyUnit8= encoder.encode('user-key')






// t= Number of iterations
// m= Memory cost
// p= Parallelism
// maxmem= Maximum memory cost

 function genMasterKey(password,salt){
    try{
    
    const arg1 = argon2id(password, salt, { t: 2, m: 1024, p: 1, maxmem: 2 ** 32 - 1 });
    const hk1=  hkdf(sha256, arg1,undefined,vaultKeyUnit8, 32);
    const hk2=  hkdf(sha256,arg1,undefined,userKeyUnit8, 32);

    const userKeyHash= sha256(hk2)
    
   
     
       
    return {vaultKey:fromByteArray(hk1),userHash:bytesToHex(userKeyHash)}
    }catch(e){
        console.log(e)
    }
}

export default genMasterKey





