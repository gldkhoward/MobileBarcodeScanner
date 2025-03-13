'use client'

import { useEffect, useState } from 'react'

export default function ClientRootLayout({ children }) {
  const [isAndroid, setIsAndroid] = useState(false)
  
  // Detect Android for specific optimizations
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isAndroidDevice = /android/i.test(userAgent)
    setIsAndroid(isAndroidDevice)
    
    // Force light mode
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
    
    // Apply specific settings for barcode focus on Android
    if (isAndroidDevice) {
      // Override some default Android behavior
      document.addEventListener('touchstart', function(e) {
        // Prevent default behavior for scan page
        if (window.location.pathname.includes('/scanner')) {
          e.preventDefault()
        }
      }, { passive: false })
    }
  }, [])
  
  return (
    <div className={isAndroid ? 'android-device' : ''}>
      {children}
    </div>
  )
}