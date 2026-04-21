/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'nftstorage.link' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      path: false,
      crypto: false,
    };
    // Suppress pino-pretty warning from WalletConnect
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;
