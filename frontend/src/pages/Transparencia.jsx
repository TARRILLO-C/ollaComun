import React, { useState } from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  Store, 
  Soup, 
  Leaf, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Scale, 
  Users, 
  Award,
  Download,
  Clock,
  MapPin,
  ShieldCheck
} from 'lucide-react';

/**
 * Transparencia.jsx - Vista de Transparencia, Historial y Métricas de Impacto
 * 
 * Sistema de Pestañas:
 * - Comedor: Historial detallado de alimentos recibidos y bodegas colaboradoras.
 * - Bodeguero: Resumen de impacto mensual ("Evitaste que 20 kilos de comida se desperdicien", raciones y CO₂).
 */
export const Transparencia = ({ onBack, defaultTab = 'BODEGUERO' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'BODEGUERO' | 'COMEDOR'

  // Datos mockeados de impacto mensual para la Bodega
  const impactoBodega = {
    mesActual: 'Noviembre 2026',
    kilosRescatados: 24.5,
    racionesEquivalentes: 49,
    co2EvitadoKg: 61.2,
    donacionesCompletadas: 5,
    historialMensual: [
      {
        id: 'don-hist-01',
        alimento: '40 panes ciabatta y queques del día',
        categoria: 'PANADERIA',
        cantidad: '8.5 kg',
        comedorReceptor: 'Comedor Popular Santa Rosa de Lima',
        fecha: '02 Nov 2026, 11:30 AM',
        metodo: 'Validado con PIN #749215'
      },
      {
        id: 'don-hist-02',
        alimento: 'Caja surtida de plátanos y manzanas',
        categoria: 'FRUTAS_VERDURAS',
        cantidad: '6.0 kg',
        comedorReceptor: 'Olla Común Mujeres Guerreras',
        fecha: '31 Oct 2026, 06:15 PM',
        metodo: 'Validado con QR Escaneado'
      },
      {
        id: 'don-hist-03',
        alimento: 'Abarrotes: fideos, lentejas y conservas',
        categoria: 'ABARROTES',
        cantidad: '10.0 kg',
        comedorReceptor: 'Comedor Popular San Martín de Porres',
        fecha: '28 Oct 2026, 02:45 PM',
        metodo: 'Validado con PIN #182390'
      }
    ]
  };

  // Datos mockeados del historial de recepciones para el Comedor
  const recepcionesComedor = [
    {
      id: 'rec-01',
      alimento: '40 panes ciabatta y queques del día',
      categoria: 'PANADERIA',
      cantidad: '8.5 kg (~17 raciones)',
      bodegaDonante: 'Bodega & Minimarket Don Pepe',
      direccion: 'Av. Próceres de la Independencia 1420',
      fechaRecojo: '02 Nov 2026, 11:30 AM',
      estado: 'COMPLETADO',
      pinUsado: '749215'
    },
    {
      id: 'rec-02',
      alimento: 'Jaba de verduras para guiso (Zanahorias y tomates)',
      categoria: 'FRUTAS_VERDURAS',
      cantidad: '12.0 kg (~24 raciones)',
      bodegaDonante: 'Minimarket Los Andes',
      direccion: 'Jr. Los Claveles 340',
      fechaRecojo: '30 Oct 2026, 04:10 PM',
      estado: 'COMPLETADO',
      pinUsado: '492018'
    },
    {
      id: 'rec-03',
      alimento: 'Sacos de pan del día anterior para budín',
      categoria: 'PANADERIA',
      cantidad: '15.0 kg (~30 raciones)',
      bodegaDonante: 'Panadería La Espiga Dorada',
      direccion: 'Av. Gran Chimú 620',
      fechaRecojo: '25 Oct 2026, 10:20 AM',
      estado: 'COMPLETADO',
      pinUsado: '610344'
    }
  ];

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-50 text-slate-900 overflow-y-auto p-4 pb-20">
      <div className="w-full max-w-md mx-auto space-y-4">
        
        {/* Header con botón regresar */}
        <header className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button 
                type="button"
                onClick={onBack}
                className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
                <BarChart3 size={18} />
              </span>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  Transparencia e Impacto
                </h1>
                <p className="text-[11px] text-slate-500">
                  Trazabilidad de alimentos rescatados
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Descargando reporte de impacto certificado en formato PDF...')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Reporte</span>
          </button>
        </header>

        {/* Sistema de Pestañas (Tabs) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('BODEGUERO')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'BODEGUERO'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store size={15} />
            <span>Impacto Bodega</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMEDOR')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'COMEDOR'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Soup size={15} />
            <span>Historial Comedor</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA 1: RESUMEN DE IMPACTO MENSUAL (ROL BODEGUERO)          */}
        {/* ============================================================== */}
        {activeTab === 'BODEGUERO' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Callout Destacado de Impacto */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={11} /> {impactoBodega.mesActual}
                </span>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <ShieldCheck size={12} /> Verificado
                </span>
              </div>

              {/* TEXTO REQUERIDO: "Evitaste que 20 kilos de comida se desperdicien" */}
              <h2 className="text-xl font-black text-white tracking-tight leading-snug">
                ¡Evitaste que <span className="text-yellow-300 underline decoration-yellow-300/40">{impactoBodega.kilosRescatados} kilos</span> de comida se desperdicien!
              </h2>

              <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed">
                Tus excedentes fueron transformados en raciones comunitarias para comedores populares de tu distrito.
              </p>

              {/* Grid de Métricas de Impacto */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-emerald-600/60">
                <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-xs">
                  <Scale size={16} className="text-emerald-200 mx-auto mb-1" />
                  <span className="text-lg font-black text-white block">
                    {impactoBodega.kilosRescatados} kg
                  </span>
                  <span className="text-[9px] text-emerald-100 font-semibold uppercase">Rescatados</span>
                </div>

                <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-xs">
                  <Users size={16} className="text-emerald-200 mx-auto mb-1" />
                  <span className="text-lg font-black text-white block">
                    {impactoBodega.racionesEquivalentes}
                  </span>
                  <span className="text-[9px] text-emerald-100 font-semibold uppercase">Raciones</span>
                </div>

                <div className="bg-white/10 rounded-2xl p-2.5 text-center backdrop-blur-xs">
                  <Leaf size={16} className="text-emerald-200 mx-auto mb-1" />
                  <span className="text-lg font-black text-white block">
                    {impactoBodega.co2EvitadoKg} kg
                  </span>
                  <span className="text-[9px] text-emerald-100 font-semibold uppercase">CO₂ Evitado</span>
                </div>
              </div>
            </div>

            {/* Listado de Donaciones Entregadas este Mes */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Donaciones Entregadas
                </h3>
                <span className="text-[11px] font-bold text-emerald-800">
                  {impactoBodega.historialMensual.length} completadas
                </span>
              </div>

              <div className="space-y-2.5">
                {impactoBodega.historialMensual.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          {item.categoria.replace('_', ' ')} • {item.cantidad}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.alimento}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={11} /> Entregado
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex flex-col gap-0.5 mt-2 pt-2 border-t border-slate-100">
                      <span>Destino: <strong className="text-slate-800">{item.comedorReceptor}</strong></span>
                      <span className="text-[10px] text-slate-400">{item.fecha} • {item.metodo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: HISTORIAL DE RECEPCIONES (ROL COMEDOR POPULAR)      */}
        {/* ============================================================== */}
        {activeTab === 'COMEDOR' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Header del Resumen Comedor */}
            <div className="bg-gradient-to-br from-orange-600 to-amber-700 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider block">
                  Total de Alimentos Recibidos
                </span>
                <span className="text-2xl font-black text-white">
                  35.5 kg
                </span>
                <p className="text-xs text-orange-100 font-medium mt-0.5">
                  Aproximadamente 71 raciones comunitarias
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <Soup size={26} />
              </div>
            </div>

            {/* Lista de Recepciones Realizadas */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recepciones Registradas
                </h3>
                <span className="text-[11px] font-bold text-orange-700">
                  {recepcionesComedor.length} recepciones
                </span>
              </div>

              <div className="space-y-2.5">
                {recepcionesComedor.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
                          {rec.categoria.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {rec.alimento}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                          Cantidad: {rec.cantidad}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={11} /> Recibido
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Store size={12} className="text-slate-400 shrink-0" />
                        <span>Bodega: <strong className="text-slate-900">{rec.bodegaDonante}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{rec.direccion}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {rec.fechaRecojo}
                      </span>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                        PIN: {rec.pinUsado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Transparencia;
