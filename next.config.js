/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Adiciona configuração para aceitar hosts externos
  webSocketServerOptions: {
    host: '0.0.0.0',
  },
}

module.exports = nextConfig 