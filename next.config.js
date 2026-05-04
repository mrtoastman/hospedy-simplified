/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/demo', destination: '/demo.html' },
      { source: '/admin-panel', destination: '/admin.html' },
    ];
  },
};

module.exports = nextConfig;
