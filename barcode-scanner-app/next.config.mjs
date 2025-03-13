/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Add Content-Security-Policy headers to allow camera access
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; worker-src 'self' blob:;"
            },
            // Prevent caching to avoid camera permission issues
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
            },
            {
              key: 'Pragma',
              value: 'no-cache'
            },
            {
              key: 'Expires',
              value: '0'
            }
          ]
        }
      ]
    }
  }
export default nextConfig;
