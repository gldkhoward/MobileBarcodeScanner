'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BarcodeScanner from '../../components/BarcodeScanner'
import ScanResult from '../../components/ScanResult'

export default function ScannerPage() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const router = useRouter()
  
  // Detect device type for optimizations
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
    setIsAndroid(/android/i.test(userAgent));
  }, [])

  // Handle loading state and iOS-specific optimizations
  useEffect(() => {
    // Give time for the camera to initialize (longer on iOS)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, isIOS ? 2500 : 1500)
    
    // iOS specific handling - prevent screen from sleeping during scanning
    if (isIOS) {
      // Request no sleep if available
      if (navigator.wakeLock) {
        navigator.wakeLock.request('screen')
          .catch(err => console.log('Wake Lock error:', err));
      }
      
      // Prevent scrolling/bouncing on iOS
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
    
    return () => {
      clearTimeout(timer);
      // Restore normal scrolling when component unmounts
      if (isIOS) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    }
  }, [isIOS])

  // Handle barcode scan result
  const handleResult = (decodedResult) => {
    setResult({
      text: decodedResult.getText(),
      format: decodedResult.getBarcodeFormat().toString(),
      timestamp: new Date().toISOString()
    })
    
    // Vibrate if supported (provides feedback when scan is successful)
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  }

  // Handle errors
  const handleError = (err) => {
    console.error('Scanner error:', err)
    setError(err)
  }

  // Reset scan result to scan again
  const handleScanAgain = () => {
    setResult(null)
    setError(null)
  }

  // Go back to home page
  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4">
        <button 
          onClick={handleBack}
          className="flex items-center text-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </header>

      <main className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Barcode Scanner</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Starting camera...</p>
          </div>
        ) : result ? (
          <ScanResult result={result} onScanAgain={handleScanAgain} />
        ) : (
          <>
            <p className="text-center mb-6">
              Position the barcode within the frame to scan
            </p>
            <BarcodeScanner onResult={handleResult} onError={handleError} />
            
            {/* Device-specific help text */}
            {isIOS && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                <p className="font-semibold">iOS Tips:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Make sure you allowed camera access</li>
                  <li>Good lighting improves scanning</li>
                  <li>Tap the screen to focus on barcodes</li>
                  <li>Hold the camera steady</li>
                </ul>
              </div>
            )}
            
            {isAndroid && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                <p className="font-semibold">Android Tips:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Hold steady 4-8 inches from barcode</li>
                  <li>Tap directly on the barcode to focus</li>
                  <li>Try in good lighting conditions</li>
                  <li>Works with both QR and traditional barcodes</li>
                </ul>
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg w-full max-w-lg">
                <h3 className="font-semibold">Error</h3>
                <p>{error.message || 'Failed to initialize scanner'}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}