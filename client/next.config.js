/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
}

module.exports = {
    ...nextConfig,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
};
