require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'backend/public',
  reactStrictMode: false
}

module.exports = nextConfig