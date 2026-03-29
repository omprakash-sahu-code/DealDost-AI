/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Optimized for static hosting (Vercel/Netlify)
  images: {
    unoptimized: true
  }
};
export default nextConfig;
