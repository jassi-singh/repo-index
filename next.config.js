/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    auth: "YOUR GITHUB TOKEN",
  },
};

module.exports = nextConfig;
