import CryptoJS from "react-native-crypto-js";




const key="abfa97973a9f4d3d120232bfb128221a49821af47abbcd8b4fa591699747119f"
const encrypted="U2FsdGVkX1/soGPqX5ebrBxFPrBK/gT3ebQCwXLp5EpdW1StnsrreayjmIL8bIK1"


 export function encryptPassword(data){
    
    try{
       
       
        const cipherText=  CryptoJS.AES.encrypt(
            data,
            key,
        ).toString()

        return cipherText
    }catch(error){
        console.log(error)
    }
}


export function decryptPassword(data){
    
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



