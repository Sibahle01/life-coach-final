// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
    ],
    // Add this for local images in development
    domains: ['localhost'],
    // Or uncomment this line for development:
    // unoptimized: true, // Disable image optimization for local images
  },
};

module.exports = nextConfig;