'use client'

import { useZxing } from 'react-zxing'
import { useState, useCallback, useEffect } from 'react'

export default function BarcodeScanner({ onResult, onError }) {
  const [constraints, setConstraints] = useState({
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 },
      // Add advanced camera constraints for focus and exposure
      advanced: [
        {
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous',
          // Add zoom constraint if devices support it
          zoom: 1.0
        }
      ]
    },
  })
  const [torch, setTorch] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)

  const {
    ref,
    torch: setTorchEnabled,
    error,
  } = useZxing({
    onDecodeResult: onResult,
    onError,
    constraints,
  })

  // Check if the device has a torch/flashlight capability
  useEffect(() => {
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

  // Toggle torch/flashlight with enhanced mobile support
  const toggleTorch = useCallback(() => {
    const newTorchState = !torch
    setTorch(newTorchState)
    
    // First try the react-zxing built-in torch method
    setTorchEnabled(newTorchState)
    
    // Backup approach for devices where the above might not work
    try {
      if (ref.current && ref.current.srcObject) {
        const videoTrack = ref.current.srcObject.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.applyConstraints === 'function') {
          videoTrack.applyConstraints({
            advanced: [{ torch: newTorchState }]
          }).catch(err => console.log('Torch control error:', err));
        }
      }
    } catch (err) {
      console.error('Failed to apply torch control:', err)
    }
  }, [torch, setTorchEnabled, ref])

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
                  focusDistance: 0.5,  // Mid-range focus distance
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
  }, [ref]);

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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-1/2 border-2 border-green-500/70 rounded"></div>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
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