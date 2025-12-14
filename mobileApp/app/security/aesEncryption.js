import CryptoJS from "react-native-crypto-js";







 export function encryptPassword(data,key){
    
    try{
        console.log("hot")
        if(!key || !data){
            return "Key and data missing for encryption"
        }
       
        const cipherText=  CryptoJS.AES.encrypt(
            data,
            key,
        ).toString()

        return cipherText
    }catch(error){
        console.log(error)
    }
}


export function decryptPassword(data,key){
    
    try{
       
        
        const cipherText=  CryptoJS.AES.decrypt(
            data,
            key,
        )
        let originalText = cipherText.toString(CryptoJS.enc.Utf8);

        return originalText
    }catch(error){
        console.log(error)
    }
}



