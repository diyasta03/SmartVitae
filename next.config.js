/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'randomuser.me'],
  },
  api: {
    bodyParser: false,
  },
   output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  }
};

module.exports = nextConfig;

