/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, 
  },
  webpack(config) {
    config.ignoreWarnings = [
      warning =>
        warning.message.includes(
          'Critical dependency: the request of a dependency is an expression'
        ) &&
        warning.module?.resource?.includes('realtime-js')
    ];
    return config;
  },
}

export default nextConfig

