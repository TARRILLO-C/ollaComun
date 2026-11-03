import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { 
  Copy, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Store,
  Info,
  Navigation,
  ExternalLink,
  X
} from 'lucide-react';

export const QRDisplay = ({ 
  donation = {
    id: 'don-01',
    title: '40 panes ciabatta y franceses surtidos',
    quantity: '5 a 10 kg',
    donorBusinessName: 'Bodega Don Pepe',
    donorAddress: 'Av. Próceres de la Independencia 1420',
  },
  pin = '749215',
  qrValue = 'ECO-DON-01-749215-VERIFY',
  onBack 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden animate-fade-in">
      {/* Header Fijo */}
      <header className="px-4 py-3.5 bg-orange-600 text-white flex items-center justify-between shrink-0 shadow-sm">
        <button 
          type="button"
          onClick={onBack}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 block">
            Pase de Recojo
          </span>
          <h2 className="text-sm font-extrabold">Confirmar Entrega</h2>
        </div>

        <button 
          type="button"
          onClick={onBack}
          className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </header>

      {/* Cuerpo Scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        {/* Info del Comercio */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Store size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Punto de Recojo (Bodega)
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 truncate">
                {donation.donorBusinessName}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {donation.donorAddress}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Alimento:</span>
            <span className="font-extrabold text-slate-900">{donation.title}</span>
          </div>
        </div>

        {/* Tarjeta Central: CÓDIGO QR */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-center shadow-xs">
          <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">
            Muestra este código al Bodeguero
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">
            El donante escaneará este código para sellar la entrega.
          </p>

          {/* Contenedor del QR */}
          <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-slate-200 mx-auto">
            <div style={{ height: 'auto', margin: '0 auto', maxWidth: 190, width: '100%' }}>
              <QRCode
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={qrValue || `ECOFOOD-DONATION-${donation.id}-${pin}`}
                viewBox={`0 0 256 256`}
                level="H"
              />
            </div>
          </div>

          {/* PIN GIGANTE ALTERNATIVO */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="text-orange-600" />
              <span>PIN de Seguridad Alternativo</span>
            </div>

            <div className="bg-white border-2 border-dashed border-orange-400 rounded-2xl py-2.5 px-4 flex items-center justify-between max-w-xs mx-auto shadow-xs">
              <span className="text-3xl font-mono font-black text-orange-600 tracking-[8px] pl-2 select-all">
                {pin}
              </span>

              <button
                type="button"
                onClick={handleCopyPin}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Si la cámara tiene reflejos de luz, dicta este PIN de 6 dígitos.
            </p>
          </div>
        </div>

        {/* BOTÓN RUTA A PIE */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${donation?.location?.latitude || -12.0154},${donation?.location?.longitude || -76.9982}&travelmode=walking`}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
        >
          <Navigation size={16} />
          <span>Ver ruta a pie hacia la bodega</span>
          <ExternalLink size={14} className="opacity-80" />
        </a>
      </div>
    </div>
  );
};

export default QRDisplay;
