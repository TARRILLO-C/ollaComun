/**
 * Servicio para consultar DNI y RUC en la API de Yupay.dev
 * - DNI: https://api.yupay.dev/v1/dni/{number}
 * - RUC: https://api.yupay.dev/v1/ruc/{number}
 */

const YUPAY_API_KEY = 'ypk_thNZgBQjWChQRIFYPXGhbdigDMzLYchgdIjuVgNlPpctJNOEawhlNevogauhVdMP';
// Usa proxy de Vite en desarrollo local (/yupay-api) para evitar bloqueos del navegador
const YUPAY_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
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

  try {
    const response = await fetch(`${YUPAY_BASE_URL}/v1/dni/${cleanDni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YUPAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Cache-Bypass': 'false'
      }
    });

    if (response.ok) {
      const data: DniResult = await response.json();
      return {
        success: true,
        data,
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        error: 'No se encontraron resultados para el DNI consultado en RENIEC.',
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        error: 'Error de autenticación con la API de DNI.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'Límite de consultas excedido o créditos insuficientes.',
      };
    }

    const errData = await response.json().catch(() => null);
    const message = errData?.error?.message || `Error en la consulta (${response.status})`;

    return {
      success: false,
      error: message,
    };
  } catch (err: any) {
    console.warn('Error al conectar con Yupay API:', err);
    return {
      success: false,
      error: 'No se pudo conectar con el servicio de validación de DNI. Verifica tu conexión a internet.',
    };
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

  try {
    const response = await fetch(`${YUPAY_BASE_URL}/v1/ruc/${cleanRuc}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YUPAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Cache-Bypass': 'false'
      }
    });

    if (response.ok) {
      const data: RucResult = await response.json();
      return {
        success: true,
        data,
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        error: 'No se encontraron resultados para el RUC consultado en SUNAT.',
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        error: 'Error de autenticación con la API de RUC.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'Límite de consultas excedido o créditos insuficientes.',
      };
    }

    const errData = await response.json().catch(() => null);
    const message = errData?.error?.message || `Error en la consulta (${response.status})`;

    return {
      success: false,
      error: message,
    };
  } catch (err: any) {
    console.warn('Error al conectar con Yupay API RUC:', err);
    return {
      success: false,
      error: 'No se pudo conectar con el servicio de validación de RUC. Verifica tu conexión a internet.',
    };
  }
};

/**
 * Geocodificación inversa mediante OpenStreetMap / Nominatim:
 * Convierte coordenadas (lat, lng) en una dirección legible (ej. Calle, Distrito, Ciudad)
 */
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

