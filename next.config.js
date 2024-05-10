/** @type {import('next').NextConfig} */
let nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'react-dom/server',
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/experimental',
    });
    return config;
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
nextConfig = withBundleAnalyzer(nextConfig)

module.exports = nextConfig;
