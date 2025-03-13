'use client'

import { useZxing } from 'react-zxing'
import { useState, useCallback, useEffect } from 'react'

export default function BarcodeScanner({ onResult, onError }) {
  // Basic state
  const [torch, setTorch] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  
  // Camera constraints - optimized but not too aggressive
  const [constraints, setConstraints] = useState({
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 },
      advanced: [
        {
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous',
        }
      ]
    },
  })

  const {
    ref,
    torch: setTorchEnabled,
    error,
  } = useZxing({
    onDecodeResult: onResult,
    onError,
    constraints,
  })

  // Detect device type and check torch capability
  useEffect(() => {
    // Detect if device is Android
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isAndroidDevice = /android/i.test(userAgent)
    setIsAndroid(isAndroidDevice)
    
    const checkTorch = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === 'videoinput')
        
        if (cameras.length > 0) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { deviceId: cameras[0].deviceId } 
          })
          
          const track = stream.getVideoTracks()[0]
          const capabilities = track.getCapabilities()
          
          if (capabilities.torch) {
            setHasTorch(true)
          }
          
          // Clean up
          stream.getTracks().forEach(track => track.stop())
        }
      } catch (err) {
        console.error('Failed to check torch capability:', err)
      }
    }
    
    checkTorch()
  }, [])

  // Toggle torch/flashlight
  const toggleTorch = useCallback(() => {
    const newTorchState = !torch
    setTorch(newTorchState)
    setTorchEnabled(newTorchState)
  }, [torch, setTorchEnabled])

  // Switch camera
  const switchCamera = useCallback(() => {
    setConstraints((prevConstraints) => ({
      video: {
        ...prevConstraints.video,
        facingMode: prevConstraints.video.facingMode === 'environment' ? 'user' : 'environment',
      },
    }))
  }, [])

  // Handle manual focus tap
  const handleFocusTap = useCallback((e) => {
    try {
      if (ref.current && ref.current.srcObject) {
        const videoTrack = ref.current.srcObject.getVideoTracks()[0];
        
        if (videoTrack && videoTrack.getCapabilities) {
          const capabilities = videoTrack.getCapabilities();
          
          // Check if manual focus is supported
          if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
            const rect = e.target.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            videoTrack.applyConstraints({
              advanced: [
                {
                  focusMode: 'manual',
                  focusDistance: isAndroid ? 0.3 : 0.5,
                  pointsOfInterest: [{ x, y }]
                }
              ]
            }).then(() => {
              // After manual focus, return to continuous
              setTimeout(() => {
                videoTrack.applyConstraints({
                  advanced: [{ focusMode: 'continuous' }]
                }).catch(err => console.log('Return to auto focus error:', err));
              }, 2000);
            }).catch(err => console.log('Manual focus error:', err));
          }
        }
      }
    } catch (err) {
      console.error('Failed to apply manual focus:', err);
    }
  }, [ref, isAndroid]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="rounded-lg overflow-hidden relative aspect-video bg-black">
        <video 
          ref={ref} 
          className="w-full h-full object-cover"
          onClick={handleFocusTap}
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-white/30 rounded-lg"></div>
          {/* Animated focus window that transitions between rectangle and square */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-green-500 rounded animate-scan-window">
            <style jsx>{`
              @keyframes scan-pulse {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
              }
              
              @keyframes scan-morph {
                0% { width: 70%; height: 50%; }
                50% { width: 60%; height: 60%; }
                100% { width: 70%; height: 50%; }
              }
              
              .animate-scan-window {
                animation: scan-pulse 2s infinite, scan-morph 4s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
          Tap to focus
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={switchCamera}
          className="bg-gray-800 text-white p-3 rounded-full"
          aria-label="Switch camera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {hasTorch && (
          <button
            onClick={toggleTorch}
            className={`${torch ? 'bg-yellow-500' : 'bg-gray-800'} text-white p-3 rounded-full`}
            aria-label="Toggle flashlight"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mt-4">
          {error.message}
        </div>
      )}
    </div>
  )
}