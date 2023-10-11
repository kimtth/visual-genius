require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_ENDPOINT: process.env.API_ENDPOINT,
    MS_CLARITY_ID: process.env.MS_CLARITY_ID,
    ENV_TYPE: process.env.ENV_TYPE
  }
}

module.exports = nextConfig