import React, { useState } from 'react';
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
  X
} from 'lucide-react';

export const NuevaDonacionForm = ({ onBack, onDonationCreated }) => {
  // Estados del Formulario
  const [categoria, setCategoria] = useState('PANADERIA');
  const [cantidadRango, setCantidadRango] = useState('5_10_KG');
  const [cantidadExacta, setCantidadExacta] = useState('');
  const [horarioLimite, setHorarioLimite] = useState('2_HORAS');
  const [horaPersonalizada, setHoraPersonalizada] = useState('');
  const [notasEstado, setNotasEstado] = useState('');

  // Estados de control
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Opciones de categorías visuales
  const categorias = [
    { id: 'PANADERIA', label: 'Panadería', icon: Croissant, emoji: '🥖' },
    { id: 'FRUTAS_VERDURAS', label: 'Verduras / Frutas', icon: Apple, emoji: '🥦' },
    { id: 'ABARROTES', label: 'Abarrotes', icon: ShoppingBag, emoji: '🥫' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let pickupEndAt = new Date();
      if (horarioLimite === '1_HORA') {
        pickupEndAt = new Date(Date.now() + 1 * 3600000);
      } else if (horarioLimite === '2_HORAS') {
        pickupEndAt = new Date(Date.now() + 2 * 3600000);
      } else if (horarioLimite === '4_HORAS') {
        pickupEndAt = new Date(Date.now() + 4 * 3600000);
      } else if (horarioLimite === 'CIERRE_HOY') {
        pickupEndAt = new Date(Date.now() + 6 * 3600000);
      } else if (horaPersonalizada) {
        const [hours, minutes] = horaPersonalizada.split(':');
        pickupEndAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      }

      const payload = {
        categoria,
        cantidadRango,
        cantidadExacta,
        pickupEndAt: pickupEndAt.toISOString(),
        notasEstado
      };

      await new Promise(resolve => setTimeout(resolve, 800));

      setIsSuccess(true);
      if (onDonationCreated) {
        setTimeout(() => {
          onDonationCreated(payload);
        }, 1000);
      }
    } catch (err) {
      setError('No se pudo publicar la donación. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden animate-fade-in">
      {/* Header Fijo */}
      <header className="px-3.5 py-3 bg-emerald-800 text-white flex items-center justify-between shrink-0 shadow-sm gap-2">
        <button 
          type="button"
          onClick={onBack}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <div className="text-center min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block truncate">
            Publicación Rápida
          </span>
          <h2 className="text-sm font-extrabold truncate">Nueva Donación</h2>
        </div>

        <button 
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer shrink-0"
        >
          <X size={18} />
        </button>
      </header>

      {/* Cuerpo scrolleable del formulario */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="max-w-md mx-auto space-y-4">
          {/* Título */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5">
            <h1 className="text-base font-extrabold text-emerald-950 flex items-center gap-1.5">
              <span>¿Qué vas a donar hoy?</span>
              <span className="text-base">🥑</span>
            </h1>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Los comedores populares de tu zona recibirán una alerta inmediata para recoger los alimentos a pie.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-center animate-fade-in my-6">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-lg font-black text-emerald-950">¡Donación Publicada!</h2>
              <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Alerta emitida a los comedores cercanos. Te notificaremos en cuanto aparten el pedido.
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

              {/* 1. Tipo de Alimento */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  1. Tipo de Alimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categorias.map((item) => {
                    const isSelected = categoria === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
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

              {/* 2. Cantidad Estimada */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    2. Cantidad Estimada
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Selector flexible</span>
                </div>

                <select
                  value={cantidadRango}
                  onChange={(e) => setCantidadRango(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-semibold"
                >
                  <option value="MENOS_5_KG">Menos de 5 kg (1 bolsa mediana / porción pequeña)</option>
                  <option value="5_10_KG">De 5 a 10 kg (2 a 3 bolsas / ~15 raciones)</option>
                  <option value="10_20_KG">De 10 a 20 kg (1 a 2 cajas o jabas)</option>
                  <option value="MAS_20_KG">Más de 20 kg (Gran volumen / varias cajas)</option>
                  <option value="EXACTO">Especificar peso o cantidad exacta (opcional)</option>
                </select>

                {cantidadRango === 'EXACTO' && (
                  <div className="mt-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={cantidadExacta}
                      onChange={(e) => setCantidadExacta(e.target.value)}
                      placeholder="Ej. 12.5 (en kg o unidades)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 3. Notas opcionales */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <FileText size={13} className="text-slate-400" />
                    3. Notas sobre estado o peso (Opcional)
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={notasEstado}
                  onChange={(e) => setNotasEstado(e.target.value)}
                  placeholder="Ej. Son 40 panes ciabatta horneados hoy a las 6am en bolsas limpias..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info size={11} className="text-slate-400 shrink-0" /> 
                  Ayuda al comedor a saber si necesita llevar bolsas o recipientes especiales.
                </p>
              </div>

              {/* 4. Horario Límite de Recojo */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock size={13} className="text-slate-400" />
                  4. Horario Límite de Recojo
                </label>

                <select
                  value={horarioLimite}
                  onChange={(e) => setHorarioLimite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-semibold"
                >
                  <option value="1_HORA">En 1 hora (Urgente / Alimentos preparados)</option>
                  <option value="2_HORAS">En 2 horas (Recomendado)</option>
                  <option value="4_HORAS">En 4 horas</option>
                  <option value="CIERRE_HOY">Hoy antes de cerrar el negocio</option>
                  <option value="PERSONALIZADO">Elegir hora específica</option>
                </select>

                {horarioLimite === 'PERSONALIZADO' && (
                  <div className="mt-2">
                    <input
                      type="time"
                      value={horaPersonalizada}
                      onChange={(e) => setHoraPersonalizada(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* BOTÓN CONFIRMAR Y DONAR */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Publicando y alertando comedores...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake size={16} />
                      <span>Confirmar y Donar Alimentos</span>
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
