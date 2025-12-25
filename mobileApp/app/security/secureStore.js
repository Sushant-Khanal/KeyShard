import { createContext, useContext, useState } from "react"
import { toByteArray } from "react-native-quick-base64"




const session= {
    vaultKey:null,
    iv:null,
    tag:null,
    userHash:null
}


export function setSession(data) {
  console.log("Session Set")
  session.vaultKey = toByteArray(data.vaultKey)
  session.salt = data.salt
  session.iv = data.iv
  session.tag = data.tag
  session.userHash= data.userHash
}

export function getSession() {
    
  return session
}


export function clearSession(){

    console.log("session cleared")
     if (session.vaultKey instanceof Uint8Array) session.vaultKey.fill(0)
 

  
    session.vaultKey= null,
    session.salt= null,
    session.iv= null,
    session.tag= null,
    session.userHash=null
 
}





