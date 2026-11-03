import React, { useState } from 'react';
import { 
  Bell, 
  Leaf, 
  X, 
  CheckCheck, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  MapPin, 
  Sparkles,
  Info
} from 'lucide-react';

/**
 * Navbar.jsx con Buzón de Notificaciones Recuperable
 * 
 * Regla de Usabilidad Crítica:
 * La campana superior permite a los comedores populares recuperar alertas
 * de donaciones que hayan descartado o cerrado por accidente en su teléfono.
 */
export const Navbar = ({ 
  currentRole = 'COMEDOR', // 'BODEGA' | 'COMEDOR'
  userBusinessName = 'Comedor Popular Santa Rosa',
  onNotificationSelect,
  onNavigateTab
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Datos mock iniciales del buzón de notificaciones
  const [notificaciones, setNotificaciones] = useState([
    {
      id: 'notif-01',
      titulo: '¡Alerta de Alimento a 450m!',
      mensaje: 'Bodega Don Pepe acaba de publicar 40 panes ciabatta y queques del día.',
      tiempo: 'Hace 8 min',
      leido: false,
      donacionId: 'don-01',
      categoria: 'PANADERIA',
      distancia: '450 metros (~5 min)'
    },
    {
      id: 'notif-02',
      titulo: 'Verduras frescas disponibles',
      mensaje: 'Minimarket Los Andes donó una jaba surtida de tomates y lechugas.',
      tiempo: 'Hace 25 min',
      leido: false,
      donacionId: 'don-02',
      categoria: 'FRUTAS_VERDURAS',
      distancia: '980 metros (~12 min)'
    },
    {
      id: 'notif-03',
      titulo: 'Entrega confirmada',
      mensaje: 'El bodeguero validó tu PIN y la entrega ha finalizado con éxito.',
      tiempo: 'Hace 2 horas',
      leido: true,
      donacionId: null,
      categoria: 'SISTEMA',
      distancia: null
    }
  ]);

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  const marcarTodasLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
  };

  const handleSelectNotif = (notif) => {
    // Marcar como leída
    setNotificaciones(prev => 
      prev.map(n => n.id === notif.id ? { ...n, leido: true } : n)
    );

    if (onNotificationSelect && notif.donacionId) {
      onNotificationSelect(notif.donacionId);
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Barra de Navegación Superior */}
      <nav className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 selection:bg-blue-600">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Logo y Rol */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Leaf size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">EcoFood</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  currentRole === 'BODEGA'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {currentRole === 'BODEGA' ? 'Bodeguero' : 'Comedor'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                {userBusinessName}
              </p>
            </div>
          </div>

          {/* Acciones de la Barra Superior */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('transparencia')}
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/60 border border-slate-700 transition-colors"
              >
                Impacto e Historial
              </button>
            )}

            {/* Ícono de Campana con Badge de Alertas no leídas */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Abrir buzón de notificaciones"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL / SIDEBAR: BUZÓN DE NOTIFICACIONES */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          
          {/* Panel Lateral Deslizante */}
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
            
            {/* Header del Buzón */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <Bell size={18} />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">Buzón de Notificaciones</h3>
                  <p className="text-xs text-slate-400">Recupera alertas cerradas por error</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Banner de Usabilidad */}
            <div className="bg-slate-800/60 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Info size={13} className="text-blue-400 shrink-0" />
                <span>¿Cerraste una alerta por accidente? Aquí sigue guardada.</span>
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasLeidas}
                  className="text-blue-400 hover:underline font-bold text-[11px] shrink-0 ml-2"
                >
                  Leídas
                </button>
              )}
            </div>

            {/* Lista de Alertas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notificaciones.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-sm font-semibold">No tienes notificaciones acumuladas</p>
                </div>
              ) : (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleSelectNotif(notif)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      notif.leido
                        ? 'bg-slate-800/40 border-slate-800 opacity-75'
                        : 'bg-slate-800/90 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {!notif.leido && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        )}
                        <h4 className="text-sm font-extrabold text-white leading-tight">
                          {notif.titulo}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock size={11} /> {notif.tiempo}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {notif.mensaje}
                    </p>

                    {/* Metadata de cercanía y botón de reabrir */}
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      {notif.distancia ? (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <MapPin size={12} /> {notif.distancia}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Aviso informativo</span>
                      )}

                      {notif.donacionId && (
                        <button
                          type="button"
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <span>Reabrir Alerta</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer del Drawer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Cerrar Buzón
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
