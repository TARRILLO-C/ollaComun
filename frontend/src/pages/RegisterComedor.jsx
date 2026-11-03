import React, { useState } from 'react';
import { 
  Soup, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  Phone, 
  MapPin, 
  Navigation, 
  Compass, 
  ExternalLink,
  Users,
  HeartHandshake,
  Search,
  Crosshair,
  Lock,
  X
} from 'lucide-react';

export const RegisterComedor = ({ onBack, onRegistrationSuccess }) => {
  // Form states
  const [docNumber, setDocNumber] = useState('');
  const [pin, setPin] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [racionesDiarias, setRacionesDiarias] = useState('80');

  // Coordenadas Google Maps / GPS
  const [coords, setCoords] = useState({ latitude: -12.0210, longitude: -77.0015 });
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // Buscador interactivo de lugares en Google Maps (Nacional Perú)
  const [locationQuery, setLocationQuery] = useState('');
  const [mapSearchText, setMapSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const POPULAR_PERU_REGIONS = [
    { name: 'Lima', lat: -12.0464, lng: -77.0428, address: 'Lima, Perú' },
    { name: 'Arequipa', lat: -16.4090, lng: -71.5375, address: 'Arequipa, Perú' },
    { name: 'Trujillo', lat: -8.1118, lng: -79.0287, address: 'Trujillo, La Libertad, Perú' },
    { name: 'Chiclayo', lat: -6.7714, lng: -79.8409, address: 'Chiclayo, Lambayeque, Perú' },
    { name: 'Piura', lat: -5.1945, lng: -80.6328, address: 'Piura, Perú' },
    { name: 'Cusco', lat: -13.5319, lng: -71.9675, address: 'Cusco, Perú' },
    { name: 'Huancayo', lat: -12.0651, lng: -75.2049, address: 'Huancayo, Junín, Perú' },
    { name: 'Ica', lat: -14.0678, lng: -75.7286, address: 'Ica, Perú' }
  ];

  const handleSearchAddressOnMap = async (e) => {
    if (e) e.preventDefault();
    const query = locationQuery.trim();
    if (!query) return;

    setIsSearchingLocation(true);
    setSearchResults([]);

    try {
      // 1. Filtrar regiones peruanas
      const localMatches = POPULAR_PERU_REGIONS.filter(z => 
        z.name.toLowerCase().includes(query.toLowerCase()) ||
        z.address.toLowerCase().includes(query.toLowerCase())
      );

      // 2. Consulta de geocodificación abierta a nivel NACIONAL en Perú (sin forzar Lima)
      const searchQuery = query.toLowerCase().includes('peru') || query.toLowerCase().includes('perú') 
        ? query 
        : `${query}, Perú`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pe&limit=6`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await response.json();

      let apiMatches = [];
      if (Array.isArray(data) && data.length > 0) {
        apiMatches = data.map(item => ({
          name: item.display_name.split(',').slice(0, 2).join(','),
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
      }

      // 3. Opción directa para centrar Google Maps con el término exacto ingresado
      const directGoogleMapsOption = {
        name: query,
        address: `Buscar "${query}" en Google Maps Perú`,
        isDirectQuery: true,
        lat: coords.latitude,
        lng: coords.longitude
      };

      const combined = [...localMatches, ...apiMatches];
      if (combined.length === 0) {
        setSearchResults([directGoogleMapsOption]);
      } else {
        setSearchResults([...combined, directGoogleMapsOption]);
      }
    } catch (err) {
      console.warn('Geocoding search notice:', err);
      setSearchResults([
        {
          name: query,
          address: `Ubicar "${query}" directamente en Google Maps`,
          isDirectQuery: true,
          lat: coords.latitude,
          lng: coords.longitude
        }
      ]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    if (item.isDirectQuery) {
      setMapSearchText(`${item.name}, Perú`);
      if (!address.trim()) {
        setAddress(item.name);
      }
    } else {
      setCoords({ latitude: item.lat, longitude: item.lng });
      setMapSearchText('');
      if (!address.trim()) {
        setAddress(item.address || item.name);
      }
    }
    setSearchResults([]);
    setLocationQuery(item.name);
    setLocationDetected(true);
  };

  const handleNudgePin = (deltaLat, deltaLng) => {
    setMapSearchText('');
    setCoords(prev => ({
      latitude: parseFloat((prev.latitude + deltaLat).toFixed(5)),
      longitude: parseFloat((prev.longitude + deltaLng).toFixed(5))
    }));
    setLocationDetected(true);
  };

  // Status & Validation
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!docNumber.trim() || !/^\d{8}$/.test(docNumber)) {
      newErrors.docNumber = 'El DNI de la responsable debe tener exactamente 8 dígitos';
    }

    if (!pin.trim() || pin.length < 4) {
      newErrors.pin = 'Crea un PIN numérico de al menos 4 dígitos para tu acceso';
    }

    if (!businessName.trim()) {
      newErrors.businessName = 'El nombre del comedor popular u olla común es obligatorio';
    }

    if (!representativeName.trim()) {
      newErrors.representativeName = 'El nombre de la presidenta o responsable es obligatorio';
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const isValidPeruPhone = /^(?:(?:\+?51)|0)?9\d{8}$/.test(cleanPhone);
    if (!phone.trim() || !isValidPeruPhone) {
      newErrors.phone = 'Ingresa un celular peruano válido (9 dígitos comenzando con 9)';
    }

    if (!address.trim()) {
      newErrors.address = 'La dirección del local es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este navegador.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
        setLocationDetected(true);
      },
      (error) => {
        console.warn('GPS error:', error);
        setIsLocating(false);
        setLocationDetected(true);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSuccess(true);
      if (onRegistrationSuccess) {
        setTimeout(() => {
          onRegistrationSuccess({
            role: 'COMEDOR',
            docType: 'DNI',
            docNumber,
            pin: pin.trim() || '1234',
            businessName,
            representativeName,
            phone,
            address,
            racionesDiarias,
            location: coords
          });
        }, 1100);
      }
    } catch (err) {
      setErrors({ form: 'Ocurrió un error al registrar el comedor. Intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-2 pb-28 text-slate-800">
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 shadow-lg shadow-orange-950/5">
        
        {/* Header con botón de regreso */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          {onBack ? (
            <button 
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft size={18} />
              <span>Atrás</span>
            </button>
          ) : <div />}
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-800 rounded-full border border-orange-200 text-xs font-bold uppercase tracking-wider">
            <Soup size={15} />
            <span>Registro Comedor / Olla</span>
          </div>
        </div>

        {/* Título y Subtítulo */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Registra tu Comedor u Olla 🍲
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Recibe alertas inmediatas de bodegas y minimarkets con alimentos disponibles para recojo a pie.
          </p>
        </div>

        {/* Estado de Éxito */}
        {isSuccess ? (
          <div className="bg-orange-50 border border-orange-300 rounded-2xl p-6 text-center my-4 animate-fade-in">
            <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-600/30">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-bold text-orange-900">¡Registro Exitoso!</h2>
            <p className="text-xs text-orange-700 mt-2 leading-relaxed">
              Comedor verificado. Entrando al radar de alimentos solidarios...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Nombre del Comedor */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Soup size={13} />
                Nombre del Comedor Popular u Olla Común
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (errors.businessName) setErrors(prev => ({ ...prev, businessName: undefined }));
                }}
                placeholder="Ej. Comedor Santa Rosa de Lima / Olla Común Las Guerreras"
                className={`w-full bg-slate-50 border ${
                  errors.businessName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all`}
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {errors.businessName}
                </p>
              )}
            </div>

            {/* Representante y DNI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Users size={13} />
                  Responsable / Presidenta
                </label>
                <input
                  type="text"
                  value={representativeName}
                  onChange={(e) => {
                    setRepresentativeName(e.target.value);
                    if (errors.representativeName) setErrors(prev => ({ ...prev, representativeName: undefined }));
                  }}
                  placeholder="Ej. Rosa Meléndez Quispe"
                  className={`w-full bg-slate-50 border ${
                    errors.representativeName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all`}
                />
                {errors.representativeName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.representativeName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  DNI de la Responsable (8 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={docNumber}
                  onChange={(e) => {
                    setDocNumber(e.target.value.replace(/\D/g, ''));
                    if (errors.docNumber) setErrors(prev => ({ ...prev, docNumber: undefined }));
                  }}
                  placeholder="Ej. 45678912"
                  className={`w-full bg-slate-50 border ${
                    errors.docNumber ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono`}
                />
                {errors.docNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.docNumber}
                  </p>
                )}
              </div>
            </div>

            {/* PIN Secreto de Seguridad */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Lock size={13} />
                PIN Secreto de Acceso (4 dígitos)
              </label>
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  if (errors.pin) setErrors(prev => ({ ...prev, pin: undefined }));
                }}
                placeholder="Elige un PIN de 4 números (ej. 1234)"
                className={`w-full bg-slate-50 border ${
                  errors.pin ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono`}
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Usarás este PIN junto con tu DNI para iniciar sesión de forma segura.
              </span>
              {errors.pin && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.pin}
                </p>
              )}
            </div>

            {/* Teléfono y Raciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Phone size={13} />
                  Celular / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="991 234 567"
                  className={`w-full bg-slate-50 border ${
                    errors.phone ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <HeartHandshake size={13} />
                  Raciones Servidas al Día
                </label>
                <select
                  value={racionesDiarias}
                  onChange={(e) => setRacionesDiarias(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition-all font-medium"
                >
                  <option value="40">Hasta 40 raciones</option>
                  <option value="80">40 a 80 raciones (Promedio)</option>
                  <option value="150">80 a 150 raciones</option>
                  <option value="250">Más de 150 raciones</option>
                </select>
              </div>
            </div>

            {/* Dirección del Local */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin size={13} />
                Dirección del Comedor u Olla Común
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                }}
                placeholder="Jr. Los Claveles 380, San Juan de Lurigancho"
                className={`w-full bg-slate-50 border ${
                  errors.address ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.address}
                </p>
              )}
            </div>

            {/* SECCIÓN GOOGLE MAPS CON BUSCADOR Y PRESETS */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass size={15} className="text-orange-600" />
                  Ubicación del Comedor en Google Maps
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={11} className="animate-spin text-orange-800" />
                      <span>Detectando...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={11} />
                      <span>Mi GPS</span>
                    </>
                  )}
                </button>
              </div>

              {/* BUSCADOR DE LUGARES */}
              <div className="relative">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddressOnMap(); } }}
                      placeholder="Busca calle, mercado, distrito o ciudad en Perú..."
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchAddressOnMap}
                    disabled={isSearchingLocation}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-75 shrink-0"
                  >
                    {isSearchingLocation ? <Loader2 size={13} className="animate-spin" /> : <span>Buscar</span>}
                  </button>
                </div>

                {/* Resultados sugeridos del buscador */}
                {searchResults.length > 0 && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setSearchResults([])}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-bold sticky top-0">
                        <span>Sugerencias en Perú</span>
                        <button
                          type="button"
                          onClick={() => setSearchResults([])}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSearchResult(item)}
                          className="p-2.5 hover:bg-orange-50 cursor-pointer text-left transition-colors"
                        >
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <MapPin size={11} className="text-orange-600 shrink-0" />
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.address}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Ciudades y Regiones Rápidas */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Ciudades y regiones en Perú:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
                  {POPULAR_PERU_REGIONS.map((region, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(region)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-orange-500 text-slate-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                    >
                      📍 {region.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapa Embebido de Google Maps */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-200 shadow-inner">
                <iframe
                  title="Ubicación Google Maps Comedor"
                  src={mapSearchText ? `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchText)}&z=16&output=embed` : `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=17&output=embed`}
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute bottom-1.5 right-1.5 bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-orange-400 font-bold shadow-md flex items-center gap-1">
                  <Crosshair size={11} />
                  <span>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</span>
                </div>
              </div>

              {/* Controles de Micro-ajuste del Pin */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl text-[11px]">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <Crosshair size={12} className="text-orange-600" />
                  Ajustar puerta exacta:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudgePin(0.0003, 0)}
                    title="Mover al Norte"
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition-colors cursor-pointer"
                  >
                    ↑ N
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgePin(-0.0003, 0)}
                    title="Mover al Sur"
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition-colors cursor-pointer"
                  >
                    ↓ S
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgePin(0, -0.0003)}
                    title="Mover al Oeste"
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition-colors cursor-pointer"
                  >
                    ← O
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgePin(0, 0.0003)}
                    title="Mover al Este"
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition-colors cursor-pointer"
                  >
                    → E
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Tu punto servirá para calcular el tiempo a pie a las bodegas.</span>
                <a
                  href={mapSearchText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchText)}` : `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 hover:text-orange-800 font-bold flex items-center gap-0.5 underline"
                >
                  Ver en Maps <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Garantía de Seguridad */}
            <div className="p-3 bg-orange-50/60 border border-orange-200/70 rounded-xl flex items-center gap-2.5 text-[11px] text-orange-900 leading-tight">
              <ShieldCheck size={18} className="text-orange-600 shrink-0" />
              <span>
                Los comedores registrados reciben prioridad en el radar de donaciones y PIN de seguridad para retiros.
              </span>
            </div>

            {/* BOTÓN PRIMARIO */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Registrando comedor y activando radar...</span>
                </>
              ) : (
                <span>Completar Registro de Comedor</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterComedor;

