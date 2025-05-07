/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'randomuser.me'],
  },
  api: {
    bodyParser: false,
  },
};

module.exports = nextConfig;
