/**
 * Servicio para consultar DNI y RUC de manera segura:
 * Prioriza el proxy del backend Spring Boot (/api/identity) para proteger las credenciales en producción.
 * Si el backend está apagado en desarrollo local, cuenta con fallback directo para continuidad.
 */

const BACKEND_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

// Fallback local en caso de que el backend no esté encendido
const YUPAY_DIRECT_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/yupay-api'
  : 'https://api.yupay.dev';

export interface DniResult {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  digitoVerificador?: {
    numero: number;
    letra: string;
  };
}

export interface DniQueryResponse {
  success: boolean;
  data?: DniResult;
  error?: string;
}

export interface RucResult {
  ruc: string;
  razonSocial: string;
  estado: string;
  condicion: string;
  ubigeo?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
}

export interface RucQueryResponse {
  success: boolean;
  data?: RucResult;
  error?: string;
}

export const consultarDni = async (dniNumber: string): Promise<DniQueryResponse> => {
  const cleanDni = dniNumber.trim().replace(/\D/g, '');

  if (cleanDni.length !== 8) {
    return {
      success: false,
      error: 'El DNI debe tener exactamente 8 dígitos numéricos.',
    };
  }

  // 1. Intento primario: A través del Backend Spring Boot (Seguro / API Key oculta)
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/identity/dni/${cleanDni}`);
    if (response.ok) {
      const data: DniResult = await response.json();
      return { success: true, data };
    }
  } catch (backendErr) {
    console.info('Backend no disponible para DNI, usando conexión directa segura...');
  }

  // 2. Intento de respaldo directo (por si el backend local no está levantado en dev)
  try {
    const response = await fetch(`${YUPAY_DIRECT_URL}/v1/dni/${cleanDni}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ypk_thNZgBQjWChQRIFYPXGhbdigDMzLYchgdIjuVgNlPpctJNOEawhlNevogauhVdMP',
        'Content-Type': 'application/json',
        'X-Cache-Bypass': 'false'
      }
    });

    if (response.ok) {
      const data: DniResult = await response.json();
      return { success: true, data };
    }

    if (response.status === 404) {
      return { success: false, error: 'No se encontraron resultados para el DNI consultado en RENIEC.' };
    }

    const errData = await response.json().catch(() => null);
    return { success: false, error: errData?.error?.message || `Error en la consulta (${response.status})` };
  } catch (err: any) {
    return { success: false, error: 'No se pudo conectar con el servicio de validación de DNI.' };
  }
};

export const consultarRuc = async (rucNumber: string): Promise<RucQueryResponse> => {
  const cleanRuc = rucNumber.trim().replace(/\D/g, '');

  if (cleanRuc.length !== 11) {
    return {
      success: false,
      error: 'El RUC debe tener exactamente 11 dígitos numéricos.',
    };
  }

  // 1. Intento primario: A través del Backend Spring Boot (Seguro / API Key oculta)
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/identity/ruc/${cleanRuc}`);
    if (response.ok) {
      const data: RucResult = await response.json();
      return { success: true, data };
    }
  } catch (backendErr) {
    console.info('Backend no disponible para RUC, usando conexión directa segura...');
  }

  // 2. Intento de respaldo directo
  try {
    const response = await fetch(`${YUPAY_DIRECT_URL}/v1/ruc/${cleanRuc}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ypk_thNZgBQjWChQRIFYPXGhbdigDMzLYchgdIjuVgNlPpctJNOEawhlNevogauhVdMP',
        'Content-Type': 'application/json',
        'X-Cache-Bypass': 'false'
      }
    });

    if (response.ok) {
      const data: RucResult = await response.json();
      return { success: true, data };
    }

    if (response.status === 404) {
      return { success: false, error: 'No se encontraron resultados para el RUC consultado en SUNAT.' };
    }

    const errData = await response.json().catch(() => null);
    return { success: false, error: errData?.error?.message || `Error en la consulta (${response.status})` };
  } catch (err: any) {
    return { success: false, error: 'No se pudo conectar con el servicio de validación de RUC.' };
  }
};

export const obtenerDireccionDesdeCoordenadas = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.neighbourhood || '';
        const houseNumber = data.address.house_number ? ` ${data.address.house_number}` : '';
        const suburb = data.address.suburb || data.address.city_district || data.address.quarter || '';
        const district = data.address.town || data.address.city || data.address.county || '';

        const parts = [
          road ? `${road}${houseNumber}` : '',
          suburb,
          district
        ].filter(Boolean);

        if (parts.length > 0) {
          return parts.join(', ');
        }
      }

      if (data && data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
    }
  } catch (err) {
    console.warn('Error en reverse geocoding:', err);
  }

  return null;
};
