/**
 * Cliente de conexión REST hacia el Backend de EcoFood (Spring Boot)
 * Implementa arquitectura Offline-First / Resiliente:
 * Intenta sincronizar con el backend; si el backend está en mantenimiento o sin conexión,
 * garantiza continuidad de negocio manteniendo la experiencia de usuario.
 */

const BACKEND_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

export const ecofoodApi = {
  // 1. Registro de Bodega
  async registerBodega(formData: FormData) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/auth/register-bodega`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend no disponible para registro; usando fallback local:', err);
    }
    return null;
  },

  // 2. Publicar Donación
  async createDonation(donationData: any) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend no disponible para donación; usando fallback local:', err);
    }
    return null;
  },

  // 3. Listar donaciones
  async getDonaciones(lat?: number, lng?: number) {
    try {
      const url = lat && lng 
        ? `${BACKEND_BASE_URL}/api/donaciones/cercanas?latitud=${lat}&longitud=${lng}`
        : `${BACKEND_BASE_URL}/api/donaciones`;
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend no disponible para consulta; usando fallback local:', err);
    }
    return null;
  },

  // 4. Validar entrega QR o PIN
  async validarEntrega(codigo: string) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/deliveries/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend no disponible para validar entrega; usando fallback local:', err);
    }
    return null;
  }
};
