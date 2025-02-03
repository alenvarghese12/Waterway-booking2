const axios = require('axios');
const fs = require('fs');
const path = require('path');

// In-memory store for failed attempts and blocks (in production, use Redis or database)
const loginAttempts = new Map();
const blockedAccounts = new Map();

// Function to get location from IP address
const getLocationFromIP = async (ip) => {
    try {
        // Remove 'localhost' or '::1' prefix if present
        const cleanIP = ip.replace(/^::ffff:/, '');
        
        // For development/localhost, return default location
        if (cleanIP === '127.0.0.1' || cleanIP === '::1' || cleanIP === 'localhost') {
            return {
                country: 'Local',
                city: 'Development',
                region: 'Local'
            };
        }

        const response = await axios.get(`http://ip-api.com/json/${cleanIP}`);
        return {
            country: response.data.country || 'Unknown',
            city: response.data.city || 'Unknown',
            region: response.data.regionName || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting location from IP:', error);
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown'
        };
    }
};

// Function to check if account is blocked
const isAccountBlocked = (email) => {
    if (blockedAccounts.has(email)) {
        const blockExpiry = blockedAccounts.get(email);
        if (Date.now() < blockExpiry) {
            // Account is still blocked
            const remainingTime = Math.ceil((blockExpiry - Date.now()) / 1000);
            return { blocked: true, remainingTime };
        }
        // Block has expired, remove it
        blockedAccounts.delete(email);
    }
    return { blocked: false, remainingTime: 0 };
};

// Function to get failed login attempts
const getFailedAttempts = async (email) => {
    const attempts = loginAttempts.get(email) || 0;
    return attempts;
};

// Function to record failed attempt and block account if necessary
const recordFailedAttempt = async (email) => {
    const currentAttempts = (loginAttempts.get(email) || 0) + 1;
    loginAttempts.set(email, currentAttempts);

    // Block account for 1 minute after 3 failed attempts
    if (currentAttempts >= 3) {
        const blockExpiry = Date.now() + (60 * 1000); // 1 minute from now
        blockedAccounts.set(email, blockExpiry);
        // Reset attempts after blocking
        loginAttempts.delete(email);
        return true;
    }
    return false;
};

// Function to reset failed attempts on successful login
const resetFailedAttempts = (email) => {
    loginAttempts.delete(email);
};

// Function to log suspicious activity
const logSuspiciousActivity = (data) => {
    const logEntry = `
Timestamp: ${new Date().toISOString()}
IP Address: ${data.ip_address}
Device Type: ${data.device_type}
Location: ${JSON.stringify(data.location)}
Failed Attempts: ${data.failed_attempts}
Risk Score: ${data.riskScore || 'N/A'}
---------------------------
`;
    const logDir = path.join(__dirname, '../../logs');
    const logFile = path.join(logDir, 'suspiciousActivity.log');

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, logEntry, 'utf8');
};

module.exports = {
    getLocationFromIP,
    getFailedAttempts,
    logSuspiciousActivity,
    isAccountBlocked,
    recordFailedAttempt,
    resetFailedAttempts
};

