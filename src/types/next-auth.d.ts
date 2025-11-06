import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'user';
    };
  }
}

// Extiende el tipo de módulo de NodeJS para incluir variables de entorno
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      DATABASE_URL: string;
      ADMIN_EMAIL: string;
      ADMIN_PASSWORD: string;
    }
  }
}
