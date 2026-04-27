const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let firebaseAdmin = null;

try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Parse from base64 env var (useful for Railway)
    const decodedStr = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decodedStr);
  } else if (fs.existsSync(serviceAccountPath)) {
    // Parse from local file
    serviceAccount = require(serviceAccountPath);
  }

  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    firebaseAdmin = admin;
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('⚠️ Firebase credentials not found (missing file or FIREBASE_SERVICE_ACCOUNT_BASE64). Push notifications disabled.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
}

module.exports = firebaseAdmin;
