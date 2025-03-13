'use client'

export default function ScanResult({ result, onScanAgain }) {
  // Check if the result is a URL
  const isUrl = (text) => {
    try {
      new URL(text)
      return true
    } catch (e) {
      return false
    }
  }

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.text)
        .then(() => {
          alert('Copied to clipboard!')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
        })
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = result.text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        alert('Copied to clipboard!')
      } catch (err) {
        console.error('Could not copy text: ', err)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Scan Result</h2>
      
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-1">Format</div>
        <div className="font-medium">{result.format}</div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-1">Scanned Content</div>
        <div className="p-3 bg-gray-100 rounded-md break-all overflow-x-auto">{result.text}</div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <button 
          onClick={handleCopy}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Copy to Clipboard
        </button>
        
        {isUrl(result.text) && (
          <a 
            href={result.text}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-center"
          >
            Open URL
          </a>
        )}
        
        <button 
          onClick={onScanAgain}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
        >
          Scan Again
        </button>
      </div>
    </div>
  )
}