// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import PushNotificationUtil from '../utils/pushNotificationUtil';
// import {
//     CButton,
//     CAlert,
//     CCard,
//     CCardBody,
//     CCardHeader,
//     CSpinner,
//     CToast,
//     CToastBody,
//     CToastHeader,
//     CToaster
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilBell, cilBellExclamation } from '@coreui/icons';

// const PushNotificationManager = () => {
//     const [isSubscribed, setIsSubscribed] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);
//     const [isSupported, setIsSupported] = useState(false);
//     const [toast, addToast] = useState(0);

//     const accessToken = useSelector(state => state.user.accessToken);

//     useEffect(() => {
//         initializePushNotifications();
//     }, []);

//     const initializePushNotifications = async () => {
//         try {
//             setIsLoading(true);
            
//             // Initialize push notification utility
//             const initialized = await PushNotificationUtil.initialize();
//             setIsSupported(initialized);

//             if (initialized) {
//                 // Check current subscription status
//                 const subscribed = await PushNotificationUtil.isSubscribed();
//                 setIsSubscribed(subscribed);
//             }

//         } catch (error) {
//             console.error('Failed to initialize push notifications:', error);
//             setError('Failed to initialize push notifications');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSubscribe = async () => {
//         try {
//             setIsLoading(true);
//             setError(null);

//             if (!accessToken) {
//                 throw new Error('User not authenticated');
//             }

//             await PushNotificationUtil.subscribe(accessToken);
//             setIsSubscribed(true);
//             setSuccess('Successfully subscribed to push notifications!');

//             // Add success toast
//             addToast(() => (
//                 <CToast key={Date.now()}>
//                     <CToastHeader closeButton>
//                         <CIcon icon={cilBell} className="rounded me-2" />
//                         <div className="fw-bold me-auto">Push Notifications</div>
//                     </CToastHeader>
//                     <CToastBody>Successfully subscribed to notifications!</CToastBody>
//                 </CToast>
//             ));

//         } catch (error) {
//             console.error('Subscription failed:', error);
//             setError(error.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleUnsubscribe = async () => {
//         try {
//             setIsLoading(true);
//             setError(null);

//             if (!accessToken) {
//                 throw new Error('User not authenticated');
//             }

//             await PushNotificationUtil.unsubscribe(accessToken);
//             setIsSubscribed(false);
//             setSuccess('Successfully unsubscribed from push notifications!');

//             // Add success toast
//             addToast(() => (
//                 <CToast key={Date.now()}>
//                     <CToastHeader closeButton>
//                         <CIcon icon={cilBellExclamation} className="rounded me-2" />
//                         <div className="fw-bold me-auto">Push Notifications</div>
//                     </CToastHeader>
//                     <CToastBody>Successfully unsubscribed from notifications!</CToastBody>
//                 </CToast>
//             ));

//         } catch (error) {
//             console.error('Unsubscription failed:', error);
//             setError(error.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const testNotification = async () => {
//         try {
//             await PushNotificationUtil.showLocalNotification(
//                 'Test Notification',
//                 {
//                     body: 'This is a test notification to check if everything is working!',
//                     icon: '/favicon.ico',
//                     requireInteraction: true
//                 }
//             );
//         } catch (error) {
//             console.error('Test notification failed:', error);
//             setError('Test notification failed');
//         }
//     };

//     if (!isSupported) {
//         return (
//             <CCard className="mb-4">
//                 <CCardHeader>
//                     <strong>Push Notifications</strong>
//                 </CCardHeader>
//                 <CCardBody>
//                     <CAlert color="warning">
//                         Push notifications are not supported in this browser.
//                     </CAlert>
//                 </CCardBody>
//             </CCard>
//         );
//     }

//     return (
//         <>
//             <CCard className="mb-4">
//                 <CCardHeader>
//                     <strong>Push Notifications</strong>
//                 </CCardHeader>
//                 <CCardBody>
//                     {error && (
//                         <CAlert 
//                             color="danger" 
//                             dismissible
//                             onClose={() => setError(null)}
//                         >
//                             {error}
//                         </CAlert>
//                     )}

//                     {success && (
//                         <CAlert 
//                             color="success" 
//                             dismissible
//                             onClose={() => setSuccess(null)}
//                         >
//                             {success}
//                         </CAlert>
//                     )}

//                     <div className="d-flex align-items-center mb-3">
//                         <CIcon 
//                             icon={isSubscribed ? cilBell : cilBellExclamation} 
//                             size="xl" 
//                             className="me-3" 
//                         />
//                         <div>
//                             <strong>Status: </strong>
//                             {isSubscribed ? (
//                                 <span className="text-success">Subscribed</span>
//                             ) : (
//                                 <span className="text-warning">Not subscribed</span>
//                             )}
//                         </div>
//                     </div>

//                     <p className="text-muted mb-3">
//                         {isSubscribed 
//                             ? 'You will receive push notifications for new requests and status updates.'
//                             : 'Subscribe to receive push notifications for important updates.'
//                         }
//                     </p>

//                     <div className="d-grid gap-2 d-md-flex justify-content-md-start">
//                         {!isSubscribed ? (
//                             <CButton
//                                 color="primary"
//                                 onClick={handleSubscribe}
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <CSpinner size="sm" className="me-2" />
//                                         Subscribing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <CIcon icon={cilBell} className="me-2" />
//                                         Subscribe to Notifications
//                                     </>
//                                 )}
//                             </CButton>
//                         ) : (
//                             <CButton
//                                 color="warning"
//                                 onClick={handleUnsubscribe}
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <CSpinner size="sm" className="me-2" />
//                                         Unsubscribing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <CIcon icon={cilBellExclamation} className="me-2" />
//                                         Unsubscribe
//                                     </>
//                                 )}
//                             </CButton>
//                         )}

//                         {isSubscribed && (
//                             <CButton
//                                 color="info"
//                                 variant="outline"
//                                 onClick={testNotification}
//                             >
//                                 Test Notification
//                             </CButton>
//                         )}
//                     </div>
//                 </CCardBody>
//             </CCard>

//             <CToaster ref={toast} push={toast} placement="top-end" />
//         </>
//     );
// };

// export default PushNotificationManager;


import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PushNotificationUtil from '../utils/pushNotificationUtil';
import {
    CButton,
    CAlert,
    CCard,
    CCardBody,
    CCardHeader,
    CSpinner,
} from '@coreui/react';

const PushNotificationManager = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    const accessToken = useSelector(state => state.user.accessToken);

    useEffect(() => {
        console.log('PushNotificationManager component mounted');
        initializePushNotifications();
    }, []);

    const initializePushNotifications = async () => {
        try {
            setIsLoading(true);
            
            // Don't initialize again if already done in DefaultLayout
            // Just check current subscription status
            const supported = 'serviceWorker' in navigator && 'PushManager' in window;
            setIsSupported(supported);

            if (supported) {
                // Check current subscription status without initializing again
                const subscribed = await PushNotificationUtil.isSubscribed();
                setIsSubscribed(subscribed);
                console.log('Current subscription status:', subscribed);
            }

        } catch (error) {
            console.error('Failed to check push notification status:', error);
            setError('Failed to check push notification status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!accessToken) {
                throw new Error('User not authenticated');
            }

            await PushNotificationUtil.subscribe(accessToken);
            setIsSubscribed(true);
            setSuccess('Successfully subscribed to push notifications!');

        } catch (error) {
            console.error('Subscription failed:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!accessToken) {
                throw new Error('User not authenticated');
            }

            await PushNotificationUtil.unsubscribe(accessToken);
            setIsSubscribed(false);
            setSuccess('Successfully unsubscribed from push notifications!');

        } catch (error) {
            console.error('Unsubscription failed:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const testNotification = async () => {
        try {
            await PushNotificationUtil.showLocalNotification(
                'Test Notification',
                {
                    body: 'This is a test notification to check if everything is working!',
                    icon: '/zbss/favicon.ico',
                    requireInteraction: true
                }
            );
        } catch (error) {
            console.error('Test notification failed:', error);
            setError('Test notification failed');
        }
    };

    console.log('PushNotificationManager render - isSupported:', isSupported, 'isLoading:', isLoading);

    if (!isSupported) {
        return (
            <CCard className="mb-4">
                <CCardHeader>
                    <strong>Push Notifications</strong>
                </CCardHeader>
                <CCardBody>
                    <CAlert color="warning">
                        Push notifications are not supported in this browser.
                    </CAlert>
                </CCardBody>
            </CCard>
        );
    }

    return (
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

                <div className="d-flex align-items-center mb-3">
                    <div>
                        <strong>Status: </strong>
                        {isSubscribed ? (
                            <span className="text-success">Subscribed</span>
                        ) : (
                            <span className="text-warning">Not subscribed</span>
                        )}
                    </div>
                </div>

                <p className="text-muted mb-3">
                    {isSubscribed 
                        ? 'You will receive push notifications for new requests and status updates.'
                        : 'Subscribe to receive push notifications for important updates.'
                    }
                </p>

                <div className="d-grid gap-2 d-md-flex justify-content-md-start">
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

                    {isSubscribed && (
                        <CButton
                            color="info"
                            variant="outline"
                            onClick={testNotification}
                        >
                            Test Notification
                        </CButton>
                    )}
                </div>
            </CCardBody>
        </CCard>
    );
};

export default PushNotificationManager;