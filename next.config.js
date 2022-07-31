/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    auth: process.env.NEXT_PUBLIC_AUTH,
  },
};

module.exports = nextConfig;
