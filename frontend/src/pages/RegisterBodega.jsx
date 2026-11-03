import React, { useState, useRef } from 'react';
import { 
  Store, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  FileCheck,
  Info,
  Phone,
  MapPin,
  FileText,
  Navigation,
  Compass,
  ExternalLink,
  Search,
  Crosshair,
  ArrowUp,
  ArrowDown,
  Lock,
  X
} from 'lucide-react';

export const RegisterBodega = ({ onBack, onRegistrationSuccess }) => {
  const fileInputRef = useRef(null);

  // Form states
  const [docType, setDocType] = useState('RUC'); // 'DNI' | 'RUC'
  const [docNumber, setDocNumber] = useState('');
  const [pin, setPin] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [facadeFile, setFacadeFile] = useState(null);
  const [facadePreview, setFacadePreview] = useState(null);

  // Ubicación Google Maps / GPS
  const [coords, setCoords] = useState({ latitude: -12.0154, longitude: -76.9982 });
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
      // En caso de error de red, permitir usar el término en Google Maps
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

  // Validaciones peruanas: DNI (8 dígitos), RUC (11 dígitos que inician con 10 o 20)
  const validateForm = () => {
    const newErrors = {};

    if (!docNumber.trim()) {
      newErrors.docNumber = 'El número de documento es obligatorio';
    } else if (docType === 'DNI' && !/^\d{8}$/.test(docNumber)) {
      newErrors.docNumber = 'El DNI debe tener exactamente 8 dígitos numéricos';
    } else if (docType === 'RUC' && !/^(10|20)\d{9}$/.test(docNumber)) {
      newErrors.docNumber = 'El RUC debe tener 11 dígitos y comenzar con 10 o 20';
    }

    if (!pin.trim() || pin.length < 4) {
      newErrors.pin = 'Crea un PIN numérico de al menos 4 dígitos para tu acceso';
    }

    if (!businessName.trim()) {
      newErrors.businessName = 'El nombre de la bodega o minimarket es obligatorio';
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const isValidPeruPhone = /^(?:(?:\+?51)|0)?9\d{8}$/.test(cleanPhone);
    if (!phone.trim() || !isValidPeruPhone) {
      newErrors.phone = 'Ingresa un celular peruano válido (9 dígitos comenzando con 9)';
    }

    if (!address.trim()) {
      newErrors.address = 'La dirección de recojo es obligatoria';
    }

    if (!facadeFile) {
      newErrors.facadeFile = 'Es obligatorio subir o tomar una foto de la fachada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, facadeFile: 'El archivo debe ser una imagen válida' }));
        return;
      }
      setFacadeFile(file);
      setFacadePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, facadeFile: undefined }));
    }
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
        // Fallback geográfico
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
      // Simulación de llamada al endpoint Spring Boot: POST /api/auth/register-bodega
      await new Promise(resolve => setTimeout(resolve, 1400));

      setIsSuccess(true);
      if (onRegistrationSuccess) {
        setTimeout(() => {
          onRegistrationSuccess({
            docType,
            docNumber,
            pin: pin.trim() || '1234',
            businessName,
            phone,
            address,
            facadePreview,
            location: coords
          });
        }, 1200);
      }
    } catch (err) {
      setErrors({ form: 'Ocurrió un error al procesar el registro. Intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-2 pb-28 text-slate-800">
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 shadow-lg shadow-emerald-950/5">
        
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
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Store size={15} />
            <span>Registro Donante</span>
          </div>
        </div>

        {/* Título y Subtítulo */}
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Registra tu Bodega 🏪
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Conecta tu negocio a la red de rescate de alimentos y recibe el sello de Bodega Solidaria.
          </p>
        </div>

        {/* Estado de Éxito */}
        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center my-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/30">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-bold text-emerald-900">¡Registro Exitoso!</h2>
            <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
              Tu bodega ha sido verificada. Entrando al panel de donaciones...
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

            {/* Selector DNI o RUC */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tipo y Documento de Identidad
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => { setDocType('RUC'); setDocNumber(''); }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    docType === 'RUC'
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  RUC (Empresas / Pyme)
                </button>
                <button
                  type="button"
                  onClick={() => { setDocType('DNI'); setDocNumber(''); }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    docType === 'DNI'
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  DNI (Persona Natural)
                </button>
              </div>

              {/* Input Documento */}
              <div className="relative">
                <input
                  type="text"
                  maxLength={docType === 'RUC' ? 11 : 8}
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={docType === 'RUC' ? 'Ej. 20601234567 (11 dígitos)' : 'Ej. 45678912 (8 dígitos)'}
                  className={`w-full bg-slate-50 border ${
                    errors.docNumber ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400' : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono`}
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  {docNumber.length}/{docType === 'RUC' ? 11 : 8}
                </span>
              </div>
              {errors.docNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {errors.docNumber}
                </p>
              )}
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
                  errors.pin ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono`}
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Usarás este PIN junto con tu DNI/RUC para iniciar sesión de forma segura.
              </span>
              {errors.pin && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.pin}
                </p>
              )}
            </div>

            {/* Nombre de la Bodega */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Store size={13} />
                Nombre de la Bodega o Minimarket
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Bodega Don Pepe & Hijos"
                className={`w-full bg-slate-50 border ${
                  errors.businessName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all`}
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {errors.businessName}
                </p>
              )}
            </div>

            {/* Teléfono y Dirección */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Phone size={13} />
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="987 654 321"
                  className={`w-full bg-slate-50 border ${
                    errors.phone ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
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
                  <MapPin size={13} />
                  Dirección de Recojo
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Los Próceres 1420, San Juan de Lurigancho"
                  className={`w-full bg-slate-50 border ${
                    errors.address ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.address}
                  </p>
                )}
              </div>

              {/* UBICACIÓN CON BUSCADOR INTERACTIVO Y GOOGLE MAPS */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass size={15} className="text-emerald-700" />
                    Punto de tu Bodega en Google Maps
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 size={11} className="animate-spin text-emerald-800" />
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

                {/* BUSCADOR DE LUGARES / CALLES EN TODO EL PERÚ */}
                <div className="relative">
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddressOnMap(); } }}
                        placeholder="Busca calle, mercado, distrito o ciudad en Perú..."
                        className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
                      />
                      <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchAddressOnMap}
                      disabled={isSearchingLocation}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-75 shrink-0"
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
                            className="p-2.5 hover:bg-emerald-50 cursor-pointer text-left transition-colors"
                          >
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <MapPin size={11} className="text-emerald-700 shrink-0" />
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
                        className="px-2 py-1 bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                      >
                        📍 {region.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mapa Embebido de Google Maps */}
                <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-200 shadow-inner">
                  <iframe
                    title="Ubicación Google Maps Bodega"
                    src={mapSearchText ? `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchText)}&z=16&output=embed` : `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=17&output=embed`}
                    className="w-full h-full border-0 pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400 font-bold shadow-md flex items-center gap-1">
                    <Crosshair size={11} />
                    <span>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</span>
                  </div>
                </div>

                {/* Controles de Micro-ajuste del Pin (Norte, Sur, Este, Oeste) */}
                <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl text-[11px]">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Crosshair size={12} className="text-emerald-700" />
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
                  <span>Los comedores usarán este punto para navegar a pie.</span>
                  <a
                    href={mapSearchText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchText)}` : `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 underline"
                  >
                    Abrir en Google Maps <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* SECCIÓN FOTO DE FACHADA */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Camera size={13} />
                Foto de la Fachada del Negocio
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {facadePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-slate-50 p-2 group">
                  <img
                    src={facadePreview}
                    alt="Vista previa de fachada"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium truncate max-w-[200px]">
                      <FileCheck size={14} className="text-emerald-600 shrink-0" /> {facadeFile?.name || 'Foto capturada'}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline"
                    >
                      Cambiar foto
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed ${
                    errors.facadeFile ? 'border-red-400 bg-red-50/50' : 'border-slate-300 hover:border-emerald-600 bg-slate-50/80 hover:bg-emerald-50/30'
                  } rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all`}
                >
                  <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-slate-200 text-emerald-700 flex items-center justify-center">
                    <Camera size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">
                      Toca aquí para tomar foto o elegir archivo
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG o WEBP (máx. 10MB)
                    </p>
                  </div>
                </button>
              )}

              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500 leading-snug">
                <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Solo usaremos la cámara para verificar la fachada de tu negocio por seguridad.
                </span>
              </div>

              {errors.facadeFile && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {errors.facadeFile}
                </p>
              )}
            </div>

            {/* Garantía de Seguridad */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-900 leading-tight">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
              <span>
                Tus datos comerciales están protegidos bajo protocolos de privacidad y validación comunitaria antifraude.
              </span>
            </div>

            {/* BOTÓN PRIMARIO */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Validando y registrando bodega...</span>
                </>
              ) : (
                <span>Completar Registro de Bodega</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterBodega;
