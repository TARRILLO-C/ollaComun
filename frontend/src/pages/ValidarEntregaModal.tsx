import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  QrCode, 
  KeyRound, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Loader2, 
  Soup, 
  User, 
  Phone, 
  MapPin, 
  PackageCheck,
  ShieldCheck,
  X
} from 'lucide-react';
import { useEcoFood } from '../context/EcoFoodContext';

interface ValidarEntregaModalProps {
  onBack: () => void;
  onSuccess: (code: string) => void;
}

interface DetalleConfirmacion {
  code: string;
  donationId: string;
  title: string;
  category: string;
  quantity: string;
  comedorNombre: string;
  representanteNombre: string;
  comedorTelefono: string;
  comedorDireccion: string;
}

export const ValidarEntregaModal: React.FC<ValidarEntregaModalProps> = ({ onBack, onSuccess }) => {
  const { validateDelivery, donations, deliveries, users } = useEcoFood();

  // Modo activo: 'QR' | 'PIN'
  const [activeTab, setActiveTab] = useState<'QR' | 'PIN'>('QR');
  const [pinInput, setPinInput] = useState('');

  // Estados de cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Estados de flujo y validación
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [intentosRestantes, setIntentosRestantes] = useState<number | null>(null);
  const [isPinBloqueado, setIsPinBloqueado] = useState(false);

  // Paso 2: Tarjeta de confirmación previa antes de DELIVERED
  const [detalleConfirmacion, setDetalleConfirmacion] = useState<DetalleConfirmacion | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // Inicializar o apagar cámara según el tab
  useEffect(() => {
    if (activeTab === 'QR' && !detalleConfirmacion) {
      iniciarCamara();
    } else {
      detenerCamara();
    }

    return () => {
      detenerCamara();
    };
  }, [activeTab, detalleConfirmacion]);

  const iniciarCamara = async () => {
    setCameraNotice(null);
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fallbackToPin('Este navegador no soporta acceso directo a la cámara. Usa el código PIN.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(e => console.warn('Autoplay error:', e));
      }
    } catch (err: any) {
      console.warn('Fallo acceso de cámara:', err);
      fallbackToPin(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Permiso de cámara denegado. Cambiando al modo de ingreso por PIN de 6 dígitos.'
          : 'No se detectó cámara disponible. Cambiando a ingreso por PIN.'
      );
    }
  };

  const detenerCamara = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const fallbackToPin = (aviso: string) => {
    detenerCamara();
    setCameraNotice(aviso);
    setActiveTab('PIN');
  };

  // Paso 1: Resolver y buscar la donación asociada al código ingresado (QR o PIN)
  const handleConsultarCodigo = async (codigo: string) => {
    const cleanCode = codigo.trim();
    if (!cleanCode) return;

    if (isPinBloqueado && cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
      setErrorMessage('La validación por PIN ha sido bloqueada tras 3 intentos. Escanea obligatoriamente el código QR.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      await new Promise(r => setTimeout(r, 600));

      // Buscar entrega que coincida con el PIN o el QR
      const delivery = deliveries.find(
        d => (d.pickupPin === cleanCode || d.qrHashToken === cleanCode || cleanCode.includes(d.id)) &&
             d.status === 'PENDING_PICKUP'
      );

      if (!delivery) {
        // Manejar intento fallido si fue por PIN de 6 dígitos
        if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
          const restantes = (intentosRestantes === null ? 3 : intentosRestantes) - 1;
          if (restantes <= 0) {
            setIsPinBloqueado(true);
            setIntentosRestantes(0);
            setActiveTab('QR');
            setErrorMessage('Has superado los 3 intentos permitidos. El PIN ha sido BLOQUEADO. Debes escanear el código QR.');
          } else {
            setIntentosRestantes(restantes);
            setErrorMessage(`Código PIN incorrecto. Te quedan ${restantes} intento(s) antes de bloquear el acceso por PIN.`);
          }
        } else {
          setErrorMessage('El código QR o PIN no coincide con ninguna entrega pendiente o ya fue entregada.');
        }
        return;
      }

      // Obtener datos de la donación y del comedor
      const donacion = donations.find(d => d.id === delivery.donationId);
      const comedorUser = users.find(u => u.id === delivery.receiverId || u.role === 'COMEDOR');

      setDetalleConfirmacion({
        code: cleanCode,
        donationId: donacion?.id || delivery.donationId,
        title: donacion?.title || 'Lote de alimentos solidarios',
        category: donacion?.category || 'ALIMENTOS',
        quantity: donacion?.unitMeasure || '5 kg (~10 raciones)',
        comedorNombre: delivery.receiverBusinessName || comedorUser?.businessName || 'Comedor Popular San Martín',
        representanteNombre: comedorUser?.representativeName || 'Rosa Meléndez Quispe',
        comedorTelefono: delivery.receiverPhone || comedorUser?.phone || '+51 991 234 567',
        comedorDireccion: comedorUser?.addressLine || 'Urb. Canto Grande, S.J.L.'
      });

      detenerCamara();
    } finally {
      setIsVerifying(false);
    }
  };

  // Paso 2: Bodeguero presiona "Confirmar Entrega Física"
  const handleConfirmarEntregaFinal = async () => {
    if (!detalleConfirmacion) return;

    setIsDelivering(true);
    setErrorMessage('');

    try {
      await new Promise(r => setTimeout(r, 700));
      const res = validateDelivery(detalleConfirmacion.code);

      if (res.success) {
        setDeliverySuccess(true);
        setTimeout(() => {
          onSuccess(detalleConfirmacion.code);
        }, 1200);
      } else {
        setErrorMessage(res.message || 'No se pudo sellar la entrega. Intenta nuevamente.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de comunicación al sellar la entrega.');
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden animate-fade-in">
      {/* Header Fijo */}
      <header className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm gap-2">
        <button 
          type="button"
          onClick={onBack}
          disabled={isDelivering}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <div className="text-center min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block truncate">
            Cierre Transaccional
          </span>
          <h2 className="text-sm font-extrabold truncate">Validar Entrega</h2>
        </div>

        <button 
          type="button"
          onClick={onBack}
          disabled={isDelivering}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </header>

      {/* Contenedor Principal */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Éxito Final */}
          {deliverySuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-center animate-fade-in my-6">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-lg font-black text-emerald-950">¡Entrega Sellada con Éxito!</h2>
              <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed">
                El alimento ha sido entregado oficialmente. Gracias por evitar el desperdicio.
              </p>
            </div>
          ) : detalleConfirmacion ? (
            /* PASO 3: TARJETA DE VERIFICACIÓN VISUAL ANTES DE DELIVERED */
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-extrabold text-amber-950 block">Verificación de Identidad</span>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-snug">
                    Verifica que la persona física que retira los alimentos coincida con los datos del comedor:
                  </p>
                </div>
              </div>

              {/* Tarjeta de Datos del Comedor */}
              <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <Soup size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">
                      Comedor Receptor
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {detalleConfirmacion.comedorNombre}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User size={15} className="text-slate-400 shrink-0" />
                    <span><strong>Representante:</strong> {detalleConfirmacion.representanteNombre}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={15} className="text-slate-400 shrink-0" />
                    <span><strong>Teléfono:</strong> {detalleConfirmacion.comedorTelefono}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin size={15} className="text-slate-400 shrink-0" />
                    <span className="truncate"><strong>Dirección:</strong> {detalleConfirmacion.comedorDireccion}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mt-2 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Lote a entregar</span>
                      <span className="text-xs font-bold text-slate-800">{detalleConfirmacion.title}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      {detalleConfirmacion.quantity}
                    </span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Botón Final Confirmar */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isDelivering}
                  onClick={handleConfirmarEntregaFinal}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  {isDelivering ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sellando entrega @Transactional...</span>
                    </>
                  ) : (
                    <>
                      <PackageCheck size={18} />
                      <span>Confirmar Entrega Física</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isDelivering}
                  onClick={() => {
                    setDetalleConfirmacion(null);
                    setErrorMessage('');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar o reintentar otro código
                </button>
              </div>
            </div>
          ) : (
            /* PASO 1: PESTAÑAS QR / PIN */
            <div className="space-y-4">
              
              {/* Aviso si la cámara no pudo iniciar */}
              {cameraNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 animate-fade-in">
                  <CameraOff size={16} className="shrink-0 text-amber-600" />
                  <span>{cameraNotice}</span>
                </div>
              )}

              {/* Selector de Pestañas */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('QR');
                    setErrorMessage('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'QR'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <QrCode size={15} />
                  <span>Escanear QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('PIN');
                    setErrorMessage('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'PIN'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <KeyRound size={15} />
                  <span>Ingresar PIN</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* MODO 1: ESCANEAR QR */}
              {activeTab === 'QR' && (
                <div className="space-y-3">
                  <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-inner border-2 border-slate-800 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />

                    {/* Marco visual del escáner */}
                    <div className="absolute inset-0 border-2 border-emerald-400/40 m-8 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                    </div>

                    {!isCameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 p-4 text-center">
                        <Camera size={32} className="mb-2 text-slate-500 animate-bounce" />
                        <span className="text-xs font-semibold">Activando cámara trasera...</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 text-center max-w-xs mx-auto">
                    Apunta la cámara al código QR que te muestre la responsable del Comedor en su teléfono.
                  </p>
                </div>
              )}

              {/* MODO 2: INGRESAR PIN (6 DÍGITOS) */}
              {activeTab === 'PIN' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Código PIN de 6 Dígitos
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      disabled={isPinBloqueado || isVerifying}
                      value={pinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPinInput(val);
                        if (errorMessage) setErrorMessage('');
                        if (val.length === 6) {
                          handleConsultarCodigo(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!/[\d]|Backspace|Tab|ArrowLeft|ArrowRight|Delete|Enter/.test(e.key) && !e.ctrlKey) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="000000"
                      className="w-full text-center text-3xl tracking-[8px] font-mono font-black bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-2xl py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all placeholder-slate-300 disabled:opacity-50"
                      autoFocus
                    />

                    <span className="text-[10px] text-slate-400 block mt-2">
                      Pide al comedor el código numérico de 6 dígitos que figura debajo de su QR.
                    </span>

                    {intentosRestantes !== null && !isPinBloqueado && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        ⚠️ Quedan {intentosRestantes} de 3 intentos
                      </span>
                    )}

                    {isPinBloqueado && (
                      <div className="mt-2 p-2 rounded-xl bg-red-100 text-red-700 text-[11px] font-bold">
                        🔒 PIN Bloqueado por seguridad. Usa la pestaña "Escanear QR".
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={pinInput.length !== 6 || isVerifying || isPinBloqueado}
                    onClick={() => handleConsultarCodigo(pinInput)}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verificando PIN...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} />
                        <span>Validar Código</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidarEntregaModal;
