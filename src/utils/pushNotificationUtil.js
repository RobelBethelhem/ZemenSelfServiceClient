import { API_BASE } from '../api/base';

class PushNotificationUtil {
    static vapidPublicKey = null;
    static isSupported = false;

    /**
     * Initialize push notifications
     */
    static async initialize() {
        // Check if push notifications are supported
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        
        if (!this.isSupported) {
            console.log('Push notifications are not supported');
            return false;
        }

        try {
            let registration = null;
            
            // Determine the correct base path for your app
            const basePath = window.location.pathname.split('/')[1]; // Gets 'zbss' from '/zbss/...'
            const isSubDirectory = basePath && basePath !== ''; // Check if app is in subdirectory
            
            // Build correct service worker paths
            const swPaths = isSubDirectory ? [
                `/${basePath}/sw.js`,
                `/zbss/sw.js`,
                `./sw.js`,
                `/zbss/static/sw.js`
            ] : [
                '/sw.js',
                './sw.js',
                '/static/sw.js',
                '/public/sw.js'
            ];
            
            // Determine correct scope
            const scope = isSubDirectory ? `/${basePath}/` : '/';
            
            console.log('Trying to register service worker with scope:', scope);
            console.log('App base path detected:', basePath);
            
            for (const swPath of swPaths) {
                try {
                    registration = await navigator.serviceWorker.register(swPath, {
                        scope: scope
                    });
                    console.log('Service Worker registered successfully from file:', registration);
                    console.log('SW Path:', swPath, 'Scope:', scope);
                    break;
                } catch (error) {
                    console.log(`Failed to register SW from ${swPath}:`, error.message);
                    continue;
                }
            }
            
            // If file registration failed, create service worker from blob
            if (!registration) {
                console.log('Trying to create service worker from blob...');
                const swCode = this.getServiceWorkerCode();
                const blob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);
                
                registration = await navigator.serviceWorker.register(swUrl, {
                    scope: scope
                });
                console.log('Service Worker registered from blob with scope:', scope);
            }

            // Get VAPID public key from server - account for base path
            const apiBasePath = isSubDirectory ? `/${basePath}` : '';
            const response = await fetch(`${apiBasePath}/api/push/vapid-public-key`);
            if (!response.ok) {
                throw new Error('Failed to get VAPID public key');
            }
            const data = await response.json();
            this.vapidPublicKey = data.publicKey;

            return true;
        } catch (error) {
            console.error('Push notification initialization failed:', error);
            return false;
        }
    }

    /**
     * Get service worker code as string (fallback when file is not accessible)
     */
    static getServiceWorkerCode() {
        return `
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

        // Handle push subscription changes
        self.addEventListener('pushsubscriptionchange', (event) => {
            console.log('Push subscription changed');
            
            event.waitUntil(
                self.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: '${this.vapidPublicKey || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'}'
                }).then((subscription) => {
                    // Send new subscription to server
                    return fetch('${API_BASE}/push/subscribe', {
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
        `;
    }

    /**
     * Request notification permission
     */
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    /**
     * Subscribe to push notifications
     */
    static async subscribe(accessToken) {
        try {
            if (!this.isSupported) {
                throw new Error('Push notifications not supported');
            }

            const hasPermission = await this.requestPermission();
            if (!hasPermission) {
                throw new Error('Notification permission denied');
            }

            const registration = await navigator.serviceWorker.ready;
            
            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('Already subscribed to push notifications');
                return existingSubscription;
            }

            // Convert VAPID key to Uint8Array
            const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

            // Subscribe to push manager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            // Determine API base path for IIS setup
            const basePath = window.location.pathname.split('/')[1];
            const apiBasePath = basePath && basePath !== '' ? `/${basePath}` : '';

            // Send subscription to server
            const response = await fetch(`${apiBasePath}/api/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': accessToken
                },
                body: JSON.stringify({
                    subscription: subscription,
                    deviceInfo: this.getDeviceInfo()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription to server');
            }

            console.log('Successfully subscribed to push notifications');
            return subscription;

        } catch (error) {
            console.error('Push subscription failed:', error);
            throw error;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    static async unsubscribe(accessToken) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from push manager
                await subscription.unsubscribe();

                // Determine API base path for IIS setup
                const basePath = window.location.pathname.split('/')[1];
                const apiBasePath = basePath && basePath !== '' ? `/${basePath}` : '';

                // Notify server
                await fetch(`${apiBasePath}/api/push/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': accessToken
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint
                    })
                });

                console.log('Successfully unsubscribed from push notifications');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Push unsubscription failed:', error);
            throw error;
        }
    }

    /**
     * Check if user is subscribed
     */
    static async isSubscribed() {
        try {
            if (!this.isSupported) return false;

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            return !!subscription;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return false;
        }
    }

    /**
     * Get current subscription
     */
    static async getSubscription() {
        try {
            if (!this.isSupported) return null;

            const registration = await navigator.serviceWorker.ready;
            return await registration.pushManager.getSubscription();
        } catch (error) {
            console.error('Error getting subscription:', error);
            return null;
        }
    }

    /**
     * Show a local notification (for testing)
     */
    static async showLocalNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                ...options
            });
        }
    }

    /**
     * Helper method to convert VAPID key
     */
    static urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Get device information
     */
    static getDeviceInfo() {
        const userAgent = navigator.userAgent;
        let device = 'Unknown Device';

        if (/Android/i.test(userAgent)) {
            device = 'Android Device';
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            device = 'iOS Device';
        } else if (/Windows/i.test(userAgent)) {
            device = 'Windows Device';
        } else if (/Macintosh/i.test(userAgent)) {
            device = 'Mac Device';
        } else if (/Linux/i.test(userAgent)) {
            device = 'Linux Device';
        }

        return device;
    }
}

export default PushNotificationUtil;
