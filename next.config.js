/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuración experimental
  experimental: {
    // Habilitar Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
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
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  
  // Configuración de salida
  output: 'standalone',
  
  // Configuración de transpilación
  transpilePackages: ['@prisma/client'],
  
  // Configuración de paquetes externos para el servidor
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
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
