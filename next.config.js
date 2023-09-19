require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_ENDPOINT: process.env.API_ENDPOINT,
    SPEECH_SUBSCRIPTION_KEY: process.env.SPEECH_SUBSCRIPTION_KEY,
    SPEECH_REGION: process.env.SPEECH_REGION,
    ENV_TYPE: process.env.ENV_TYPE
  }
}

module.exports = nextConfig