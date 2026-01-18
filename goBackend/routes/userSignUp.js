import express from 'express'
//import User from '../schema/User.js'
//import mongoose from 'mongoose'
//import Vault from '../schema/Vault.js'
import { sha256 } from '@noble/hashes/sha2.js';
import  goDB  from '../middleware/dbConnection.js';

const router = express.Router()


router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      encryptedVault,
      iv,
      tag,
      userHash,
      salt,
      publicKeyBase64
    } = req.body;

    if (!email || !encryptedVault || !userHash) {
      return res.status(400).json({
        error: true,
        message: "Vault and Email must be provided"
      });
    }

    const payload = {
      email,
      encryptedVault,
      iv,
      tag,
      salt,
      userHash,
      publicKeyBase64
    };

    Object.keys(payload).forEach(
      key => payload[key] === undefined && delete payload[key]
    );

    await goDB.post('/user', payload, {
      headers: { "Content-Type": "application/json" }
    });

    res.status(201).json({
      error: false,
      message: "Vault Created Successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});


export default router