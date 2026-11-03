import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  ArrowLeft, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Flashlight, 
  RefreshCw, 
  ShieldCheck, 
  ScanLine,
  X
} from 'lucide-react';

/**
 * QRScanner.jsx - Componente para el Bodeguero (Donante)
 * 
 * Permite escanear el código QR que presenta el comedor popular para cerrar
 * el ciclo de la donación y marcarla como "Entregado".
 * 
 * REGLA DE USABILIDAD CRÍTICA:
 * Cuenta con un input manual alternativo de 6 dígitos para tipear el PIN de seguridad
 * en caso de que la cámara no enfoque o el brillo de la pantalla impida la lectura.
 */
export const QRScanner = ({ 
  onScanSuccess, 
  onManualPinSubmit, 
  onBack,
  donationTitle = 'Donación de Alimentos' 
}) => {
  const [pinInput, setPinInput] = useState('');
  const [inputMode, setInputMode] = useState('SCANNER'); // 'SCANNER' | 'MANUAL_PIN'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);

  // Inicialización de cámara del dispositivo móvil
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Cámara no disponible, pasando a modo PIN manual:', err);
        setInputMode('MANUAL_PIN');
      }
    };

    if (inputMode === 'SCANNER' && !isSuccess) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [inputMode, isSuccess]);

  // Manejo de confirmación por PIN manual
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().replace(/\D/g, '');

    if (cleanPin.length !== 6) {
      setErrorMessage('El PIN de recojo debe tener exactamente 6 dígitos numéricos');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (onManualPinSubmit) {
        onManualPinSubmit(cleanPin);
      }
      setIsSuccess(true);
      setTimeout(() => {
        if (onScanSuccess) onScanSuccess(cleanPin);
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'El código PIN ingresado es incorrecto o ya expiró');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulación de detección automática de código QR desde la cámara
  const handleSimulateScanDetection = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onScanSuccess) {
        setTimeout(() => onScanSuccess('ECO-DON-749215-VERIFY'), 1400);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-50 text-slate-900 overflow-y-auto animate-fade-in">
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
            Validación de Entrega
          </span>
          <h2 className="text-sm font-extrabold truncate">Confirmar Recojo</h2>
        </div>

        <button 
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer shrink-0"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {/* Selector de Pestañas: Escáner vs PIN Manual */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setInputMode('SCANNER')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              inputMode === 'SCANNER'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={15} />
            <span>Escanear QR</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('MANUAL_PIN')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              inputMode === 'MANUAL_PIN'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound size={15} />
            <span>PIN de 6 Dígitos</span>
          </button>
        </div>

        {/* Estado de Éxito: "Entregado" */}
        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-center animate-fade-in my-6">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
              <CheckCircle2 size={36} />
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-1.5">
              Estado: Entregado
            </span>
            <h2 className="text-lg font-black text-emerald-950">¡Entrega Confirmada!</h2>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed max-w-xs mx-auto">
              El ciclo se ha cerrado exitosamente. Gracias por evitar el desperdicio de alimentos y apoyar a tu comunidad.
            </p>
          </div>
        ) : inputMode === 'SCANNER' ? (
          
          /* MODO 1: VISOR DE CÁMARA ESCÁNER QR */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center shadow-xs space-y-3">
            <div className="relative w-full aspect-square max-w-[240px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-5 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-3 border-l-3 border-emerald-400 rounded-tl-xs" />
                  <span className="w-4 h-4 border-t-3 border-r-3 border-emerald-400 rounded-tr-xs" />
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse" />
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-3 border-l-3 border-emerald-400 rounded-bl-xs" />
                  <span className="w-4 h-4 border-b-3 border-r-3 border-emerald-400 rounded-br-xs" />
                </div>
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <Loader2 size={32} className="animate-spin text-emerald-400 mb-2" />
                  <span className="text-xs font-bold">Procesando código QR...</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Apunta con la cámara hacia el código QR en la pantalla del comedor.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSimulateScanDetection}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ScanLine size={15} />
                <span>Simular Lectura QR Rápida</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('MANUAL_PIN')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer py-1"
              >
                ¿La pantalla tiene reflejo? Ingresa el PIN manual
              </button>
            </div>
          </div>
        ) : (
          
          /* MODO 2: REGLA DE USABILIDAD - INPUT ALTERNATIVO DE PIN */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                <KeyRound size={18} />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ingreso Manual de PIN
                </h3>
                <p className="text-[11px] text-slate-500">
                  Respaldo contra reflejos o fallas de cámara
                </p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Código PIN de 6 Dígitos
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[8px] font-mono font-black bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 rounded-2xl py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all placeholder-slate-300"
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 text-center block mt-1.5">
                  Pide al comedor el código numérico de 6 dígitos que figura bajo su QR.
                </span>
              </div>

              <button
                type="submit"
                disabled={pinInput.length !== 6 || isProcessing}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    <span>Validando PIN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Validar y Marcar como "Entregado"</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setInputMode('SCANNER')}
                className="w-full text-xs text-slate-500 hover:text-slate-800 py-1 font-semibold text-center block cursor-pointer"
              >
                ← Volver al lector de cámara
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
