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
            }
          ]
        }
      ]
    }
  }
export default nextConfig;
