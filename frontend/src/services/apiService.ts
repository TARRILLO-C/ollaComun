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
  async registerBodega(data: any) {
    try {
      let res;
      if (data instanceof FormData) {
        res = await fetch(`${BACKEND_BASE_URL}/api/auth/register-bodega`, {
          method: 'POST',
          body: data,
        });
      } else {
        const formData = new FormData();
        formData.append('docType', data.docType || 'RUC');
        formData.append('docNumber', data.docNumber);
        formData.append('businessName', data.businessName);
        formData.append('phone', data.phone || '');
        formData.append('address', data.addressLine || data.address || '');
        if (data.location?.latitude) formData.append('latitude', String(data.location.latitude));
        if (data.location?.longitude) formData.append('longitude', String(data.location.longitude));
        
        // Archivo o blob dummy para fachada si no viene
        const blob = new Blob(['fachada'], { type: 'image/jpeg' });
        formData.append('facadePhoto', blob, 'fachada.jpg');

        res = await fetch(`${BACKEND_BASE_URL}/api/auth/register-bodega`, {
          method: 'POST',
          body: formData,
        });
      }

      if (res && res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend no disponible para registro de bodega; usando fallback local:', err);
    }
    return null;
  },

  // 1.1 Registro de Comedor Popular
  async registerComedor(data: any) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/auth/register-comedor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: data.docType || 'DNI',
          docNumber: data.docNumber,
          businessName: data.businessName,
          representativeName: data.representativeName,
          phone: data.phone,
          address: data.addressLine || data.address,
          racionesDiarias: data.racionesDiarias || 100,
          latitude: data.location?.latitude,
          longitude: data.location?.longitude
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend no disponible para registro de comedor; usando fallback local:', err);
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
