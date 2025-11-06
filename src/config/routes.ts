import { Route } from 'next';

type AdminRoutes = {
  dashboard: Route<'/admin/dashboard'>;
  vehicles: Route<'/admin/vehicles'>;
  drivers: Route<'/admin/drivers'>;
  settings: Route<'/admin/settings'>;
  [key: string]: Route;
};

type UserRoutes = {
  dashboard: Route<'/user/dashboard'>;
  vehicles: Route<'/user/vehicles'>;
  profile: Route<'/user/profile'>;
  settings: Route<'/user/settings'>;
  [key: string]: Route;
};

type AuthRoutes = {
  login: Route<'/login'>;
  logout: Route<'/logout'>;
  [key: string]: Route;
};

export const adminRoutes: AdminRoutes = {
  dashboard: '/admin/dashboard',
  vehicles: '/admin/vehicles',
  drivers: '/admin/drivers',
  settings: '/admin/settings',
};

export const userRoutes: UserRoutes = {
  dashboard: '/user/dashboard',
  vehicles: '/user/vehicles',
  profile: '/user/profile',
  settings: '/user/settings',
};

export const authRoutes: AuthRoutes = {
  login: '/login',
  logout: '/logout',
};

export const routes = {
  admin: adminRoutes,
  user: userRoutes,
  auth: authRoutes,
};
