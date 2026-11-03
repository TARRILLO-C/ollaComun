import { create } from 'zustand';

/**
 * useDonacionStore.js - Gestor de Estado Global con Zustand
 * 
 * Controla el ciclo de vida completo de la donación:
 * 1. "Donado"            -> La bodega publica los excedentes (disponible).
 * 2. "Reservado"         -> El comedor aparta el lote y se genera el PIN/QR.
 * 3. "Esperando Entrega" -> El comedor está en camino a la bodega.
 * 4. "Entregado"         -> El bodeguero valida el PIN/QR, cerrando la transacción.
 */
export const useDonacionStore = create((set, get) => ({
  // Lista global de donaciones
  donaciones: [
    {
      id: 'don-01',
      titulo: '40 panes ciabatta y franceses surtidos',
      categoria: 'PANADERIA',
      cantidadValor: 8.5,
      cantidadTexto: '8.5 kg (~17 raciones)',
      bodegaId: 'bod-01',
      bodegaNombre: 'Bodega Don Pepe',
      direccion: 'Av. Próceres de la Independencia 1420',
      distrito: 'San Juan de Lurigancho',
      estado: 'Donado', // 'Donado' | 'Reservado' | 'Esperando Entrega' | 'Entregado'
      pickupEndAt: new Date(Date.now() + 2 * 3600000).toISOString(),
      comedorReceptor: null,
      pinReserva: null,
      qrToken: null,
      fechaCierre: null
    },
    {
      id: 'don-02',
      titulo: 'Jaba surtida de verduras (Tomates y zanahorias)',
      categoria: 'FRUTAS_VERDURAS',
      cantidadValor: 12.0,
      cantidadTexto: '12 kg (~24 raciones)',
      bodegaId: 'bod-02',
      bodegaNombre: 'Minimarket Los Andes',
      direccion: 'Jr. Los Claveles 340',
      distrito: 'San Juan de Lurigancho',
      estado: 'Donado',
      pickupEndAt: new Date(Date.now() + 3.5 * 3600000).toISOString(),
      comedorReceptor: null,
      pinReserva: null,
      qrToken: null,
      fechaCierre: null
    }
  ],

  // Reserva / Entrega actualmente activa en el dispositivo
  entregaActiva: null,

  // Métricas acumuladas de impacto social y ambiental
  metricas: {
    kilosRescatadosTotal: 24.5,
    entregasExitosas: 5,
    racionesServidas: 49,
    co2EvitadoKg: 61.2
  },

  /**
   * 1. Publicar Donación -> Pasa a estado "Donado"
   */
  publicarDonacion: (datos) => {
    const nueva = {
      id: `don-${Date.now().toString().slice(-4)}`,
      titulo: datos.titulo || `${datos.categoria} disponible`,
      categoria: datos.categoria || 'PANADERIA',
      cantidadValor: datos.cantidadValor || 5.0,
      cantidadTexto: datos.cantidadTexto || '5 kg aprox.',
      bodegaId: datos.bodegaId || 'bod-01',
      bodegaNombre: datos.bodegaNombre || 'Mi Bodega',
      direccion: datos.direccion || 'Av. Principal 123',
      distrito: datos.distrito || 'San Juan de Lurigancho',
      estado: 'Donado', // Estado inicial del ciclo
      pickupEndAt: datos.pickupEndAt || new Date(Date.now() + 2 * 3600000).toISOString(),
      comedorReceptor: null,
      pinReserva: null,
      qrToken: null,
      fechaCierre: null
    };

    set((state) => ({
      donaciones: [nueva, ...state.donaciones]
    }));

    return nueva;
  },

  /**
   * 2. Reservar Donación -> Pasa a estado "Reservado"
   * Genera el PIN de seguridad de 6 dígitos y el token QR único
   */
  reservarDonacion: (donacionId, nombreComedor = 'Comedor Popular Santa Rosa') => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const qrToken = `ECO-${donacionId}-${pin}-${Date.now().toString(36).toUpperCase()}`;

    let entregaActualizada = null;

    set((state) => ({
      donaciones: state.donaciones.map((d) => {
        if (d.id === donacionId) {
          entregaActualizada = {
            ...d,
            estado: 'Reservado', // Estado 2 del ciclo
            comedorReceptor: nombreComedor,
            pinReserva: pin,
            qrToken: qrToken
          };
          return entregaActualizada;
        }
        return d;
      }),
      entregaActiva: entregaActualizada
    }));

    return { pin, qrToken };
  },

  /**
   * 3. Esperando Entrega -> Pasa a estado "Esperando Entrega"
   * Se dispara cuando el comedor confirma que va en camino físico a recoger
   */
  marcarEsperandoEntrega: (donacionId) => {
    set((state) => ({
      donaciones: state.donaciones.map((d) => 
        d.id === donacionId ? { ...d, estado: 'Esperando Entrega' } : d
      ),
      entregaActiva: state.entregaActiva?.id === donacionId 
        ? { ...state.entregaActiva, estado: 'Esperando Entrega' } 
        : state.entregaActiva
    }));
  },

  /**
   * 4. Validar Entrega -> Transición final a "Entregado"
   * Valida PIN o QR, asigna fecha de cierre y suma los kilos rescatados
   */
  validarEntrega: async (codigoPinOQr) => {
    const { donaciones, metricas } = get();
    const codigoLimpio = codigoPinOQr.trim();

    // Buscar donación coincidente que esté en espera de cierre
    const target = donaciones.find(
      (d) => 
        (d.estado === 'Reservado' || d.estado === 'Esperando Entrega') &&
        (d.pinReserva === codigoLimpio || d.qrToken === codigoLimpio)
    );

    if (!target) {
      throw new Error('Código de validación incorrecto o la entrega ya fue procesada.');
    }

    const fechaCierre = new Date().toISOString();
    const kilos = target.cantidadValor || 5.0;

    // Transición atómica a "Entregado"
    set((state) => ({
      donaciones: state.donaciones.map((d) => 
        d.id === target.id 
          ? { ...d, estado: 'Entregado', fechaCierre } 
          : d
      ),
      entregaActiva: null,
      metricas: {
        kilosRescatadosTotal: parseFloat((metricas.kilosRescatadosTotal + kilos).toFixed(1)),
        entregasExitosas: metricas.entregasExitosas + 1,
        racionesServidas: metricas.racionesServidas + Math.round(kilos * 2),
        co2EvitadoKg: parseFloat((metricas.co2EvitadoKg + kilos * 2.5).toFixed(1))
      }
    }));

    return {
      success: true,
      mensaje: '¡Entrega confirmada y alimentos rescatados exitosamente!',
      donacionId: target.id,
      estado: 'Entregado',
      fechaCierre
    };
  }
}));

export default useDonacionStore;
