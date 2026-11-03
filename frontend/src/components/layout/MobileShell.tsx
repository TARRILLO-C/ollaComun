import React, { useState } from 'react';
import { useEcoFood } from '../../context/EcoFoodContext';
import { 
  Store, 
  UtensilsCrossed, 
  RotateCcw,
  CheckCircle,
  Wifi,
  BarChart3,
  RefreshCw,
  LogOut,
  Sliders,
  ChevronUp,
  ChevronDown,
  Plus
} from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const { 
    activeRole, 
    switchDemoRole, 
    currentScreen, 
    setCurrentScreen, 
    activeToast,
    resetDemoData,
    logout
  } = useEcoFood();

  const [showDevPill, setShowDevPill] = useState(false);

  return (
    <>
      {/* Flotante Dev Tools (solo para pruebas en desktop, fuera de la pantalla del celular) */}
      <div className="hidden lg:flex fixed top-4 right-4 z-50 bg-slate-900/90 text-slate-300 backdrop-blur-md border border-slate-700 rounded-2xl p-2 shadow-2xl items-center gap-2 text-xs">
        <span className="text-[10px] font-bold text-slate-400 pl-2">Ambiente Dev:</span>
        <button
          onClick={() => switchDemoRole('BODEGA')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
            activeRole === 'BODEGA' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🏪 Bodega
        </button>
        <button
          onClick={() => switchDemoRole('COMEDOR')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
            activeRole === 'COMEDOR' ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🍲 Comedor
        </button>
        <button
          onClick={resetDemoData}
          title="Reiniciar datos demo a estado original"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
        </button>
        {activeRole && (
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
          </button>
        )}
      </div>

      <div className="pwa-app-wrapper">
        {/* Dispositivo Mobile Status Bar Limpia y Moderna */}
        <div className="device-status-bar">
          <span className="font-mono font-bold text-slate-700">09:41</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Wifi size={12} />
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-700 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Notificación Toast Flotante con Glassmorphism */}
        {activeToast && (
          <div className="floating-toast">
            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-bold leading-snug">{activeToast}</span>
          </div>
        )}

        {/* Pantalla Activa */}
        {children}

        {/* Bottom Navigation Bar Ultra-Moderna */}
        {activeRole && currentScreen !== 'welcome' && currentScreen !== 'register_bodega' && currentScreen !== 'register_comedor' && (
          <nav className="bottom-nav-bar">
            {activeRole === 'BODEGA' ? (
              <>
                <button 
                  className={`nav-item-btn ${currentScreen === 'bodega_dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentScreen('bodega_dashboard')}
                >
                  <Store size={20} />
                  <span>Mi Bodega</span>
                </button>

                {/* Botón Central Elevado */}
                <button 
                  className="flex flex-col items-center -mt-6 cursor-pointer group"
                  onClick={() => {
                    setCurrentScreen('bodega_dashboard');
                    const donateBtn = document.querySelector('.btn-dominant-donate') as HTMLButtonElement;
                    if (donateBtn) donateBtn.click();
                  }}
                >
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-700/35 border-2 border-white group-hover:scale-105 active:scale-95 transition-all">
                    <Plus size={26} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-800 mt-1">Donar</span>
                </button>

                <button 
                  className={`nav-item-btn ${currentScreen === 'welcome' ? 'active' : ''}`}
                  onClick={() => setCurrentScreen('welcome')}
                >
                  <RotateCcw size={20} />
                  <span>Cambiar Rol</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`nav-item-btn ${currentScreen === 'comedor_dashboard' ? 'active-orange' : ''}`}
                  onClick={() => setCurrentScreen('comedor_dashboard')}
                >
                  <UtensilsCrossed size={20} />
                  <span>Alimentos</span>
                </button>

                <button 
                  className="nav-item-btn"
                  onClick={() => {
                    const histBtn = document.querySelector('button[title="Historial de alimentos recibidos"]') as HTMLButtonElement;
                    if (histBtn) histBtn.click();
                  }}
                >
                  <BarChart3 size={20} />
                  <span>Historial</span>
                </button>

                <button 
                  className={`nav-item-btn ${currentScreen === 'welcome' ? 'active' : ''}`}
                  onClick={() => setCurrentScreen('welcome')}
                >
                  <RotateCcw size={20} />
                  <span>Cambiar Rol</span>
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </>
  );
};
