/** @type {import('next').NextConfig} */
let nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'react-dom/server',
    ]
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
nextConfig = withBundleAnalyzer(nextConfig)

module.exports = nextConfig;
