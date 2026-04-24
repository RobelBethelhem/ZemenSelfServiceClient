import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const PushNotificationDiagnostic = () => {
    const [diagnosticInfo, setDiagnosticInfo] = useState({});
    const [logs, setLogs] = useState([]);
    const accessToken = useSelector(state => state.user.accessToken);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toISOString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
        console.log(`[PUSH DIAGNOSTIC] ${message}`);
    };

    useEffect(() => {
        // Listen for messages from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                addLog(`Service Worker message: ${JSON.stringify(event.data)}`, 'sw');
                
                if (event.data.type === 'NOTIFICATION_SHOWN') {
                    addLog(`Notification shown: ${event.data.title}`, 'success');
                } else if (event.data.type === 'SUBSCRIPTION_EXPIRED') {
                    addLog('Subscription expired, needs renewal', 'warning');
                }
            });
        }
    }, []);

    const runDiagnostics = async () => {
        setLogs([]);
        const info = {};
        
        try {
            // 1. Check browser support
            info.browserSupport = {
                serviceWorker: 'serviceWorker' in navigator,
                pushManager: 'PushManager' in window,
                notification: 'Notification' in window
            };
            addLog(`Browser support: ${JSON.stringify(info.browserSupport)}`, 'info');

            // 2. Check notification permission
            if ('Notification' in window) {
                info.notificationPermission = Notification.permission;
                addLog(`Notification permission: ${info.notificationPermission}`, 
                    info.notificationPermission === 'granted' ? 'success' : 'warning');
            }

            // 3. Check service worker registration
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                info.serviceWorkerRegistrations = registrations.length;
                info.serviceWorkerScopes = registrations.map(r => r.scope);
                addLog(`Service Workers: ${registrations.length} registered`, 'info');
                
                if (registrations.length > 0) {
                    const reg = registrations[0];
                    info.serviceWorkerState = {
                        active: !!reg.active,
                        waiting: !!reg.waiting,
                        installing: !!reg.installing
                    };
                    addLog(`SW State: ${JSON.stringify(info.serviceWorkerState)}`, 'info');
                }

                // 4. Check push subscription
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                
                if (subscription) {
                    info.hasSubscription = true;
                    info.subscriptionEndpoint = subscription.endpoint.substring(0, 50) + '...';
                    addLog('Push subscription found', 'success');
                    
                    // Get subscription details
                    const key = subscription.getKey('p256dh');
                    const authKey = subscription.getKey('auth');
                    info.subscriptionKeys = {
                        p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))).substring(0, 20) + '...' : null,
                        auth: authKey ? btoa(String.fromCharCode(...new Uint8Array(authKey))).substring(0, 20) + '...' : null
                    };
                } else {
                    info.hasSubscription = false;
                    addLog('No push subscription found', 'warning');
                }
            }

            // 5. Check backend subscription
            if (accessToken) {
                try {
                    const basePath = window.location.pathname.split('/')[1];
                    const apiBasePath = basePath ? `/${basePath}` : '';
                    
                    const response = await fetch(`${apiBasePath}/api/push/subscriptions`, {
                        headers: {
                            'x-access-token': accessToken
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        info.backendSubscriptions = data.subscriptions?.length || 0;
                        addLog(`Backend subscriptions: ${info.backendSubscriptions}`, 
                            info.backendSubscriptions > 0 ? 'success' : 'warning');
                    }
                } catch (err) {
                    addLog(`Backend check failed: ${err.message}`, 'error');
                }
            }

            // 6. Check VAPID key
            try {
                const basePath = window.location.pathname.split('/')[1];
                const apiBasePath = basePath ? `/${basePath}` : '';
                const response = await fetch(`${apiBasePath}/api/push/vapid-public-key`);
                
                if (response.ok) {
                    const data = await response.json();
                    info.vapidKeyLength = data.publicKey?.length;
                    info.vapidKeyPrefix = data.publicKey?.substring(0, 20) + '...';
                    addLog(`VAPID key loaded (length: ${info.vapidKeyLength})`, 'success');
                }
            } catch (err) {
                addLog(`VAPID key fetch failed: ${err.message}`, 'error');
            }

            setDiagnosticInfo(info);
        } catch (error) {
            addLog(`Diagnostic error: ${error.message}`, 'error');
        }
    };

    const testBackendPush = async () => {
        addLog('Testing backend push notification...', 'info');
        
        try {
            const basePath = window.location.pathname.split('/')[1];
            const apiBasePath = basePath ? `/${basePath}` : '';
            
            const response = await fetch(`${apiBasePath}/api/push/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': accessToken
                },
                body: JSON.stringify({
                    title: 'Test Push Notification',
                    body: 'This is a test notification from the backend',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                addLog(`Backend push sent: ${JSON.stringify(data)}`, 'success');
            } else {
                addLog(`Backend push failed: ${response.status}`, 'error');
            }
        } catch (error) {
            addLog(`Backend push error: ${error.message}`, 'error');
        }
    };

    const clearSubscriptions = async () => {
        addLog('Clearing all subscriptions...', 'info');
        
        try {
            // Clear browser subscription
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                addLog('Browser subscription cleared', 'success');
            }
            
            // Clear backend subscriptions
            const basePath = window.location.pathname.split('/')[1];
            const apiBasePath = basePath ? `/${basePath}` : '';
            
            await fetch(`${apiBasePath}/api/push/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': accessToken
                },
                body: JSON.stringify({ endpoint: 'CLEAR_ALL' })
            });
            
            addLog('Backend subscriptions cleared', 'success');
        } catch (error) {
            addLog(`Clear error: ${error.message}`, 'error');
        }
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'success': return '#28a745';
            case 'warning': return '#ffc107';
            case 'error': return '#dc3545';
            case 'sw': return '#6f42c1';
            default: return '#17a2b8';
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h3>Push Notification Diagnostics</h3>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={runDiagnostics}
                    style={{ 
                        marginRight: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Run Diagnostics
                </button>
                
                <button 
                    onClick={testBackendPush}
                    style={{ 
                        marginRight: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Backend Push
                </button>
                
                <button 
                    onClick={clearSubscriptions}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear All Subscriptions
                </button>
            </div>

            {Object.keys(diagnosticInfo).length > 0 && (
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <h4>Diagnostic Results:</h4>
                    <pre style={{ fontSize: '12px' }}>
                        {JSON.stringify(diagnosticInfo, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ 
                backgroundColor: '#2d2d2d', 
                color: '#f8f9fa',
                padding: '15px', 
                borderRadius: '4px',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                <h4 style={{ color: '#f8f9fa' }}>Live Logs:</h4>
                {logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
                        <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span>{' '}
                        <span style={{ color: getLogColor(log.type) }}>{log.message}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div style={{ color: '#6c757d', fontSize: '12px' }}>
                        No logs yet. Click "Run Diagnostics" to start.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PushNotificationDiagnostic;