import React, { useState } from 'react';
import { useEcoFood, calcularTiempoCaminando } from '../context/EcoFoodContext';
import { 
  Soup, 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Loader2, 
  Footprints,
  FileText,
  Package,
  Copy,
  Check,
  XCircle,
  ExternalLink,
  Compass,
  LogOut,
  UserCheck,
  ShieldCheck,
  Store
} from 'lucide-react';
import { Donation, DonationCategory } from '../types';
import { QRDisplay } from './QRDisplay';
import { Transparencia } from './Transparencia';
import { EditProfileModal } from './EditProfileModal';

export const ComedorDashboard: React.FC = () => {
  const { 
    currentUser, 
    donations, 
    deliveries, 
    reserveDonation, 
    cancelReservation,
    logout,
    notifications 
  } = useEcoFood();

  // Estados
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [activeQrModalDelivery, setActiveQrModalDelivery] = useState<any | null>(null);
  const [showTransparencia, setShowTransparencia] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isReserving, setIsReserving] = useState<string | null>(null);

  // Donaciones disponibles cerca
  const availableDonations = donations.filter(d => d.status === 'AVAILABLE');

  // Filtrado por categoría
  const filteredDonations = availableDonations.filter(d => {
    if (selectedCategory === 'TODAS') return true;
    return d.category === selectedCategory;
  });

  // Entregas activas pendientes de recojo para este comedor
  const activeDelivery = deliveries.find(
    deliv => deliv.status === 'PENDING_PICKUP'
  );
  const activeDonation = activeDelivery 
    ? donations.find(d => d.id === activeDelivery.donationId)
    : null;

  const handleReserve = async (donationId: string) => {
    setIsReserving(donationId);
    try {
      await new Promise(r => setTimeout(r, 600));
      const delivery = reserveDonation(donationId);
      // Abrir automáticamente el modal con QR para mayor claridad
      const don = donations.find(d => d.id === donationId);
      setActiveQrModalDelivery({ delivery, donation: don });
    } finally {
      setIsReserving(null);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard?.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  if (activeQrModalDelivery) {
    return (
      <QRDisplay 
        onBack={() => setActiveQrModalDelivery(null)}
        donation={activeQrModalDelivery.donation}
        pin={activeQrModalDelivery.delivery.pickupPin}
        qrValue={activeQrModalDelivery.delivery.qrHashToken}
      />
    );
  }

  if (showTransparencia) {
    return (
      <Transparencia 
        onBack={() => setShowTransparencia(false)} 
        defaultTab="COMEDOR" 
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
      {/* Header Comedor Ultra-Pulido */}
      <div className="flex justify-between items-center mb-5 pb-3.5 border-b border-slate-200/90">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/25 shrink-0 border border-orange-400/30">
            <Soup size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Comedor Receptor
              </span>
              <ShieldCheck size={13} className="text-orange-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5 leading-tight">
              {currentUser?.businessName || 'Comedor Santa Rosa'}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
              <MapPin size={11} className="text-orange-500 shrink-0" />
              <span className="truncate max-w-[170px]">{currentUser?.addressLine || 'Radio: 2 km'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEditProfile(true)}
            className="p-2 bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-800 rounded-xl border border-slate-200 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Editar datos del comedor"
          >
            <UserCheck size={16} />
            <span>Perfil</span>
          </button>

          <button
            onClick={() => setShowTransparencia(true)}
            className="p-2 bg-orange-50 text-orange-800 hover:bg-orange-100 rounded-xl border border-orange-200 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Historial de alimentos recibidos"
          >
            <FileText size={16} />
            <span>Historial</span>
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

      {/* SECCIÓN CRÍTICA: ENTREGA ACTIVA / RECOJO EN CURSO */}
      {activeDelivery && (
        <div className="mb-5 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-4 shadow-lg shadow-orange-500/20 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              Recojo en curso
            </span>
            <span className="text-xs font-semibold text-amber-100">
              Presentar en bodega
            </span>
          </div>

          <h3 className="font-extrabold text-base mb-1">
            {activeDonation?.title || 'Lote de Alimentos Reservado'}
          </h3>
          <p className="text-xs text-amber-100 mb-3 flex items-center gap-1">
            <MapPin size={12} />
            {activeDonation?.donorBusinessName || 'Bodega'} — {activeDonation?.donorAddress}
          </p>

          {/* PIN GIGANTE CON BOTÓN DE COPIAR */}
          <div className="bg-white text-slate-900 p-3 rounded-xl mb-3 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PIN de 6 dígitos para el bodeguero:
              </span>
              <span className="text-2xl font-black tracking-widest text-orange-600 font-mono">
                {activeDelivery.pickupPin}
              </span>
            </div>
            <button
              onClick={() => handleCopyPin(activeDelivery.pickupPin)}
              className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 flex items-center gap-1 text-xs font-bold transition-colors"
            >
              {copiedPin ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span>{copiedPin ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* RUTA EN GOOGLE MAPS PARA LLEGAR A LA BODEGA */}
          {activeDonation?.location && (
            <div className="bg-white/10 rounded-xl p-2.5 mb-3 border border-white/20">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="flex items-center gap-1 text-amber-100">
                  <Navigation size={13} className="text-white" />
                  Ruta hacia la bodega
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeDonation.location.latitude},${activeDonation.location.longitude}&travelmode=walking`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white text-orange-700 hover:bg-amber-100 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-xs"
                >
                  Abrir Google Maps <ExternalLink size={11} />
                </a>
              </div>
              <div className="relative rounded-lg overflow-hidden h-24 border border-white/20 bg-slate-900">
                <iframe
                  title="Ruta Google Maps"
                  src={`https://maps.google.com/maps?q=${activeDonation.location.latitude},${activeDonation.location.longitude}&z=16&output=embed`}
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Botones de acción de la reserva */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveQrModalDelivery({ delivery: activeDelivery, donation: activeDonation })}
              className="py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <QrCode size={15} />
              <span>Ver Código QR</span>
            </button>

            {activeDonation?.donorPhone && (
              <a
                href={`tel:${activeDonation.donorPhone}`}
                className="py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone size={15} />
                <span>Llamar Bodega</span>
              </a>
            )}
          </div>

          <button
            onClick={() => cancelReservation(activeDelivery.id)}
            className="w-full text-center text-[11px] text-amber-200 hover:text-white mt-2.5 underline cursor-pointer"
          >
            ¿No podrás recogerlo? Cancelar reserva
          </button>
        </div>
      )}

      {/* Título de Radar de Alimentos Disponibles */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
            <Footprints size={16} className="text-emerald-700" />
            Alimentos Disponibles Cerca
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Ordenados por cercanía a pie en tiempo real</span>
        </div>
        <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
          {availableDonations.length} disponibles
        </span>
      </div>

      {/* Filtros de Categoría Estilo Delivery */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs font-bold">
        {[
          { id: 'TODAS', label: 'Todos', icon: '🍽️' },
          { id: 'PANADERIA', label: 'Panadería', icon: '🥖' },
          { id: 'FRUTAS_VERDURAS', label: 'Frutas y Verduras', icon: '🥦' },
          { id: 'ABARROTES', label: 'Abarrotes', icon: '🥫' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Feed de Donaciones con Miniaturas y Badges */}
      <div className="space-y-3.5">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
            <Package size={44} className="mx-auto text-slate-300 mb-2.5" />
            <p className="text-sm font-extrabold text-slate-800">No hay alimentos en esta categoría ahora</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Las bodegas cercanas notifican en cuanto tengan excedentes listos para donar.
            </p>
          </div>
        ) : (
          filteredDonations.map(donacion => {
            const tiempoCaminando = calcularTiempoCaminando(donacion.distanceMeters);

            return (
              <div 
                key={donacion.id}
                className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-4 shadow-sm transition-all group"
              >
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-center mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {donacion.category === 'PANADERIA' ? '🥖 Panadería' : donacion.category === 'FRUTAS_VERDURAS' ? '🥦 Frutas y Verduras' : '🥫 Abarrotes'}
                  </span>

                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Footprints size={12} className="text-emerald-600" />
                    {tiempoCaminando}
                  </span>
                </div>

                {/* Contenido principal con foto */}
                <div className="flex gap-3 items-start mb-3">
                  {donacion.photoUrl && (
                    <img 
                      src={donacion.photoUrl} 
                      alt={donacion.title} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs group-hover:scale-102 transition-transform" 
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {donacion.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {donacion.description}
                    </p>
                  </div>
                </div>

                {/* Info de Bodega y Horario */}
                <div className="bg-slate-50 rounded-xl p-2.5 mb-3 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between font-extrabold text-slate-800">
                    <span className="flex items-center gap-1">
                      <Store size={13} className="text-emerald-700" />
                      {donacion.donorBusinessName}
                    </span>
                    <span className="text-emerald-700 font-mono text-xs">{donacion.unitMeasure}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="truncate max-w-[150px]">{donacion.donorAddress}</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${donacion.location.latitude},${donacion.location.longitude}&travelmode=walking`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 underline shrink-0"
                    >
                      Ruta Maps <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock size={11} className="text-slate-400" />
                    Horario de recojo: hasta {new Date(donacion.pickupEndAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Botón de Reserva Directa */}
                <button
                  onClick={() => handleReserve(donacion.id)}
                  disabled={isReserving === donacion.id}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isReserving === donacion.id ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Generando PIN y confirmando reserva...</span>
                    </>
                  ) : (
                    <span>Apartar Alimento y Generar PIN</span>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ComedorDashboard;
