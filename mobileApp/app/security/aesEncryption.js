import CryptoJS from "react-native-crypto-js";




const key="abfa97973a9f4d3d120232bfb128221a49821af47abbcd8b4fa591699747119f"
const encrypted="U2FsdGVkX1/soGPqX5ebrBxFPrBK/gT3ebQCwXLp5EpdW1StnsrreayjmIL8bIK1"
const plainText="Hello Don Haru How Are You"

 export function encryptPassword(){
    
    try{
       
        
        const cipherText=  CryptoJS.AES.encrypt(
            plainText,
            key,
        ).toString()

        return cipherText
    }catch(error){
        console.log(error)
    }
}


export function decryptPassword(){
    
    try{
       
        
        const cipherText=  CryptoJS.AES.decrypt(
            encrypted,
            key,
        )
        let originalText = cipherText.toString(CryptoJS.enc.Utf8);

        return originalText
    }catch(error){
        console.log(error)
    }
}



