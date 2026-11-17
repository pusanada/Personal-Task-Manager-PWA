// Firebase Cloud Messaging Service Worker for background notifications
self.addEventListener('push', function (event) {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      notification: {
        title: 'TaskFlow Notification',
        body: event.data.text(),
      },
    };
  }

  const title = payload.notification?.title || payload.data?.title || 'TaskFlow Reminder';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'You have a task deadline approaching.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: payload.data?.url || '/',
      taskId: payload.data?.taskId,
    },
    tag: payload.data?.taskId || 'task-deadline',
    renotify: true,
    actions: [
      { action: 'view', title: 'View Task' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
