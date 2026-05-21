import path from 'path';
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Utilise le répertoire de travail actuel comme racine Turbopack
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
