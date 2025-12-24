import AesGcmCrypto from 'react-native-aes-gcm-crypto';







 export async  function encryptPassword(data,key){
    
    try{
        console.log(typeof(data))
        if(!key || !data){
            return "Key and data missing for encryption"
        }
      
        const StringData= typeof(data)==='string'? data:JSON.stringify(data)
        console.log(key)
        const {iv,tag,content}= await AesGcmCrypto.encrypt(
            StringData,
            false,
            key,

        )
       
        return {encryptedVault:content,iv,tag}
    }catch(error){
        console.log(error)
    }
}


export async  function decryptPassword(encryptedVault,vaultKey,iv,tag){
   try{
    const decryptedVault= await AesGcmCrypto.decrypt(
        encryptedVault,
        vaultKey,
        iv,
        tag,
        false
    )
    console.log("VaultLength: ",decryptedVault.length)
    return decryptedVault
   }catch(error){
    console.log(error)
   }
}


