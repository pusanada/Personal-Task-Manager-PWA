import * as admin from 'firebase-admin';

function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines in environment variable
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return Boolean(
    projectId &&
    clientEmail &&
    privateKey &&
    !clientEmail.includes('placeholder')
  );
}

export async function sendPushNotificationToToken(
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const app = getFirebaseAdminApp();
  if (!app) {
    return {
      success: false,
      error: 'Firebase Admin is not configured on the server.',
    };
  }

  try {
    const messaging = admin.messaging(app);
    const response = await messaging.send({
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        },
        fcmOptions: {
          link: data.url || '/',
        },
      },
    });

    return { success: true, messageId: response };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to send FCM message';
    console.error('Error sending FCM push notification:', error);
    return { success: false, error: errMessage };
  }
}
