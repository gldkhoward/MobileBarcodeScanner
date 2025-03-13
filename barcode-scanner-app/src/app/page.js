'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null)

  // Check if camera access is available
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (stream) {
            setHasCameraPermission(true)
            // Clean up the stream
            stream.getTracks().forEach(track => track.stop())
          }
        } else {
          setHasCameraPermission(false)
        }
      } catch (error) {
        console.error('Camera permission error:', error)
        setHasCameraPermission(false)
      }
    }

    checkCameraPermission()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="w-full max-w-xl mx-auto text-center space-y-8">
        <h1 className="text-3xl font-bold mb-6">Barcode Scanner App</h1>
        <p className="mb-8">Scan 1D and 2D barcodes using your device camera</p>
        
        {hasCameraPermission === null ? (
          <p>Checking camera permission...</p>
        ) : hasCameraPermission === false ? (
          <div className="text-red-500 mb-4">
            <p>Camera access is not available or was denied.</p>
            <p className="text-sm mt-2">Please enable camera access in your browser settings.</p>
          </div>
        ) : (
          <Link href="/scanner" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg block w-full max-w-xs mx-auto hover:bg-blue-700 transition-colors">
            Start Scanning
          </Link>
        )}
        
        <div className="mt-12 text-sm text-gray-600">
          <h2 className="text-lg font-semibold mb-2">Supported Barcode Types:</h2>
          <ul className="grid grid-cols-2 gap-2">
            <li>QR Code</li>
            <li>Code 128</li>
            <li>EAN-13</li>
            <li>EAN-8</li>
            <li>Code 39</li>
            <li>UPC-A</li>
            <li>UPC-E</li>
            <li>ITF</li>
          </ul>
        </div>
      </div>
    </main>
  )
}