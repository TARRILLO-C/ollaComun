import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstallNative: boolean;
  onNativeInstall: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  canInstallNative,
  onNativeInstall
}) => {
  if (!isOpen) return null;

  const [installClicked, setInstallClicked] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleActionClick = async () => {
    // 1. Revisar si window.deferredPwaPrompt está disponible globalmente
    const promptEvent = (window as any).deferredPwaPrompt;
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          (window as any).deferredPwaPrompt = null;
        }
        onClose();
        return;
      } catch (e) {
        console.warn('Error al ejecutar prompt PWA nativo:', e);
      }
    }

    if (canInstallNative) {
      onNativeInstall();
      onClose();
      return;
    }

    // Si el navegador requiere interacción manual (como Safari o Edge desktop sin prompt anticipado)
    setInstallClicked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera con Branding */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <Download size={24} className="text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider uppercase bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  App Ligera & Rápida
                </span>
                <Sparkles size={13} className="text-amber-300" />
              </div>
              <h3 className="text-xl font-black tracking-tight mt-1">Instalar EcoFood</h3>
            </div>
          </div>
          
          <p className="text-xs text-emerald-100 mt-3 leading-relaxed">
            Instálala en tu dispositivo sin ocupar espacio de memoria, con acceso directo y alertas de alimentos al instante.
          </p>
        </div>

        {/* Contenido / Botón y Pasos */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* BOTÓN PRINCIPAL DE INSTALACIÓN SIEMPRE VISIBLE */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-500/40 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Download size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Descargar e Instalar en 1 Paso</h4>
                <p className="text-xs text-slate-600">
                  {canInstallNative 
                    ? 'Tu navegador está listo para instalarla automáticamente.' 
                    : 'Agrega el acceso directo oficial a tu pantalla de inicio.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={18} strokeWidth={2.5} />
              <span>Instalar EcoFood en este Dispositivo</span>
            </button>

            {/* Aviso tras hacer clic si el navegador requiere un toque manual */}
            {installClicked && !canInstallNative && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-in fade-in">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Tu navegador {isIOS ? 'Safari' : 'web'} requiere que confirmes la instalación: sigue los 2 pasos rápidos que se resaltan abajo.
                </p>
              </div>
            )}
          </div>

          {/* Guía Visual Paso a Paso */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>¿Cómo se agrega en cada navegador?</span>
            </h4>

            {/* Caso iPhone / iPad / Safari */}
            <div className={`p-3.5 rounded-2xl border transition-all ${isIOS || installClicked ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Smartphone size={15} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-extrabold text-slate-900">En iPhone / iPad (Safari)</span>
                  {isIOS && <span className="ml-2 text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm">Tu dispositivo</span>}
                </div>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 ml-1">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Presiona el botón <strong>Compartir</strong> en la barra inferior <Share size={13} className="inline text-blue-600 ml-1" />.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Desliza y selecciona <strong>"Agregar a pantalla de inicio"</strong> <PlusSquare size={13} className="inline text-slate-700 ml-1" />.</span>
                </li>
              </ol>
            </div>

            {/* Caso Android / Chrome / Edge */}
            <div className={`p-3.5 rounded-2xl border transition-all ${isAndroid ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone size={15} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-extrabold text-slate-900">En Android (Chrome / Brave / Edge)</span>
                  {isAndroid && <span className="ml-2 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">Tu dispositivo</span>}
                </div>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 ml-1">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Presiona el menú de 3 puntos <MoreVertical size={13} className="inline text-slate-700" /> arriba a la derecha.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Toca <strong>"Instalar aplicación"</strong> o "Agregar a la pantalla principal".</span>
                </li>
              </ol>
            </div>

            {/* Caso Computadora / PC / Mac */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Monitor size={15} />
                </div>
                <span className="text-xs font-extrabold text-slate-900">En Computadora (Chrome / Edge / Opera)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed ml-1">
                Haz clic en el ícono de <strong>Instalar</strong> <Download size={12} className="inline text-emerald-600" /> en el extremo derecho de la barra de direcciones de tu navegador.
              </p>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>PWA Oficial • Menos de 1 MB</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
