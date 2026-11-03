import React, { useState } from 'react';
import { useEcoFood } from '../context/EcoFoodContext';
import { 
  Store, 
  UtensilsCrossed, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  Leaf, 
  CreditCard, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Loader2, 
  CheckCircle2
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { loginWithCredentials, setCurrentScreen } = useEcoFood();

  // Tab principal: 'LOGIN' | 'REGISTER'
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Estados de inicio de sesión
  const [docNumber, setDocNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanDoc = docNumber.trim().replace(/\D/g, '');
    const cleanPin = pin.trim();

    if (!cleanDoc) {
      setLoginError('Ingresa tu número de DNI (8 dígitos) o RUC (11 dígitos).');
      return;
    }

    if (!cleanPin) {
      setLoginError('Ingresa tu PIN secreto de seguridad (4 dígitos).');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(r => setTimeout(r, 500));
      const res = loginWithCredentials(cleanDoc, cleanPin);

      if (!res.success) {
        setLoginError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="screen-scroll-container pb-16 flex flex-col justify-between min-h-full">
      <div>
        {/* Brand Header Ultra-Pulido */}
        <div className="text-center mt-2 mb-4">
          <div className="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-1 shadow-xl shadow-emerald-600/25 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center shadow-inner">
              <Leaf size={36} className="text-emerald-700 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>EcoFood Perú • Red Solidaria</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Salvemos alimentos juntos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium max-w-xs mx-auto">
            Conectamos bodegas donantes con comedores populares y ollas comunes en todo el país.
          </p>
        </div>

        {/* Ticker de Impacto Solidario Colectivo */}
        <div className="grid grid-cols-3 gap-2 bg-white border border-slate-200/90 rounded-2xl p-2.5 mb-5 text-center shadow-xs">
          <div>
            <span className="text-xs font-black text-emerald-700 font-mono block">12,450 kg</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Rescatados</span>
          </div>
          <div className="border-x border-slate-100">
            <span className="text-xs font-black text-orange-600 font-mono block">24,900</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Raciones</span>
          </div>
          <div>
            <span className="text-xs font-black text-teal-700 font-mono block">31.1 t</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">CO₂ Evitado</span>
          </div>
        </div>

        {/* Tab Switcher: Iniciar Sesión / Crear Cuenta */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl mb-5 gap-1 font-bold text-xs border border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('LOGIN'); setLoginError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn size={15} />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('REGISTER'); setLoginError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'REGISTER'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={15} />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* PESTAÑA: INICIAR SESIÓN */}
        {activeTab === 'LOGIN' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                Bienvenido a EcoFood
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa con tu documento de identidad y tu PIN secreto.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Campo Documento */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <CreditCard size={13} />
                  DNI o RUC
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={11}
                    value={docNumber}
                    onChange={(e) => {
                      setDocNumber(e.target.value.replace(/\D/g, ''));
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Ej. 45678912 o 20601234567"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-400 font-semibold">
                    {docNumber.length > 0 ? `${docNumber.length} dig.` : ''}
                  </span>
                </div>
              </div>

              {/* Campo PIN de Seguridad */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Lock size={13} />
                    PIN Secreto (4 dígitos)
                  </label>
                  <span className="text-[10px] text-slate-400">PIN de prueba: 1234</span>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ''));
                      if (loginError) setLoginError('');
                    }}
                    placeholder="••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error y Sugerencia de Registro */}
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
                    <span className="leading-snug">{loginError}</span>
                  </div>

                  {loginError.includes('No encontramos') && (
                    <div className="pt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('register_bodega')}
                        className="flex-1 py-1.5 bg-emerald-700 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-800 transition-colors"
                      >
                        + Registrar Bodega
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('register_comedor')}
                        className="flex-1 py-1.5 bg-orange-600 text-white rounded-lg text-[10px] font-bold hover:bg-orange-700 transition-colors"
                      >
                        + Registrar Comedor
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de Ingreso */}
              <button
                type="submit"
                disabled={isLoading || !docNumber.trim() || !pin.trim()}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-700/15 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Ingresar a mi Cuenta</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('REGISTER')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer"
              >
                ¿No tienes una cuenta? Regístrate gratis aquí
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: CREAR CUENTA */}
        {activeTab === 'REGISTER' && (
          <div className="space-y-3 animate-fade-in">
            <div className="mb-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Únete a la Red Solidaria
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Elige tu tipo de usuario para comenzar el registro.
              </p>
            </div>

            {/* Tarjeta 1: Bodega o Minimarket */}
            <div
              onClick={() => setCurrentScreen('register_bodega')}
              className="bg-white border-2 border-emerald-100 hover:border-emerald-600 rounded-2xl p-4 shadow-sm transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Store size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-800">
                      Soy Bodega o Minimarket
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Donante
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Dona excedentes limpios (pan, verduras), evita mermas y apoya a tu comunidad.
                  </p>
                </div>
              </div>

              <div className="p-2 text-emerald-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </div>

            {/* Tarjeta 2: Comedor Popular u Olla Común */}
            <div
              onClick={() => setCurrentScreen('register_comedor')}
              className="bg-white border-2 border-orange-100 hover:border-orange-500 rounded-2xl p-4 shadow-sm transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-800">
                      Soy Comedor u Olla Común
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-md">
                      Receptor
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Recibe alimentos gratuitos cercanos para optimizar el menú de tus beneficiarios.
                  </p>
                </div>
              </div>

              <div className="p-2 text-orange-600 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </div>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
              >
                ¿Ya tienes una cuenta registrada? Inicia sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Security Badges de Producción */}
      <div className="pt-6 border-t border-slate-200 mt-8">
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck size={16} className="text-emerald-700" />
            <span>Validación DNI / RUC</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HeartHandshake size={16} className="text-orange-600" />
            <span>100% Solidario</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 size={16} className="text-blue-600" />
            <span>Cifrado Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
