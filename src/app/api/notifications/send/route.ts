import { NextResponse } from 'next/server';
import { sendPushNotificationToToken, isFirebaseAdminConfigured } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { token, title, body } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Device token is required' }, { status: 400 });
    }

    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not configured on the server.',
        },
        { status: 503 }
      );
    }

    const result = await sendPushNotificationToToken(
      token,
      title || '🔔 TaskFlow Test Notification',
      body || 'Great! Your device is ready to receive upcoming deadline reminders.',
      { url: '/' }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
