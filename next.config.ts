import type { NextConfig } from 'next';

const wpUrl = process.env.NEXT_PUBLIC_WP_URL ?? 'http://rwa.local';
const wpHost = new URL(wpUrl).hostname;

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'http', hostname: wpHost },
      { protocol: 'https', hostname: wpHost },
      { protocol: 'https', hostname: 'rubywantads.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
    ],
  },
};

export default nextConfig;
