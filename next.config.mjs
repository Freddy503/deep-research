/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mastra/core', '@mastra/memory', '@mastra/loggers', '@mastra/libsql'],
}

export default nextConfig
