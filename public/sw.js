// Service Worker for Push Notifications
const CACHE_NAME = 'push-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    if (!event.data) {
        console.log('Push event received but no data');
        return;
    }

    let notificationData;
    try {
        notificationData = event.data.json();
    } catch (error) {
        console.error('Error parsing push data:', error);
        return;
    }

    const { title, body, icon, badge, data, actions } = notificationData;

    const options = {
        body: body,
        icon: icon || '/favicon.ico',
        badge: badge || '/favicon.ico',
        data: data || {},
        actions: actions || [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true,
        silent: false,
        timestamp: Date.now()
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification);
    
    event.notification.close();
    
    const notificationData = event.notification.data;
    const action = event.action;

    if (action === 'dismiss') {
        return;
    }

    // Determine URL based on notification data
    let url = '/dashboard';
    if (notificationData.url) {
        url = notificationData.url;
    } else if (notificationData.type === 'new_request') {
        url = '/admin/approval';
    } else if (notificationData.type === 'status_update') {
        url = '/admin/candidate';
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(url.split('/')[1]) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Background sync (optional - for offline scenarios)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync event');
    }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('Push subscription changed');
    
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        }).then((subscription) => {
            // Send new subscription to server
            return fetch('https://aps2.zemenabnk.com/zbss/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription,
                    deviceInfo: navigator.userAgent
                })
            });
        })
    );
});