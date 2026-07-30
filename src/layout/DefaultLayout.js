// import React from 'react'
// import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

// const DefaultLayout = () => {
//   return (
//     <div>
//       <AppSidebar />
//       <div className="wrapper d-flex flex-column min-vh-100">
//         <AppHeader />
//         <div className="body flex-grow-1">
//           <AppContent />
//         </div>
//         <AppFooter />
//       </div>
//     </div>
//   )
// }

// export default DefaultLayout

import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PushNotificationUtil from '../utils/pushNotificationUtil'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import AnnouncementGate from '../components/AnnouncementGate'

const DefaultLayout = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const userRole = useSelector((state) => state.user.role)

  // Initialize push notifications when component mounts
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        if (accessToken && userRole) {
          // Initialize push notifications
          const initialized = await PushNotificationUtil.initialize()

          if (initialized) {
            console.log('Push notifications initialized successfully')

            // Optional: Auto-subscribe users (uncomment if you want automatic subscription)
            /*
            const isSubscribed = await PushNotificationUtil.isSubscribed()
            if (!isSubscribed) {
              try {
                await PushNotificationUtil.subscribe(accessToken)
                console.log('User automatically subscribed to push notifications')
              } catch (error) {
                console.log('Auto-subscription failed, user can manually subscribe later')
              }
            }
            */
          }
        }
      } catch (error) {
        console.error('Push notification initialization failed:', error)
      }
    }

    // Only initialize if we have auth data
    if (accessToken) {
      initializePushNotifications()
    }
  }, [accessToken, userRole])

  return (
    <div>
      {/* Renders nothing unless this employee has an unseen or unacknowledged
          announcement, so it is invisible on ordinary page loads. */}
      <AnnouncementGate />
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
