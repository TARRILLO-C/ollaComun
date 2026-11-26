import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HeartHandshake,
  Croissant,
  Apple,
  ShoppingBag,
  Info,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';

/**
 * Rangos de peso unificados con peso base y cálculo de raciones
 */
export const RANGOS_PESO = {
  '1_5_KG': { label: '1 a 5 kg', pesoBase: 3, raciones: 6, desc: 'Bolsa mediana / porción familiar' },
  '5_10_KG': { label: '5 a 10 kg', pesoBase: 8, raciones: 16, desc: '2 a 3 bolsas / ~16 raciones' },
  'MAS_10_KG': { label: 'Más de 10 kg', pesoBase: 12, raciones: 24, desc: 'Gran lote solidario / cajas' },
  'EXACTO': { label: 'Especificar peso exacto en kg', pesoBase: null, raciones: null, desc: 'Para bodegas con balanza' }
};

export const CATEGORIAS_ALIMENTO = [
  { id: 'PANADERIA', label: 'Panadería', icon: Croissant, emoji: '🥖' },
  { id: 'FRUTAS_VERDURAS', label: 'Verduras / Frutas', icon: Apple, emoji: '🥦' },
  { id: 'ABARROTES', label: 'Abarrotes', icon: ShoppingBag, emoji: '🥫' }
];

export const NuevaDonacionForm = ({ 
  onBack, 
  onDonationCreated,
  horarioCierre = '22:00' // Formato "HH:mm" por defecto
}) => {
  // Generar Idempotency-Key única (UUID v4) al montar el modal
  const [idempotencyKey] = useState(() => {
    return 'idemp-' + crypto.randomUUID();
  });

  // Estados del Formulario
  const [categoria, setCategoria] = useState('PANADERIA');
  const [cantidadRango, setCantidadRango] = useState('5_10_KG');
  const [cantidadExacta, setCantidadExacta] = useState('');
  const [horarioLimite, setHorarioLimite] = useState('2_HORAS');
  const [horaPersonalizada, setHoraPersonalizada] = useState('');
  const [notasEstado, setNotasEstado] = useState('');
  
  // Checkbox de inocuidad obligatorio pre-marcado
  const [inocuidadConfirmada, setInocuidadConfirmada] = useState(true);

  // Estados de control de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cálculo dinámico de minutos disponibles hasta el cierre de la bodega
  const minutosHastaCierre = useMemo(() => {
    try {
      const now = new Date();
      const [cierreHoras, cierreMins] = horarioCierre.split(':').map(Number);
      const fechaCierre = new Date();
      fechaCierre.setHours(cierreHoras, cierreMins, 0, 0);

      const diffMs = fechaCierre.getTime() - now.getTime();
      return Math.floor(diffMs / 60000);
    } catch {
      return 120;
    }
  }, [horarioCierre]);

  const cierreDeshabilitado = minutosHastaCierre < 30;

  // Cálculo de raciones en tiempo real
  const racionesCalculadas = useMemo(() => {
    if (cantidadRango === 'EXACTO') {
      const parsed = parseFloat(cantidadExacta);
      return !isNaN(parsed) && parsed > 0 ? Math.round(parsed * 2) : 0;
    }
    return RANGOS_PESO[cantidadRango]?.raciones || 16;
  }, [cantidadRango, cantidadExacta]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!inocuidadConfirmada) {
      setError('Debes confirmar que los alimentos son aptos para consumo humano.');
      return;
    }

    if (cantidadRango === 'EXACTO' && (!cantidadExacta || parseFloat(cantidadExacta) <= 0)) {
      setError('Ingresa un peso exacto válido en kilogramos.');
      return;
    }

    if (horarioLimite === 'CIERRE_HOY' && cierreDeshabilitado) {
      setError('Quedan menos de 30 minutos para el cierre. Elige otra opción de horario.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const now = new Date();
      let pickupEndAt = new Date();

      if (horarioLimite === '1_HORA') {
        pickupEndAt = new Date(now.getTime() + 1 * 3600000);
      } else if (horarioLimite === '2_HORAS') {
        pickupEndAt = new Date(now.getTime() + 2 * 3600000);
      } else if (horarioLimite === '4_HORAS') {
        pickupEndAt = new Date(now.getTime() + 4 * 3600000);
      } else if (horarioLimite === 'CIERRE_HOY') {
        const [cierreHoras, cierreMins] = horarioCierre.split(':').map(Number);
        pickupEndAt.setHours(cierreHoras, cierreMins, 0, 0);
      } else if (horaPersonalizada) {
        const [hours, minutes] = horaPersonalizada.split(':').map(Number);
        pickupEndAt.setHours(hours, minutes, 0, 0);
      }

      // Cálculo de peso base
      let pesoFinal = 8;
      if (cantidadRango === 'EXACTO') {
        pesoFinal = parseFloat(cantidadExacta);
      } else {
        pesoFinal = RANGOS_PESO[cantidadRango]?.pesoBase || 8;
      }

      const payload = {
        idempotencyKey,
        categoria,
        cantidadRango,
        cantidadExacta: cantidadRango === 'EXACTO' ? pesoFinal : null,
        pesoBase: pesoFinal,
        raciones: racionesCalculadas,
        pickupEndAt: pickupEndAt.toISOString(),
        notasEstado: notasEstado.trim(),
        inocuidadGarantizada: true
      };

      await new Promise(resolve => setTimeout(resolve, 600));

      setIsSuccess(true);
      if (onDonationCreated) {
        setTimeout(() => {
          onDonationCreated(payload);
        }, 800);
      }
    } catch (err) {
      setError('No se pudo publicar la donación. Inténtalo nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden animate-fade-in">
      {/* Header Fijo */}
      <header className="px-3.5 py-3 bg-emerald-800 text-white flex items-center justify-between shrink-0 shadow-sm gap-2">
        <button 
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <div className="text-center min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block truncate">
            Publicación Rápida • &lt;30 seg
          </span>
          <h2 className="text-sm font-extrabold truncate">Donar Alimentos Hoy</h2>
        </div>

        <button 
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </header>

      {/* Cuerpo Scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Banner de propósito */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                <span>¿Qué vas a donar hoy?</span>
                <span className="text-base">🥑</span>
              </h1>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                Se notificará de inmediato a los comedores en un radio de 2 km a la redonda.
              </p>
            </div>
            <div className="shrink-0 px-2.5 py-1 bg-white border border-emerald-300 rounded-xl text-center shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Raciones</span>
              <span className="text-sm font-black text-emerald-700">~{racionesCalculadas}</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-center animate-fade-in my-6">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-lg font-black text-emerald-950">¡Donación Publicada!</h2>
              <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Alerta emitida con éxito. Te avisaremos cuando un comedor popular aparte este lote.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* PASO 1: Tipo de Alimento */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  1. Tipo de Alimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIAS_ALIMENTO.map((item) => {
                    const isSelected = categoria === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setCategoria(item.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer min-w-0 ${
                          isSelected 
                            ? 'bg-emerald-700 border-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-600/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl mb-1">{item.emoji}</span>
                        <span className="text-[11px] font-bold leading-tight truncate w-full">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 2: Cantidad Estimada Unificada */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    2. Cantidad Estimada
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Equivale a ~{racionesCalculadas} raciones
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {Object.entries(RANGOS_PESO).map(([key, config]) => {
                    const isSelected = cantidadRango === key;
                    return (
                      <label
                        key={key}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="cantidadRango"
                            value={key}
                            checked={isSelected}
                            disabled={isSubmitting}
                            onChange={() => setCantidadRango(key)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              {config.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight">
                              {config.desc}
                            </span>
                          </div>
                        </div>

                        {config.raciones && (
                          <span className="text-[11px] font-black text-emerald-700 font-mono shrink-0">
                            ~{config.raciones} rac.
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {cantidadRango === 'EXACTO' && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Ingresa el peso exacto en kilogramos:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="500"
                        value={cantidadExacta}
                        disabled={isSubmitting}
                        onChange={(e) => setCantidadExacta(e.target.value)}
                        placeholder="Ej. 12.5"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:border-emerald-600 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-600">kg</span>
                    </div>
                  </div>
                )}
              </div>

              {/* PASO 3: Notas Opcionales */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <FileText size={13} className="text-slate-400" />
                  3. Notas sobre estado o embalaje (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notasEstado}
                  disabled={isSubmitting}
                  onChange={(e) => setNotasEstado(e.target.value)}
                  placeholder="Ej. Panes embolsados y limpios, traer bolsa grande..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none"
                />
              </div>

              {/* PASO 4: Horario Límite con cálculo dinámico de Cierre */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    4. Horario Límite de Recojo
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Cierre bodega: {horarioCierre}
                  </span>
                </label>

                <select
                  value={horarioLimite}
                  disabled={isSubmitting}
                  onChange={(e) => setHorarioLimite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-semibold"
                >
                  <option value="1_HORA">En 1 hora (Urgente / Alimentos preparados)</option>
                  <option value="2_HORAS">En 2 horas (Recomendado)</option>
                  <option value="4_HORAS">En 4 horas</option>
                  <option 
                    value="CIERRE_HOY" 
                    disabled={cierreDeshabilitado}
                  >
                    Hoy antes del cierre ({horarioCierre}) {cierreDeshabilitado ? '• Menos de 30m restantes' : ''}
                  </option>
                  <option value="PERSONALIZADO">Elegir hora específica</option>
                </select>

                {cierreDeshabilitado && horarioLimite === 'CIERRE_HOY' && (
                  <p className="text-amber-700 text-[11px] mt-1.5 flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">
                    <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                    <span>Faltan menos de 30 min para tu horario de cierre ({horarioCierre}). Selecciona otra opción.</span>
                  </p>
                )}

                {horarioLimite === 'PERSONALIZADO' && (
                  <div className="mt-2">
                    <input
                      type="time"
                      value={horaPersonalizada}
                      disabled={isSubmitting}
                      onChange={(e) => setHoraPersonalizada(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* PASO 5: Checkbox Obligatorio de Inocuidad */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inocuidadConfirmada}
                    disabled={isSubmitting}
                    onChange={(e) => setInocuidadConfirmada(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                  />
                  <div className="text-[11px] leading-snug">
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-700" />
                      Garantía de Inocuidad de Alimentos
                    </span>
                    <span className="text-emerald-800 font-medium">
                      Confirmo que los alimentos son 100% aptos para consumo hoy y cumplen con las normas sanitarias.
                    </span>
                  </div>
                </label>
              </div>

              {/* Botón de Confirmación con Protección Anti-Doble Envío */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !inocuidadConfirmada || (horarioLimite === 'CIERRE_HOY' && cierreDeshabilitado)}
                  className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Registrando donación segura...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake size={16} />
                      <span>Confirmar y Donar Alimentos (~{racionesCalculadas} raciones)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevaDonacionForm;
