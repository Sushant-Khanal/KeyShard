import * as Crypto from "expo-crypto"


export function generatePassword(){
         const length = 16

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const special = "!@#$%^&*()-_=+[]{};:,.<>?"

  const allChars = upper + lower + numbers + special



  const passwordChars=[]

passwordChars.push(randomChar(upper))
passwordChars.push(randomChar(lower))
passwordChars.push(randomChar(numbers))
passwordChars.push(randomChar(numbers))
passwordChars.push(randomChar(special))
passwordChars.push(randomChar(special))


while(passwordChars.length<length){
    passwordChars.push(randomChar(allChars))
}


return shuffle(passwordChars).join("")

function secureUint32() {
  const bytes = Crypto.getRandomBytes(4) // 4 bytes = 32 bits
  return (
    (bytes[0] << 24) |
    (bytes[1] << 16) |
    (bytes[2] << 8) |
    bytes[3]
  ) >>> 0
}



        // Random char
      function randomChar(chars) {
  const index = secureUint32() % chars.length
  return chars[index]
}

        //Shuffle Pass
      function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureUint32() % (i + 1)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}




}