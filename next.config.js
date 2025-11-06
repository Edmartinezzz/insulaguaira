/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Desactivar Turbopack temporalmente para evitar conflictos
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  
  // Configuración de webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // Acepta cualquier hostname
      },
      {
        protocol: 'https',
        hostname: '**', // Acepta cualquier hostname seguro
      },
    ],
  },
  
  // Configuración de salida
  output: 'standalone',
  
  // Configuración de transpilación
  transpilePackages: ['@prisma/client', 'prisma'],
  
  // Configuración de logging extendido (solo desarrollo)
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

module.exports = nextConfig;
