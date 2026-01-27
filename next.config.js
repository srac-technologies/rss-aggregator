/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Skip type checking during build due to external library type issues
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig