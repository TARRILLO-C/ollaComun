import React, { useState } from 'react';
import { useEcoFood } from '../context/EcoFoodContext';
import { 
  PlusCircle, 
  QrCode, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Store,
  PackageCheck,
  BarChart3,
  Phone,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  LogOut,
  UserCheck
} from 'lucide-react';
import { NuevaDonacionForm } from './NuevaDonacionForm';
import { QRScanner } from './QRScanner';
import { Transparencia } from './Transparencia';
import { EditProfileModal } from './EditProfileModal';

export const BodegaDashboard: React.FC = () => {
  const { 
    currentUser, 
    donations, 
    deliveries, 
    metrics, 
    createDonation, 
    validateDelivery,
    logout,
    setCurrentScreen 
  } = useEcoFood();

  // Estados de vistas modales
  const [showNuevaDonacion, setShowNuevaDonacion] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showTransparencia, setShowTransparencia] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Tab de filtro: 'DISPONIBLES' | 'RESERVADAS' | 'ENTREGADAS'
  const [activeTab, setActiveTab] = useState<'DISPONIBLES' | 'RESERVADAS' | 'ENTREGADAS'>('DISPONIBLES');

  // Donaciones de la bodega actual
  const myDonations = donations.filter(d => d.donorId === currentUser?.id || d.donorId === 'usr-bodega-01');

  // Filtrado según estado del ciclo de vida
  const donacionesDisponibles = myDonations.filter(d => d.status === 'AVAILABLE');
  const donacionesReservadas = myDonations.filter(d => d.status === 'RESERVED');
  const donacionesEntregadas = myDonations.filter(d => d.status === 'DELIVERED');

  const handleDonationCreated = (data: any) => {
    let qty = 5;
    if (data.cantidadExacta) {
      qty = parseFloat(data.cantidadExacta);
    } else if (data.cantidadRango === '1_5_KG') {
      qty = 3;
    } else if (data.cantidadRango === '5_10_KG') {
      qty = 8;
    } else if (data.cantidadRango === 'MAS_10_KG') {
      qty = 15;
    }

    createDonation({
      title: data.notasEstado || `${data.categoria === 'PANADERIA' ? 'Panes y pastelería' : data.categoria === 'FRUTAS_VERDURAS' ? 'Verduras y frutas frescas' : 'Abarrotes y alimentos'} del día`,
      category: data.categoria,
      quantityValue: qty,
      unitMeasure: `${qty} kg (~${Math.round(qty * 2)} raciones)`,
      pickupEndAt: data.pickupEndAt,
      description: data.notasEstado || 'Alimentos en perfecto estado listos para recojo inmediato.',
    });

    setShowNuevaDonacion(false);
  };

  const handleValidation = (code: string) => {
    const res = validateDelivery(code);
    if (res.success) {
      setShowScanner(false);
    } else {
      alert(res.message);
    }
  };

  // Renderizar vistas modales superpuestas si están activas
  if (showNuevaDonacion) {
    return (
      <NuevaDonacionForm 
        onBack={() => setShowNuevaDonacion(false)} 
        onDonationCreated={handleDonationCreated} 
      />
    );
  }

  if (showScanner) {
    return (
      <QRScanner 
        onBack={() => setShowScanner(false)} 
        onScanSuccess={handleValidation}
        onManualPinSubmit={handleValidation}
      />
    );
  }

  if (showTransparencia) {
    return (
      <Transparencia 
        onBack={() => setShowTransparencia(false)} 
        defaultTab="BODEGUERO" 
      />
    );
  }

  if (showEditProfile) {
    return (
      <EditProfileModal 
        onClose={() => setShowEditProfile(false)} 
      />
    );
  }

  return (
    <div className="screen-scroll-container pb-28">
      {/* Header Bodega Ultra-Pulido */}
      <div className="flex justify-between items-center mb-5 pb-3.5 border-b border-slate-200/90">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/25 shrink-0 border border-emerald-400/30">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Bodega Solidaria
              </span>
              <ShieldCheck size={13} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5 leading-tight">
              {currentUser?.businessName || 'Bodega Don Pepe'}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
              <MapPin size={11} className="text-emerald-600 shrink-0" />
              <span className="truncate max-w-[170px]">{currentUser?.addressLine || 'San Juan de Lurigancho'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEditProfile(true)}
            className="p-2 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl border border-slate-200 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Editar datos de la cuenta"
          >
            <UserCheck size={16} />
            <span>Perfil</span>
          </button>

          <button
            onClick={() => setShowTransparencia(true)}
            className="p-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Ver métricas de impacto"
          >
            <BarChart3 size={16} />
            <span>Impacto</span>
          </button>

          <button
            onClick={logout}
            className="p-2 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl border border-slate-200 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Botón Gigante "Donar hoy" */}
      <div className="mb-4">
        <button 
          onClick={() => setShowNuevaDonacion(true)}
          className="btn-dominant-donate group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-xs group-hover:scale-110 transition-transform">
              <PlusCircle size={28} />
            </div>
            <div className="text-left">
              <span className="text-lg font-black tracking-tight block">Donar hoy</span>
              <span className="text-xs text-emerald-100 font-medium block">Publicar alimentos en 1 paso</span>
            </div>
          </div>
          <ArrowRight size={24} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Tarjeta de Acción Rápida: Validar PIN / Escanear QR */}
      <div className="mb-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
            <QrCode size={14} />
            Cierre de Entrega
          </div>
          <p className="text-xs text-slate-300">
            ¿Llegó el comedor? Valida su PIN o escanea su QR.
          </p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 ml-2"
        >
          <span>Validar</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Resumen de Impacto Rápido Visual */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Total Rescatado</span>
            <span className="text-base">⚖️</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 font-mono tracking-tight">
            {metrics.kilosRescatadosTotal} <span className="text-xs font-bold text-emerald-700">kg</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">~{metrics.racionesEquivalentes} raciones generadas</span>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-teal-50 to-white border border-teal-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">CO₂ Evitado</span>
            <span className="text-base">🌱</span>
          </div>
          <div className="text-2xl font-black text-teal-900 font-mono tracking-tight">
            {metrics.co2EvitadoKg} <span className="text-xs font-bold text-teal-700">kg</span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold block mt-1">{metrics.entregasExitosas} donaciones completadas</span>
        </div>
      </div>

      {/* Tabs de Filtro de Donaciones */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl mb-4 gap-1 text-xs font-bold border border-slate-200">
        <button
          onClick={() => setActiveTab('DISPONIBLES')}
          className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
            activeTab === 'DISPONIBLES' 
              ? 'bg-white text-emerald-900 shadow-sm font-extrabold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Disponibles ({donacionesDisponibles.length})
        </button>
        <button
          onClick={() => setActiveTab('RESERVADAS')}
          className={`flex-1 py-2 rounded-xl transition-all text-center relative cursor-pointer ${
            activeTab === 'RESERVADAS' 
              ? 'bg-white text-orange-700 shadow-sm font-extrabold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          En Camino ({donacionesReservadas.length})
          {donacionesReservadas.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ENTREGADAS')}
          className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
            activeTab === 'ENTREGADAS' 
              ? 'bg-white text-slate-900 shadow-sm font-extrabold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Historial ({donacionesEntregadas.length})
        </button>
      </div>

      {/* Lista de Donaciones según Tab */}
      <div className="space-y-3">
        {activeTab === 'DISPONIBLES' && (
          donacionesDisponibles.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
              <PackageCheck size={40} className="mx-auto text-emerald-300 mb-2" />
              <p className="text-sm font-extrabold text-slate-800">No tienes alimentos publicados ahora</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Toca "Donar hoy" para que los comedores populares cercanos puedan apartarlos de inmediato.
              </p>
            </div>
          ) : (
            donacionesDisponibles.map(donacion => (
              <div 
                key={donacion.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-emerald-400 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {donacion.category === 'PANADERIA' ? '🥖 Panadería' : donacion.category === 'FRUTAS_VERDURAS' ? '🥦 Frutas y Verduras' : '🥫 Abarrotes'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                    <Clock size={12} className="text-emerald-700" />
                    Hasta {new Date(donacion.pickupEndAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex gap-3 items-start my-2">
                  {donacion.photoUrl && (
                    <img 
                      src={donacion.photoUrl} 
                      alt={donacion.title} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs" 
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{donacion.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{donacion.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs">
                  <span className="font-black text-emerald-800 text-sm font-mono">{donacion.unitMeasure}</span>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    Disponible para recojo
                  </span>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'RESERVADAS' && (
          donacionesReservadas.length === 0 ? (
            <div className="text-center py-8 px-4 bg-white border border-dashed border-slate-300 rounded-2xl">
              <Clock size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay retiros pendientes</p>
              <p className="text-xs text-slate-400 mt-1">
                Cuando un comedor aparte una donación, aparecerá aquí con sus datos.
              </p>
            </div>
          ) : (
            donacionesReservadas.map(donacion => {
              const delivery = deliveries.find(d => d.donationId === donacion.id && d.status === 'PENDING_PICKUP');
              return (
                <div 
                  key={donacion.id}
                  className="bg-orange-50/60 border-2 border-orange-200 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300">
                      Apartado por Comedor
                    </span>
                    <span className="text-[11px] font-black text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                      PIN: {delivery?.pickupPin || '******'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{donacion.title}</h4>
                  <div className="bg-white p-2.5 rounded-xl border border-orange-200 my-2 text-xs">
                    <p className="font-bold text-slate-800">{delivery?.receiverBusinessName || 'Comedor Popular'}</p>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> Tel: {delivery?.receiverPhone || 'Sin registrar'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full mt-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <QrCode size={15} />
                    <span>Validar entrega ahora</span>
                  </button>
                </div>
              );
            })
          )
        )}

        {activeTab === 'ENTREGADAS' && (
          donacionesEntregadas.length === 0 ? (
            <div className="text-center py-8 px-4 bg-white border border-dashed border-slate-300 rounded-2xl">
              <CheckCircle2 size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">Sin entregas completadas aún</p>
              <p className="text-xs text-slate-400 mt-1">
                Tus donaciones entregadas quedarán selladas aquí con su fecha e impacto.
              </p>
            </div>
          ) : (
            donacionesEntregadas.map(donacion => (
              <div 
                key={donacion.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm opacity-90"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {donacion.category}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Entregado
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{donacion.title}</h4>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>{donacion.unitMeasure}</span>
                  <span className="text-[11px] text-slate-400">¡Alimento salvado con éxito!</span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default BodegaDashboard;
