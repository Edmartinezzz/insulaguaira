export interface Cliente {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  litros_mes: number;
  litros_disponibles: number;
  activo: boolean;
  cedula?: string;
  categoria?: string;
  subcategoria?: string;
  exonerado?: boolean;
  huella?: boolean;
}
