/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the sandbox preview proxy (and local network hosts) to load dev assets.
  allowedDevOrigins: ['*.e2b.app', '*.e2b.dev', 'localhost', '127.0.0.1', '*.local'],
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add your object-storage host here when S3/R2 is configured
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    // Shared across every route. Framing is handled separately below so the admin
    // area stays locked down while public pages remain embeddable in previews.
    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ];

    // Public marketing pages: allow framing from our own origin plus the
    // preview/dev tooling host, never from arbitrary third-party sites.
    const publicHeaders = [
      ...baseHeaders,
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'self' https: http://localhost:* http://127.0.0.1:*",
      },
    ];

    // Admin and API: never embeddable anywhere, including same-origin frames.
    const lockedHeaders = [
      ...baseHeaders,
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'none'",
      },
    ];

    return [
      { source: '/admin/:path*', headers: lockedHeaders },
      { source: '/api/:path*', headers: lockedHeaders },
      { source: '/((?!admin|api).*)', headers: publicHeaders },
      // Uploaded SVGs must never execute script in our origin
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" },
        ],
      },
      // Never index admin or API routes
      { source: '/admin/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
