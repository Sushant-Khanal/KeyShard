import { createLogger, transports, format } from "winston";
import 'winston-daily-rotate-file';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const logDirectory = process.env.LOG_DIR || 'logs';
const auditDir = path.join(logDirectory, 'audit');

// Create audit directory if it doesn't exist
if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
}

// Audit event types
export const EVENTS = {
    // Authentication
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILED: 'LOGIN_FAILED',
    SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
    SIGNUP_FAILED: 'SIGNUP_FAILED',
    LOGOUT: 'LOGOUT',

    // Challenge-Response
    CHALLENGE_CREATED: 'CHALLENGE_CREATED',
    CHALLENGE_VERIFIED: 'CHALLENGE_VERIFIED',
    CHALLENGE_FAILED: 'CHALLENGE_FAILED',

    // Signature
    SIGNATURE_VALID: 'SIGNATURE_VALID',
    SIGNATURE_INVALID: 'SIGNATURE_INVALID',

    // Vault Operations
    VAULT_ACCESSED: 'VAULT_ACCESSED',
    VAULT_UPDATED: 'VAULT_UPDATED',

    // Rate Limiting
    RATE_LIMITED: 'RATE_LIMITED',

    // Errors
    AUTH_ERROR: 'AUTH_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
};

// Daily rotating file for audit logs
const auditRotateFile = new transports.DailyRotateFile({
    filename: `${auditDir}/%DATE%-audit.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '90d',  
    format: format.combine(
        format.timestamp(),
        format.json()
    )
});


const auditLogger = createLogger({
    level: 'info',
    transports: [auditRotateFile],
    exitOnError: false
});

/**
 * Log an audit event
 * @param {string} event - Event type from EVENTS
 * @param {object} data - Event data
 * @param {string} data.userHash - User identifier (anonymized)
 * @param {string} data.ip - IP address
 * @param {object} data.metadata - Additional event-specific data
 */
export function auditLog(event, data = {}) {
    const entry = {
        event: event,
        userHash: data.userHash || 'anonymous',
        ip: data.ip || 'unknown',
        metadata: data.metadata || {}
    };

    auditLogger.info(entry);
}

export default auditLogger;
