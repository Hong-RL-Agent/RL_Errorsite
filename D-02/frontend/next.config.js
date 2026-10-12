/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9802/api/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
