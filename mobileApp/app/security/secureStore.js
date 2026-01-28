import { createContext, useContext, useState } from "react"
import { toByteArray } from "react-native-quick-base64"




const session= {
    vaultKey:null,
    iv:null,
    salt:null,
    tag:null,
    userHash:null,
    privateKey:null
}


export function setSession(data) {
  session.vaultKey = toByteArray(data.vaultKey)
  session.salt = data.salt
  session.iv = data.iv
  session.tag = data.tag
  session.userHash= data.userHash
  session.privateKey= data.privateKey
}

export function getSession() {
    
  return session
}


export function clearSession(){
    if (session.vaultKey instanceof Uint8Array) session.vaultKey.fill(0)
    if (session.privateKey instanceof Uint8Array) session.privateKey.fill(0)
    session.vaultKey= null,
    session.salt= null,
    session.iv= null,
    session.tag= null,
    session.userHash=null
 
}





