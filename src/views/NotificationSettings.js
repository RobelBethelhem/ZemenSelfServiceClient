// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import {
//     CRow,
//     CCol,
//     CCard,
//     CCardHeader,
//     CCardBody,
//     CButton,
//     CAlert,
//     CSpinner,
// } from '@coreui/react';

// const NotificationSettings = () => {
//     const [isSubscribed, setIsSubscribed] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);
    
//     const accessToken = useSelector(state => state.user.accessToken);

//     const handleSubscribe = async () => {
//         try {
//             setIsLoading(true);
//             setError(null);

//             // Check if push notifications are supported
//             if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
//                 throw new Error('Push notifications are not supported in this browser');
//             }

//             // Request permission
//             const permission = await Notification.requestPermission();
//             if (permission !== 'granted') {
//                 throw new Error('Notification permission denied');
//             }

//             // Get service worker registration
//             const registration = await navigator.serviceWorker.ready;

//             // Check if already subscribed
//             const existingSubscription = await registration.pushManager.getSubscription();
//             if (existingSubscription) {
//                 setIsSubscribed(true);
//                 setSuccess('Already subscribed to push notifications!');
//                 return;
//             }

//             // For now, just simulate subscription success
//             // We'll implement the actual subscription later
//             setTimeout(() => {
//                 setIsSubscribed(true);
//                 setSuccess('Successfully subscribed to push notifications!');
//                 setIsLoading(false);
//             }, 1000);

//             return;

//         } catch (error) {
//             console.error('Subscription failed:', error);
//             setError(error.message);
//             setIsLoading(false);
//         }
//     };

//     const handleUnsubscribe = async () => {
//         try {
//             setIsLoading(true);
//             setError(null);

//             // Simulate unsubscription
//             setTimeout(() => {
//                 setIsSubscribed(false);
//                 setSuccess('Successfully unsubscribed from push notifications!');
//                 setIsLoading(false);
//             }, 1000);

//         } catch (error) {
//             console.error('Unsubscription failed:', error);
//             setError(error.message);
//             setIsLoading(false);
//         }
//     };

//     const testNotification = () => {
//         if ('Notification' in window && Notification.permission === 'granted') {
//             new Notification('Test Notification', {
//                 body: 'This is a test notification!',
//                 icon: '/zbss/favicon.ico'
//             });
//         } else {
//             setError('Notifications not permitted');
//         }
//     };

//     console.log('NotificationSettings rendering - accessToken present:', !!accessToken);

//     return (
//         <CRow>
//             <CCol xs={12}>
//                 <CCard className="mb-4">
//                     <CCardHeader>
//                         <strong>Notification Settings</strong>
//                     </CCardHeader>
//                     <CCardBody>
//                         <p className="text-muted">
//                             Manage your push notification preferences below. When enabled, you'll receive 
//                             real-time notifications for important updates even when the application is closed.
//                         </p>
                        
//                         {/* Inline Push Notification Manager */}
//                         <CCard className="mb-4">
//                             <CCardHeader>
//                                 <strong>Push Notifications</strong>
//                             </CCardHeader>
//                             <CCardBody>
//                                 {error && (
//                                     <CAlert 
//                                         color="danger" 
//                                         dismissible
//                                         onClose={() => setError(null)}
//                                     >
//                                         {error}
//                                     </CAlert>
//                                 )}

//                                 {success && (
//                                     <CAlert 
//                                         color="success" 
//                                         dismissible
//                                         onClose={() => setSuccess(null)}
//                                     >
//                                         {success}
//                                     </CAlert>
//                                 )}

//                                 <div className="d-flex align-items-center mb-3">
//                                     <div>
//                                         <strong>Status: </strong>
//                                         {isSubscribed ? (
//                                             <span className="text-success">Subscribed</span>
//                                         ) : (
//                                             <span className="text-warning">Not subscribed</span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <p className="text-muted mb-3">
//                                     {isSubscribed 
//                                         ? 'You will receive push notifications for new requests and status updates.'
//                                         : 'Subscribe to receive push notifications for important updates.'
//                                     }
//                                 </p>

//                                 <div className="d-grid gap-2 d-md-flex justify-content-md-start">
//                                     {!isSubscribed ? (
//                                         <CButton
//                                             color="primary"
//                                             onClick={handleSubscribe}
//                                             disabled={isLoading}
//                                         >
//                                             {isLoading ? (
//                                                 <>
//                                                     <CSpinner size="sm" className="me-2" />
//                                                     Subscribing...
//                                                 </>
//                                             ) : (
//                                                 'Subscribe to Notifications'
//                                             )}
//                                         </CButton>
//                                     ) : (
//                                         <CButton
//                                             color="warning"
//                                             onClick={handleUnsubscribe}
//                                             disabled={isLoading}
//                                         >
//                                             {isLoading ? (
//                                                 <>
//                                                     <CSpinner size="sm" className="me-2" />
//                                                     Unsubscribing...
//                                                 </>
//                                             ) : (
//                                                 'Unsubscribe'
//                                             )}
//                                         </CButton>
//                                     )}

//                                     {isSubscribed && (
//                                         <CButton
//                                             color="info"
//                                             variant="outline"
//                                             onClick={testNotification}
//                                         >
//                                             Test Notification
//                                         </CButton>
//                                     )}
//                                 </div>
//                             </CCardBody>
//                         </CCard>
                        
//                         <hr />
                        
//                         <h6>What notifications will you receive?</h6>
//                         <ul className="text-muted">
//                             <li><strong>For Admin Users:</strong> New request submissions from users</li>
//                             <li><strong>For Regular Users:</strong> Status updates on your submitted requests</li>
//                             <li><strong>For All Users:</strong> Important system announcements</li>
//                         </ul>

//                         <hr />
                        
//                         <h6>Debug Information:</h6>
//                         <ul className="text-muted small">
//                             <li>Service Worker supported: {'serviceWorker' in navigator ? 'Yes' : 'No'}</li>
//                             <li>Push Manager supported: {'PushManager' in window ? 'Yes' : 'No'}</li>
//                             <li>Notification permission: {Notification?.permission || 'Unknown'}</li>
//                             <li>Access token present: {accessToken ? 'Yes' : 'No'}</li>
//                         </ul>
//                     </CCardBody>
//                 </CCard>
//             </CCol>
//         </CRow>
//     );
// };

// export default NotificationSettings;










import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CButton,
    CAlert,
    CSpinner,
} from '@coreui/react';

const NotificationSettings = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [vapidPublicKey, setVapidPublicKey] = useState(null);
    const [debugInfo, setDebugInfo] = useState('');
    
    const accessToken = useSelector(state => state.user.accessToken);

    // Check actual subscription status on component mount
 

    const addDebug = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugInfo(prev => prev + `[${timestamp}] ${message}\n`);
        console.log(`[PUSH DEBUG] ${message}`);
    };

  

    const urlBase64ToUint8Array = (base64String) => {
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
    };

    const getDeviceInfo = () => {
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
    };


       useEffect(() => {
        checkSubscriptionStatus();
    }, [accessToken]);


      const checkSubscriptionStatus = async () => {
        try {
            setIsLoading(true);
            setError(null);
            addDebug('Checking subscription status...');

            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                addDebug('Push notifications not supported');
                setIsLoading(false);
                return;
            }

            // Get VAPID public key from server
            const basePath = window.location.pathname.split('/')[1];
            const apiBasePath = basePath && basePath !== '' ? `/${basePath}` : '';
            
            try {
                const response = await fetch(`${apiBasePath}/api/push/vapid-public-key`);
                if (response.ok) {
                    const data = await response.json();
                    setVapidPublicKey(data.publicKey);
                    addDebug(`VAPID key loaded, length: ${data.publicKey.length}`);
                }
            } catch (err) {
                addDebug(`Could not fetch VAPID key: ${err.message}`);
            }

            // Check if service worker is ready and if there's an existing subscription
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            
            if (existingSubscription) {
                addDebug(`Browser subscription found: ${existingSubscription.endpoint.substring(0, 50)}...`);
                setIsSubscribed(true);
            } else {
                addDebug('No browser subscription found');
                setIsSubscribed(false);
            }

        } catch (error) {
            console.error('Failed to check subscription status:', error);
            setError('Failed to check subscription status: ' + error.message);
            addDebug(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const clearAllSubscriptions = async (apiBasePath) => {
        try {
            // Clear from backend
            await fetch(`${apiBasePath}/api/push/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': accessToken
                },
                body: JSON.stringify({ endpoint: 'CLEAR_ALL' })
            });
            addDebug('Backend subscriptions cleared');
        } catch (error) {
            addDebug(`Failed to clear backend subscriptions: ${error.message}`);
        }

        try {
            // Clear from browser
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                await existingSubscription.unsubscribe();
                addDebug('Browser subscription removed');
            }
        } catch (error) {
            addDebug(`Failed to clear browser subscription: ${error.message}`);
        }
    };

    const handleSubscribe = async () => {
    try {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setDebugInfo('');
        addDebug('Starting subscription process...');

        if (!accessToken) {
            throw new Error('User not authenticated');
        }

        // Check if push notifications are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            throw new Error('Push notifications are not supported in this browser');
        }

        // Request permission FIRST
        addDebug('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Notification permission denied');
        }
        addDebug('Permission granted');

        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';

        // Step 1: Clear all existing subscriptions
        addDebug('Clearing all existing subscriptions...');
        await clearAllSubscriptions(apiBasePath);

        // Step 2: Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Register/get service worker
        addDebug('Registering service worker...');
        const swPath = `${apiBasePath}/api/sw.js`;
        const swScope = `${apiBasePath}/`;
        
        const registration = await navigator.serviceWorker.register(swPath, {
            scope: swScope
        });
        addDebug(`Service worker registered with scope: ${registration.scope}`);

        // Step 4: Wait for service worker to be active
        addDebug('Waiting for service worker activation...');
        await navigator.serviceWorker.ready;

        let attempts = 0;
        while (attempts < 10) {
            const currentReg = await navigator.serviceWorker.ready;
            if (currentReg.active && currentReg.active.state === 'activated') {
                addDebug('Service worker is active');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        const finalRegistration = await navigator.serviceWorker.ready;
        if (!finalRegistration.active) {
            throw new Error('Service worker failed to activate after 10 seconds');
        }

        // Step 5: Get fresh VAPID key
        addDebug('Getting fresh VAPID key...');
        const response = await fetch(`${apiBasePath}/api/push/vapid-public-key`);
        if (!response.ok) {
            throw new Error('Failed to get VAPID public key');
        }
        const data = await response.json();
        const serverVapidKey = data.publicKey;
        setVapidPublicKey(serverVapidKey);
        addDebug(`VAPID key retrieved, length: ${serverVapidKey.length}`);

        // Step 6: Convert VAPID key
        const applicationServerKey = urlBase64ToUint8Array(serverVapidKey);
        addDebug('VAPID key converted to Uint8Array');

        // Step 7: Create subscription
        addDebug('Creating push subscription...');
        const newSubscription = await finalRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        addDebug(`Subscription created successfully!`);
        addDebug(`Endpoint: ${newSubscription.endpoint.substring(0, 50)}...`);
        
        // FIXED: Safely handle the subscription keys
        let subscriptionJSON;
        try {
            // Convert subscription to JSON format that includes the keys
            subscriptionJSON = newSubscription.toJSON();
            
            // Log the keys if they exist
            if (subscriptionJSON.keys) {
                if (subscriptionJSON.keys.p256dh) {
                    addDebug(`p256dh: ${subscriptionJSON.keys.p256dh.substring(0, 20)}...`);
                }
                if (subscriptionJSON.keys.auth) {
                    addDebug(`auth: ${subscriptionJSON.keys.auth.substring(0, 20)}...`);
                }
            } else {
                addDebug('Warning: Subscription keys not found in expected format');
            }
        } catch (e) {
            addDebug(`Warning: Could not extract subscription keys: ${e.message}`);
            // Use the subscription as-is
            subscriptionJSON = {
                endpoint: newSubscription.endpoint,
                expirationTime: newSubscription.expirationTime,
                keys: {
                    p256dh: newSubscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('p256dh')))) : undefined,
                    auth: newSubscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('auth')))) : undefined
                }
            };
        }

        // Step 8: Save to backend with debug flag
        addDebug('Saving subscription to backend...');
        const saveResponse = await fetch(`${apiBasePath}/api/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': accessToken
            },
            body: JSON.stringify({
                subscription: subscriptionJSON || newSubscription,
                deviceInfo: getDeviceInfo(),
                debug: true,
                timestamp: new Date().toISOString()
            })
        });

        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(`Backend save failed: ${errorData.message || 'Unknown error'}`);
        }

        const saveData = await saveResponse.json();
        addDebug(`Backend response: ${saveData.message || 'Subscription saved'}`);
        addDebug('Subscription saved to backend successfully');

        // Step 9: Verify the subscription was saved correctly
        addDebug('Verifying backend storage...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 10: Send activation message to service worker
        if (finalRegistration.active) {
            finalRegistration.active.postMessage({ 
                type: 'SUBSCRIPTION_READY',
                endpoint: newSubscription.endpoint,
                timestamp: new Date().toISOString()
            });
            addDebug('Activation message sent to service worker');
        }

        setIsSubscribed(true);
        setSuccess('Push notification subscription completed successfully! Backend and browser are now synchronized.');
        addDebug('Subscription process completed successfully');

        // Optional: Test the subscription immediately
        addDebug('Testing subscription with backend...');
        try {
            const testResponse = await fetch(`${apiBasePath}/api/push/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': accessToken
                },
                body: JSON.stringify({
                    title: 'Subscription Test',
                    body: 'Your push notifications are now active!',
                    data: { type: 'subscription_test' }
                })
            });
            
            if (testResponse.ok) {
                const testData = await testResponse.json();
                addDebug(`Test notification sent: ${testData.message}`);
            }
        } catch (testError) {
            addDebug(`Test notification failed (non-critical): ${testError.message}`);
        }

    } catch (error) {
        console.error('Subscription failed:', error);
        setError(`Subscription failed: ${error.message}`);
        addDebug(`FAILED: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};


const debugUsersAndRoles = async () => {
    addDebug('=== CHECKING USERS AND ROLES ===');
    
    try {
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        const response = await fetch(`${apiBasePath}/api/push/debug-users`, {
            headers: {
                'x-access-token': accessToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            addDebug(`Active Admins: ${data.summary.activeAdmins}`);
            addDebug(`Active Users: ${data.summary.activeUsers}`);
            addDebug(`Inactive Users: ${data.summary.inactiveUsers}`);
            addDebug(`Total Active Push Subscriptions: ${data.summary.totalActiveSubscriptions}`);
            
            addDebug(`\nYour Account:`);
            addDebug(`  Name: ${data.currentUser.name}`);
            addDebug(`  Username: ${data.currentUser.username}`);
            addDebug(`  Roles: [${data.currentUser.roles.join(', ')}]`);
            addDebug(`  Status: ${data.currentUser.status ? 'Active' : 'Inactive'}`);
            addDebug(`  Push Subscriptions: ${data.currentUser.subscriptionCount}`);
            
            if (data.sampleAdmins.length > 0) {
                addDebug(`\nSample Admin Users:`);
                data.sampleAdmins.forEach(admin => {
                    addDebug(`  - ${admin.name} (${admin.username}): ${admin.subscriptions} subscription(s)`);
                });
            }
            
            if (data.sampleUsers.length > 0) {
                addDebug(`\nSample Regular Users:`);
                data.sampleUsers.forEach(user => {
                    addDebug(`  - ${user.name} (${user.username}): ${user.subscriptions} subscription(s)`);
                });
            }
            
            addDebug('=== END DEBUG INFO ===');
            
            return data;
        } else {
            const error = await response.json();
            addDebug(`Failed to get debug info: ${error.message}`);
        }
    } catch (error) {
        addDebug(`Debug error: ${error.message}`);
    }
};

// Updated test push to admins - now using correct roles array
const testPushToAdmins = async () => {
    addDebug('Testing push to admin users...');
    
    try {
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        // First check how many admins exist
        await debugUsersAndRoles();
        
        const response = await fetch(`${apiBasePath}/api/push/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': accessToken
            },
            body: JSON.stringify({
                role: 'admin',  // lowercase 'admin' as in your enum
                message: {
                    title: 'Test: New Embassy Request',
                    body: `Test notification sent to all admin users`,
                    icon: '/zbss/favicon.ico',
                    badge: '/zbss/favicon.ico',
                    data: {
                        type: 'new_request',
                        requestType: 'Embassy',
                        requestId: 'test-' + Date.now(),
                        url: '/admin/approval'
                    }
                }
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addDebug(`✓ Push sent: ${data.message}`);
            if (data.sentCount !== undefined) {
                addDebug(`  Notifications sent: ${data.sentCount}`);
            }
            if (data.usersReached !== undefined) {
                addDebug(`  Users with subscriptions: ${data.usersReached}`);
            }
            if (data.usersWithoutSubscriptions !== undefined) {
                addDebug(`  Users without subscriptions: ${data.usersWithoutSubscriptions}`);
            }
            if (data.totalUsers !== undefined) {
                addDebug(`  Total admin users found: ${data.totalUsers}`);
            }
            setSuccess('Test push sent to all admin users!');
        } else {
            addDebug(`✗ Push failed: ${data.message}`);
            setError(`Push failed: ${data.message}`);
        }
        
    } catch (error) {
        addDebug(`Admin push error: ${error.message}`);
        setError(`Error: ${error.message}`);
    }
};

// Test push to regular users
const testPushToRegularUsers = async () => {
    addDebug('Testing push to regular users...');
    
    try {
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        const response = await fetch(`${apiBasePath}/api/push/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': accessToken
            },
            body: JSON.stringify({
                role: 'user',  // lowercase 'user' as in your enum
                message: {
                    title: 'Status Update Test',
                    body: `Your request status has been updated`,
                    icon: '/zbss/favicon.ico',
                    badge: '/zbss/favicon.ico',
                    data: {
                        type: 'status_update',
                        status: 'Approved',
                        timestamp: new Date().toISOString()
                    }
                }
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addDebug(`✓ Push sent: ${data.message}`);
            if (data.sentCount !== undefined) {
                addDebug(`  Notifications sent: ${data.sentCount}`);
            }
            if (data.usersReached !== undefined) {
                addDebug(`  Users with subscriptions: ${data.usersReached}`);
            }
            setSuccess('Test push sent to all regular users!');
        } else {
            addDebug(`✗ Push failed: ${data.message}`);
            setError(`Push failed: ${data.message}`);
        }
        
    } catch (error) {
        addDebug(`User push error: ${error.message}`);
        setError(`Error: ${error.message}`);
    }
};


const verifyVAPIDKeys = async () => {
    addDebug('=== VAPID KEY VERIFICATION ===');
    
    let subscriptionJSON = null; // Declare it here so it's available throughout the function
    
    try {
        // 1. Get VAPID key from backend
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        const response = await fetch(`${apiBasePath}/api/push/vapid-public-key`);
        const data = await response.json();
        const backendVapidKey = data.publicKey;
        
        addDebug(`Backend VAPID Key: ${backendVapidKey}`);
        addDebug(`Backend VAPID Key length: ${backendVapidKey.length}`);
        
        // 2. Get current subscription's application server key
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            // Try to extract the application server key from the subscription
            subscriptionJSON = subscription.toJSON();
            addDebug(`Current subscription endpoint: ${subscription.endpoint.substring(0, 50)}...`);
            
            // Note: We can't directly read the applicationServerKey from an existing subscription
            // but we can check if the subscription has keys
            if (subscriptionJSON.keys) {
                addDebug('✓ Subscription has encryption keys');
                addDebug(`  - p256dh present: ${!!subscriptionJSON.keys.p256dh}`);
                addDebug(`  - auth present: ${!!subscriptionJSON.keys.auth}`);
            } else {
                addDebug('✗ WARNING: Subscription missing encryption keys!');
            }
        } else {
            addDebug('No active subscription found');
        }
        
        // 3. The VAPID key that SHOULD be used everywhere
        const EXPECTED_VAPID_KEY = 'BCjhVW-IiwCl1sRwbNSinpoexhB0OZS0yisN80aPfTFSD0kjiCvYv0FP9tVhW-uu-2BtAr02QxHqWkweIbh5sys';
        
        if (backendVapidKey === EXPECTED_VAPID_KEY) {
            addDebug('✓ Backend VAPID key matches expected key');
        } else {
            addDebug('✗ Backend VAPID key DOES NOT match expected key!');
            addDebug(`Expected: ${EXPECTED_VAPID_KEY}`);
            addDebug(`Got: ${backendVapidKey}`);
            addDebug('This mismatch will cause push notifications to fail!');
        }
        
        // 4. Check stored VAPID key in component state
        if (vapidPublicKey) {
            addDebug(`Component state VAPID: ${vapidPublicKey.substring(0, 20)}...`);
            if (vapidPublicKey === EXPECTED_VAPID_KEY) {
                addDebug('✓ Component VAPID matches expected');
            } else {
                addDebug('✗ Component VAPID mismatch!');
            }
        }
        
        // 5. Summary - Fixed: Now subscriptionJSON is defined
        addDebug('=== VERIFICATION SUMMARY ===');
        if (subscriptionJSON && subscriptionJSON.keys) {
            addDebug('✓ Subscription structure looks good');
        } else {
            addDebug('✗ Subscription structure has issues');
        }
        
        if (backendVapidKey === EXPECTED_VAPID_KEY) {
            addDebug('✓ VAPID keys configured correctly');
        } else {
            addDebug('✗ VAPID key mismatch - fix backend configuration');
        }
        
    } catch (error) {
        addDebug(`VAPID verification error: ${error.message}`);
    }
    
    addDebug('=== END VAPID VERIFICATION ===');
};



    const handleUnsubscribe = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setDebugInfo('');
            addDebug('Starting unsubscribe process...');

            if (!accessToken) {
                throw new Error('User not authenticated');
            }

            const basePath = window.location.pathname.split('/')[1];
            const apiBasePath = basePath ? `/${basePath}` : '';

            await clearAllSubscriptions(apiBasePath);

            setIsSubscribed(false);
            setSuccess('Successfully unsubscribed from push notifications!');
            addDebug('Unsubscribe completed successfully');

        } catch (error) {
            console.error('Unsubscription failed:', error);
            setError(error.message);
            addDebug(`Unsubscribe failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const testNotification = () => {
        addDebug('Testing local notification...');
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Test Notification', {
                body: 'This is a local test notification from browser!',
                icon: '/zbss/favicon.ico',
                requireInteraction: true
            });
            addDebug('Local test notification sent');
        } else {
            setError('Notifications not permitted or not supported');
            addDebug('Test failed - notifications not permitted');
        }
    };

    const testServiceWorker = async () => {
        try {
            addDebug('Testing service worker push...');
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
                // Send test message to service worker
                registration.active.postMessage({ 
                    type: 'TEST_PUSH',
                    timestamp: new Date().toISOString()
                });
                addDebug('Test message sent to service worker');
            } else {
                addDebug('No active service worker found');
            }
        } catch (error) {
            addDebug(`Service worker test failed: ${error.message}`);
        }
    };





const testBackendNotification = async () => {
    addDebug('Starting backend notification test...');
    
    try {
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        // Get current user info
        const userRole = localStorage.getItem('userRole') || 'user';
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        );
        
        // Based on your error, the backend expects role and message parameters
        // Let's try the format your backend seems to expect
        const fetchPromise = fetch(`${apiBasePath}/api/push/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': accessToken
            },
            body: JSON.stringify({
                role: userRole,  // Send to current user's role
                message: {
                    title: 'Test Push Notification',
                    body: `Test notification sent at ${new Date().toLocaleTimeString()}`,
                    icon: '/zbss/favicon.ico',
                    badge: '/zbss/favicon.ico',
                    data: { 
                        type: 'test',
                        timestamp: new Date().toISOString()
                    }
                }
            })
        });
        
        // Race between timeout and fetch
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            const errorData = await response.json();
            addDebug(`Backend test failed: ${errorData.message || response.statusText}`);
            
            // If the endpoint doesn't exist, try the test endpoint instead
            if (response.status === 404 || errorData.message?.includes('Role and message are required')) {
                addDebug('Trying alternative test endpoint...');
                
                const testResponse = await fetch(`${apiBasePath}/api/push/test-notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': accessToken
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem('userId') || 'current',
                        title: 'Test Push Notification',
                        body: `Test at ${new Date().toLocaleTimeString()}`,
                        data: { type: 'test' }
                    })
                });
                
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    addDebug(`Alternative endpoint response: ${testData.message}`);
                    setSuccess('Test notification sent via alternative endpoint');
                    return;
                }
            }
            
            setError(`Test failed: ${errorData.message}`);
            return;
        }
        
        const data = await response.json();
        addDebug(`Backend response: ${data.message}`);
        
        if (data.results) {
            data.results.forEach((result, index) => {
                if (result.success) {
                    addDebug(`✓ Device ${index + 1}: Sent successfully`);
                } else {
                    addDebug(`✗ Device ${index + 1}: Failed - ${result.error}`);
                }
            });
        }
        
        if (data.error === false || data.success === true) {
            setSuccess('Test notification sent! You should receive it within a few seconds.');
            addDebug('Test completed successfully - check for notification');
            
            // Listen for the notification to confirm receipt
            if ('serviceWorker' in navigator) {
                const messageHandler = (event) => {
                    if (event.data && event.data.type === 'NOTIFICATION_SHOWN') {
                        addDebug('✓ Notification confirmed shown by service worker!');
                        navigator.serviceWorker.removeEventListener('message', messageHandler);
                    }
                };
                navigator.serviceWorker.addEventListener('message', messageHandler);
                
                // Remove listener after 30 seconds
                setTimeout(() => {
                    navigator.serviceWorker.removeEventListener('message', messageHandler);
                }, 30000);
            }
        } else {
            setError('Test failed - check logs for details');
        }
        
    } catch (error) {
        if (error.message.includes('timeout')) {
            addDebug(`Test request timed out after 10 seconds`);
            setError('Test request timed out - backend might be slow or unavailable');
        } else {
            addDebug(`Test error: ${error.message}`);
            setError(`Test error: ${error.message}`);
        }
    }
};

// Also add this function to manually trigger a service worker notification (for testing)
const testServiceWorkerDirectly = () => {
    addDebug('Sending test message directly to service worker...');
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Send a message to trigger a local notification from the service worker
        navigator.serviceWorker.controller.postMessage({
            type: 'TEST_PUSH',
            timestamp: new Date().toISOString()
        });
        addDebug('Test message sent to service worker');
        setSuccess('Service worker should show a test notification');
    } else {
        addDebug('No active service worker controller found');
        setError('Service worker not available or not controlling this page');
    }
};



   const debugSubscription = async () => {
    try {
        addDebug('=== SUBSCRIPTION DEBUG ===');
        
        // Check browser subscription
        const registration = await navigator.serviceWorker.ready;
        const browserSub = await registration.pushManager.getSubscription();
        
        if (browserSub) {
            addDebug(`Browser endpoint: ${browserSub.endpoint}`);
            
            // Safely get subscription keys using toJSON()
            try {
                const subJSON = browserSub.toJSON();
                if (subJSON && subJSON.keys) {
                    addDebug(`Browser p256dh: ${subJSON.keys.p256dh}`);
                    addDebug(`Browser auth: ${subJSON.keys.auth}`);
                } else {
                    addDebug('Browser subscription keys not accessible');
                }
            } catch (e) {
                addDebug(`Could not extract browser keys: ${e.message}`);
            }
        } else {
            addDebug('No browser subscription found');
        }
        
        // Check backend subscription
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        try {
            const response = await fetch(`${apiBasePath}/api/push/subscriptions`, {
                headers: {
                    'x-access-token': accessToken
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                addDebug(`Backend subscriptions: ${data.subscriptions?.length || 0}`);
                if (data.subscriptions?.length > 0) {
                    const backendSub = data.subscriptions[0];
                    addDebug(`Backend endpoint: ${backendSub.endpoint || 'N/A'}`);
                    addDebug(`Backend has keys: p256dh=${backendSub.hasKeys?.p256dh}, auth=${backendSub.hasKeys?.auth}`);
                    addDebug(`Backend device: ${backendSub.deviceInfo}`);
                    addDebug(`Backend active: ${backendSub.active}`);
                }
            } else {
                addDebug(`Backend check failed: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            addDebug(`Backend check error: ${err.message}`);
        }
        
        addDebug('=== DEBUG COMPLETE ===');
    } catch (error) {
        addDebug(`Debug failed: ${error.message}`);
    }
};


const testManualPush = async () => {
    addDebug('Starting manual push test (simulating Embassy notification)...');
    
    try {
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        // This simulates what happens when an Embassy request is created
        // It should send a push notification to admins
        const response = await fetch(`${apiBasePath}/api/push/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': accessToken
            },
            body: JSON.stringify({
                role: 'admin',  // Send to all admins (or change to 'user' to send to yourself)
                message: {
                    title: 'Test: New Embassy Request',
                    body: `Test User has submitted a new Embassy request`,
                    icon: '/zbss/favicon.ico',
                    badge: '/zbss/favicon.ico',
                    data: {
                        type: 'new_request',
                        requestType: 'Embassy',
                        requestId: 'test-' + Date.now(),
                        url: '/admin/approval'
                    }
                }
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addDebug(`Push sent successfully: ${data.message}`);
            addDebug(`Sent to ${data.sentCount || 0} users`);
            setSuccess('Test push notification sent to admins!');
        } else {
            addDebug(`Push failed: ${data.message}`);
            setError(`Push failed: ${data.message}`);
        }
        
    } catch (error) {
        addDebug(`Manual push error: ${error.message}`);
        setError(`Error: ${error.message}`);
    }
};

// Also add this function to test sending to yourself specifically
const testSendToMe = async () => {
    addDebug('Testing push notification to current user...');
    
    try {
        const basePath = window.location.pathname.split('/')[1];
        const apiBasePath = basePath ? `/${basePath}` : '';
        
        // First, check if we have subscriptions
        const subResponse = await fetch(`${apiBasePath}/api/push/subscriptions`, {
            headers: {
                'x-access-token': accessToken
            }
        });
        
        if (subResponse.ok) {
            const subData = await subResponse.json();
            addDebug(`You have ${subData.subscriptions?.length || 0} subscription(s)`);
            
            if (subData.subscriptions?.length > 0) {
                // Now send a test notification directly to your user ID
                const response = await fetch(`${apiBasePath}/api/push/send-to-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': accessToken
                    },
                    body: JSON.stringify({
                        userId: 'me',  // Special keyword for current user
                        message: {
                            title: 'Direct Test Notification',
                            body: 'This is a direct test to your account',
                            icon: '/zbss/favicon.ico',
                            data: { type: 'direct_test' }
                        }
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    addDebug(`Direct push sent: ${data.message}`);
                    setSuccess('Direct notification sent to your devices!');
                } else {
                    const error = await response.json();
                    addDebug(`Direct push failed: ${error.message}`);
                }
            } else {
                addDebug('No subscriptions found - please subscribe first');
                setError('No push subscriptions found for your account');
            }
        }
        
    } catch (error) {
        addDebug(`Send to me error: ${error.message}`);
        setError(`Error: ${error.message}`);
    }
};


    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Notification Settings</strong>
                    </CCardHeader>
                    <CCardBody>
                        <p className="text-muted">
                            Manage your push notification preferences below. When enabled, you'll receive 
                            real-time notifications for important updates even when the application is closed.
                        </p>
                        
                        {/* Push Notification Manager */}
                        <CCard className="mb-4">
                            <CCardHeader>
                                <strong>Push Notifications</strong>
                            </CCardHeader>
                            <CCardBody>
                                {error && (
                                    <CAlert 
                                        color="danger" 
                                        dismissible
                                        onClose={() => setError(null)}
                                    >
                                        {error}
                                    </CAlert>
                                )}

                                {success && (
                                    <CAlert 
                                        color="success" 
                                        dismissible
                                        onClose={() => setSuccess(null)}
                                    >
                                        {success}
                                    </CAlert>
                                )}

                                {isLoading && !isSubscribed && !error ? (
                                    <div className="text-center p-3">
                                        <CSpinner color="primary" />
                                        <div className="mt-2">Processing subscription...</div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="d-flex align-items-center mb-3">
                                            <div>
                                                <strong>Status: </strong>
                                                {isSubscribed ? (
                                                    <span className="text-success">Subscribed ✓</span>
                                                ) : (
                                                    <span className="text-warning">Not subscribed</span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-muted mb-3">
                                            {isSubscribed 
                                                ? 'You will receive push notifications for new requests and status updates, even when this app is closed.'
                                                : 'Subscribe to receive push notifications for important updates.'
                                            }
                                        </p>

                                        <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-3">
                                            {!isSubscribed ? (
                                                <CButton
                                                    color="primary"
                                                    onClick={handleSubscribe}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <CSpinner size="sm" className="me-2" />
                                                            Subscribing...
                                                        </>
                                                    ) : (
                                                        'Subscribe to Notifications'
                                                    )}
                                                </CButton>
                                            ) : (
                                                <CButton
                                                    color="warning"
                                                    onClick={handleUnsubscribe}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <CSpinner size="sm" className="me-2" />
                                                            Unsubscribing...
                                                        </>
                                                    ) : (
                                                        'Unsubscribe'
                                                    )}
                                                </CButton>
                                            )}

                                            <CButton
                                                color="secondary"
                                                variant="outline"
                                                onClick={checkSubscriptionStatus}
                                                disabled={isLoading}
                                            >
                                                Refresh Status
                                            </CButton>
                                        </div>

                                        {/* Test Buttons */}
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-3">
                                            {/* <CButton
        color="info"
        variant="outline"
        onClick={testNotification}
        size="sm"
    >
        Test Local Notification
    </CButton>
    
    <CButton
        color="info"
        variant="outline"
        onClick={testServiceWorkerDirectly}
        size="sm"
    >
        Test Service Worker Direct
    </CButton>
    
    <CButton
        color="success"
        variant="outline"
        onClick={testBackendNotification}
        size="sm"
        disabled={!isSubscribed || !accessToken}
    >
        Test Backend Push
    </CButton>

    <CButton
        color="info"
        variant="outline"
        onClick={debugSubscription}
        size="sm"
    >
        Debug Subscription
    </CButton>


     <CButton
        color="primary"
        variant="outline"
        onClick={testManualPush}
        size="sm"
        disabled={!isSubscribed || !accessToken}
    >
        Test Push to Admins
    </CButton>
    
    <CButton
        color="success"
        variant="outline"
        onClick={testSendToMe}
        size="sm"
        disabled={!isSubscribed || !accessToken}
    >
        Test Push to Me
    </CButton> */}



    <CButton
        color="info"
        variant="outline"
        onClick={testNotification}
        size="sm"
    >
        Test Local
    </CButton>
    
    <CButton
        color="success"
        variant="outline"
        onClick={testSendToMe}
        size="sm"
        disabled={!isSubscribed || !accessToken}
    >
        Push to Me
    </CButton>
    
    <CButton
        color="primary"
        variant="outline"
        onClick={testPushToAdmins}
        size="sm"
        disabled={!isSubscribed || !accessToken}
    >
        Push to Admins
    </CButton>
    
    <CButton
        color="primary"
        variant="outline"
        onClick={testPushToRegularUsers}
        size="sm"
        disabled={!isSubscribed || !accessToken}
    >
        Push to Users
    </CButton>
    
    <CButton
        color="warning"
        variant="outline"
        onClick={debugUsersAndRoles}
        size="sm"
    >
        Debug Users
    </CButton>
    
    <CButton
        color="info"
        variant="outline"
        onClick={debugSubscription}
        size="sm"
    >
        Debug Sub
    </CButton>
    
    
    <CButton
        color="warning"
        variant="outline"
        onClick={verifyVAPIDKeys}
        size="sm"
    >
        Verify VAPID Keys
    </CButton>
                                        </div>

                                        {/* Debug Information */}
                                        {debugInfo && (
                                            <div className="mt-3">
                                                <small className="text-muted">Debug Log:</small>
                                                <pre style={{
                                                    background: '#f8f9fa',
                                                    padding: '10px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto'
                                                }}>
                                                    {debugInfo}
                                                </pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CCardBody>
                        </CCard>
                        
                        <hr />
                        
                        <h6>What notifications will you receive?</h6>
                        <ul className="text-muted">
                            <li><strong>For Admin Users:</strong> New request submissions from users</li>
                            <li><strong>For Regular Users:</strong> Status updates on your submitted requests</li>
                            <li><strong>For All Users:</strong> Important system announcements</li>
                        </ul>

                        <hr />
                        
                        <h6>Technical Information:</h6>
                        <ul className="text-muted small">
                            <li>Service Worker supported: {'serviceWorker' in navigator ? 'Yes' : 'No'}</li>
                            <li>Push Manager supported: {'PushManager' in window ? 'Yes' : 'No'}</li>
                            <li>Notification permission: {Notification?.permission || 'Unknown'}</li>
                            <li>Access token present: {accessToken ? 'Yes' : 'No'}</li>
                            <li>VAPID key loaded: {vapidPublicKey ? 'Yes' : 'No'}</li>
                            <li>VAPID key length: {vapidPublicKey?.length || 'N/A'}</li>
                        </ul>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default NotificationSettings;
