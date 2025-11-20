/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mastra/core', '@mastra/memory', '@mastra/loggers', '@mastra/libsql'],
}

module.exports = nextConfig
