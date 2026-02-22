import AesGcmCrypto from 'react-native-aes-gcm-crypto';







 export async  function encryptPassword(data,key){
    
    try{
        if(!key || !data){
            return "Key and data missing for encryption"
        }
      
        const StringData= typeof(data)==='string'? data:JSON.stringify(data)
        const {iv,tag,content}= await AesGcmCrypto.encrypt(
            StringData,
            false,
            key,

        )
       
        return {encryptedVault:content,iv,tag}
    }catch(error){
        // Error handled silently in production
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
    return decryptedVault
   }catch(error){
    // Error handled silently in production
   }
}


