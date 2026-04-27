const firebaseAdmin = require('../config/firebaseAdmin');

/**
 * Send a push notification to one or many FCM tokens
 * @param {string|string[]} tokens - Single token or array of tokens
 * @param {Object} notification - Notification object { title, body }
 * @param {Object} data - Optional data payload
 */
const sendPushNotification = async (tokens, notification, data = {}) => {
  if (!firebaseAdmin) {
    console.warn('⚠️ Push notification skipped: Firebase Admin not initialized.');
    return null;
  }

  const tokenList = Array.isArray(tokens) ? tokens : [tokens];
  const validTokens = tokenList.filter(t => t && t.trim().length > 0);

  if (validTokens.length === 0) {
    console.warn('⚠️ Push notification skipped: No valid tokens.');
    return null;
  }

  // Stringify all data values (FCM requires string values in data payload)
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }

  try {
    if (validTokens.length === 1) {
      // ── Single token: use send() ──
      const response = await firebaseAdmin.messaging().send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringData,
        token: validTokens[0],
        android: {
          priority: 'high',
          notification: {
            channelId: 'high_importance_channel',
            priority: 'max',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
      });
      console.log('✅ Push notification sent:', response);
      return response;
    } else {
      // ── Multiple tokens: use sendEachForMulticast() (replaces deprecated sendMulticast) ──
      const response = await firebaseAdmin.messaging().sendEachForMulticast({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringData,
        tokens: validTokens,
        android: {
          priority: 'high',
          notification: {
            channelId: 'high_importance_channel',
            priority: 'max',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
      });
      console.log(`✅ Push multicast: ${response.successCount}/${validTokens.length} succeeded`);
      
      // Log failures for debugging
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`  ❌ Token[${idx}] failed:`, resp.error?.message);
          }
        });
      }
      return response;
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);
    return null;
  }
};

module.exports = { sendPushNotification };
