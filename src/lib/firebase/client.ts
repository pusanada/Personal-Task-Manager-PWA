import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    !firebaseConfig.apiKey.includes('placeholder')
  );
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export async function requestNotificationPermissionAndGetToken(): Promise<{
  token: string | null;
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { token: null, error: 'Push notifications are not supported in this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, error: 'Notification permission was denied.' };
    }

    const app = getFirebaseApp();
    if (!app) {
      // In local development without Firebase credentials, simulate or report
      return {
        token: null,
        error: 'Firebase is not yet configured with environment variables.',
      };
    }

    const messaging: Messaging = getMessaging(app);

    // Register service worker if not already registered
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration,
      vapidKey: vapidKey || undefined,
    });

    if (currentToken) {
      return { token: currentToken };
    } else {
      return { token: null, error: 'No registration token available. Request permission to generate one.' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error registering push notifications';
    console.error('An error occurred while retrieving token:', err);
    return { token: null, error: message };
  }
}

export function subscribeToForegroundMessages(
  callback: (payload: { title: string; body: string }) => void
): (() => void) | null {
  if (!isPushNotificationSupported() || !isFirebaseConfigured()) {
    return null;
  }

  try {
    const app = getFirebaseApp();
    if (!app) return null;
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      const title = payload.notification?.title || payload.data?.title || 'TaskFlow Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      callback({ title, body });
    });
  } catch (e) {
    console.error('Failed to subscribe to foreground messages:', e);
    return null;
  }
}
