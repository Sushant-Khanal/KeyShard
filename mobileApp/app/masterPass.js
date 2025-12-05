import { argon2d, argon2i, argon2id } from '@noble/hashes/argon2.js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { bytesToHex } from "@noble/hashes/utils";


const salt= '12345678'




// t= Number of iterations
// m= Memory cost
// p= Parallelism
// maxmem= Maximum memory cost

 function genMasterKey(password){
    try{
    console.log(password)
    const arg1 = argon2id(password, salt, { t: 2, m: 1024, p: 1, maxmem: 2 ** 32 - 1 });
    console.log("Unit8Array: ",arg1)
    return bytesToHex(arg1)
    }catch(e){
        console.log(e)
    }
}

export default genMasterKey






