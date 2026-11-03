import React, { useState, useRef } from 'react';
import { 
  Store, 
  Soup, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Phone, 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  Crosshair, 
  Loader2, 
  Save, 
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Lock
} from 'lucide-react';
import { useEcoFood } from '../context/EcoFoodContext';
import { User } from '../types';

interface EditProfileModalProps {
  onClose: () => void;
  targetUser?: User | null;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, targetUser }) => {
  const { currentUser, updateUser } = useEcoFood();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUser = targetUser || currentUser;
  const isBodega = activeUser?.role === 'BODEGA';

  // Form states pre-filled with activeUser
  const [docType, setDocType] = useState<string>(activeUser?.docType || (isBodega ? 'RUC' : 'DNI'));
  const [docNumber, setDocNumber] = useState<string>(activeUser?.docNumber || '');
  const [pin, setPin] = useState<string>(activeUser?.pin || '1234');
  const [businessName, setBusinessName] = useState<string>(activeUser?.businessName || '');
  const [representativeName, setRepresentativeName] = useState<string>(activeUser?.representativeName || '');
  const [phone, setPhone] = useState<string>(activeUser?.phone || '');
  const [addressLine, setAddressLine] = useState<string>(activeUser?.addressLine || '');
  const [facadePreview, setFacadePreview] = useState<string | null>(activeUser?.facadePhotoUrl || null);

  // Map & location states
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(
    activeUser?.location || { latitude: -12.0154, longitude: -76.9982 }
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [mapSearchText, setMapSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

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

  const handleSearchAddressOnMap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = locationQuery.trim();
    if (!query) return;

    setIsSearchingLocation(true);
    setSearchResults([]);

    try {
      const localMatches = POPULAR_PERU_REGIONS.filter(z => 
        z.name.toLowerCase().includes(query.toLowerCase()) ||
        z.address.toLowerCase().includes(query.toLowerCase())
      );

      const searchQuery = query.toLowerCase().includes('peru') || query.toLowerCase().includes('perú') 
        ? query 
        : `${query}, Perú`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pe&limit=6`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await response.json();

      let apiMatches: any[] = [];
      if (Array.isArray(data) && data.length > 0) {
        apiMatches = data.map(item => ({
          name: item.display_name.split(',').slice(0, 2).join(','),
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
      }

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

  const handleSelectSearchResult = (item: any) => {
    if (item.isDirectQuery) {
      setMapSearchText(`${item.name}, Perú`);
      if (!addressLine.trim()) {
        setAddressLine(item.name);
      }
    } else {
      setCoords({ latitude: item.lat, longitude: item.lng });
      setMapSearchText('');
      if (!addressLine.trim()) {
        setAddressLine(item.address || item.name);
      }
    }
    setSearchResults([]);
    setLocationQuery(item.name);
  };

  const handleNudgePin = (deltaLat: number, deltaLng: number) => {
    setMapSearchText('');
    setCoords(prev => ({
      latitude: parseFloat((prev.latitude + deltaLat).toFixed(5)),
      longitude: parseFloat((prev.longitude + deltaLng).toFixed(5))
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este dispositivo.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setMapSearchText('');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Error GPS:', error);
        alert('No se pudo obtener el GPS actual. Puedes buscar la dirección o mover el mapa.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, facade: 'El archivo debe ser una imagen válida' }));
        return;
      }
      setFacadePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!docNumber.trim()) {
      errs.docNumber = 'El número de documento es requerido';
    } else if (docType === 'DNI' && !/^\d{8}$/.test(docNumber)) {
      errs.docNumber = 'El DNI debe tener 8 dígitos';
    } else if (docType === 'RUC' && !/^(10|20)\d{9}$/.test(docNumber)) {
      errs.docNumber = 'El RUC debe tener 11 dígitos y empezar con 10 o 20';
    }

    if (!businessName.trim()) {
      errs.businessName = isBodega 
        ? 'El nombre de la bodega es obligatorio' 
        : 'El nombre del comedor es obligatorio';
    }

    if (!isBodega && !representativeName.trim()) {
      errs.representativeName = 'El nombre de la responsable es obligatorio';
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const isValidPeruPhone = /^(?:(?:\+?51)|0)?9\d{8}$/.test(cleanPhone);
    if (!phone.trim() || !isValidPeruPhone) {
      errs.phone = 'Ingresa un celular peruano válido (9 dígitos comenzando con 9)';
    }

    if (!addressLine.trim()) {
      errs.addressLine = 'La dirección es obligatoria';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !activeUser) return;

    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));

      updateUser(activeUser.id, {
        docType: docType as any,
        docNumber: docNumber.trim(),
        pin: pin.trim() || '1234',
        businessName: businessName.trim(),
        representativeName: representativeName.trim() || activeUser.representativeName,
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        location: coords,
        facadePhotoUrl: facadePreview || activeUser.facadePhotoUrl
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col overflow-hidden animate-fade-in">
      {/* Header Fijo */}
      <div className={`px-4 py-3.5 border-b border-slate-200 flex items-center justify-between ${
        isBodega ? 'bg-emerald-800 text-white' : 'bg-orange-600 text-white'
      } shrink-0 shadow-sm`}>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 block">
            {isBodega ? '🏪 Bodega Solidaria' : '🍲 Comedor Popular'}
          </span>
          <h2 className="text-sm font-extrabold">Editar Información de la Cuenta</h2>
        </div>

        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Contenido con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {isSuccess ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 mt-10">
            <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-3 animate-bounce" />
            <h3 className="text-base font-black text-emerald-900">¡Información Actualizada!</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Los cambios en tu perfil y ubicación han sido guardados con éxito.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Indicador de cuenta activa */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isBodega ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {isBodega ? <Store size={20} /> : <Soup size={20} />}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ID de Cuenta</span>
                <span className="text-xs font-mono font-bold text-slate-800">{activeUser?.id}</span>
              </div>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck size={11} /> Verificada
              </span>
            </div>

            {/* Documento de Identidad */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Documento de Identidad
              </label>

              {isBodega && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setDocType('RUC'); }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      docType === 'RUC'
                        ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    RUC (Empresas)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDocType('DNI'); }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      docType === 'DNI'
                        ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    DNI (Persona Natural)
                  </button>
                </div>
              )}

              <div className="relative">
                <input
                  type="text"
                  maxLength={docType === 'RUC' ? 11 : 8}
                  value={docNumber}
                  onChange={(e) => {
                    setDocNumber(e.target.value.replace(/\D/g, ''));
                    if (errors.docNumber) setErrors(prev => ({ ...prev, docNumber: '' }));
                  }}
                  className={`w-full bg-slate-50 border ${
                    errors.docNumber ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-emerald-600'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono`}
                  placeholder={docType === 'RUC' ? '20601234567' : '45678912'}
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  {docNumber.length}/{docType === 'RUC' ? 11 : 8}
                </span>
              </div>
              {errors.docNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.docNumber}
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
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-300 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono"
                placeholder="1234"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                PIN de 4 dígitos para iniciar sesión de forma segura.
              </span>
            </div>

            {/* Nombre del Negocio / Comedor */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                {isBodega ? <Store size={13} /> : <Soup size={13} />}
                {isBodega ? 'Nombre de la Bodega o Minimarket' : 'Nombre del Comedor Popular u Olla Común'}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (errors.businessName) setErrors(prev => ({ ...prev, businessName: '' }));
                }}
                className={`w-full bg-slate-50 border ${
                  errors.businessName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-emerald-600'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900`}
                placeholder={isBodega ? 'Ej. Bodega Don Pepe' : 'Ej. Comedor Santa Rosa'}
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.businessName}
                </p>
              )}
            </div>

            {/* Nombre de la responsable si es Comedor */}
            {!isBodega && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <UserCheck size={13} />
                  Nombre de la Presidenta o Responsable
                </label>
                <input
                  type="text"
                  value={representativeName}
                  onChange={(e) => {
                    setRepresentativeName(e.target.value);
                    if (errors.representativeName) setErrors(prev => ({ ...prev, representativeName: '' }));
                  }}
                  className={`w-full bg-slate-50 border ${
                    errors.representativeName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-orange-500'
                  } rounded-xl px-3.5 py-2.5 text-sm text-slate-900`}
                  placeholder="Ej. Rosa Meléndez"
                />
                {errors.representativeName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.representativeName}
                  </p>
                )}
              </div>
            )}

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Phone size={13} />
                Teléfono / WhatsApp de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                className={`w-full bg-slate-50 border ${
                  errors.phone ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-emerald-600'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono`}
                placeholder="987 654 321"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Dirección de Recojo o Local */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin size={13} />
                {isBodega ? 'Dirección de Recojo' : 'Dirección del Local'}
              </label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => {
                  setAddressLine(e.target.value);
                  if (errors.addressLine) setErrors(prev => ({ ...prev, addressLine: '' }));
                }}
                className={`w-full bg-slate-50 border ${
                  errors.addressLine ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:ring-1 focus:ring-emerald-600'
                } rounded-xl px-3.5 py-2.5 text-sm text-slate-900`}
                placeholder="Av. Los Próceres 1420"
              />
              {errors.addressLine && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.addressLine}
                </p>
              )}
            </div>

            {/* UBICACIÓN GOOGLE MAPS INTERACTIVA NACIONAL */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass size={15} className={isBodega ? 'text-emerald-700' : 'text-orange-600'} />
                  Ubicación en Google Maps
                </span>
                
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className={`px-2.5 py-1 ${
                    isBodega 
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' 
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                  } text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer`}
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
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

              {/* Buscador Nacional de Calles y Ciudades */}
              <div className="relative">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddressOnMap(); } }}
                      placeholder="Busca calle, mercado o ciudad en Perú..."
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                    />
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchAddressOnMap}
                    disabled={isSearchingLocation}
                    className={`px-3 py-2 ${
                      isBodega ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-orange-600 hover:bg-orange-700'
                    } text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-75 shrink-0`}
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
                          className={`p-2.5 ${isBodega ? 'hover:bg-emerald-50' : 'hover:bg-orange-50'} cursor-pointer text-left transition-colors`}
                        >
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <MapPin size={11} className={isBodega ? 'text-emerald-700' : 'text-orange-600'} />
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.address}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Botones rápidos de regiones de Perú */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Regiones y ciudades de Perú:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
                  {POPULAR_PERU_REGIONS.map((region, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(region)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                    >
                      📍 {region.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapa Embebido de Google Maps */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-200 shadow-inner">
                <iframe
                  title="Ubicación Google Maps Perfil"
                  src={mapSearchText ? `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchText)}&z=16&output=embed` : `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=17&output=embed`}
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
                <div className="absolute bottom-1.5 right-1.5 bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400 font-bold shadow-md flex items-center gap-1">
                  <Crosshair size={11} />
                  <span>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</span>
                </div>
              </div>

              {/* Controles de Micro-ajuste del Pin */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl text-[11px]">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <Crosshair size={12} className={isBodega ? 'text-emerald-700' : 'text-orange-600'} />
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
                <span>Punto de referencia para rutas a pie.</span>
                <a
                  href={mapSearchText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchText)}` : `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`font-bold flex items-center gap-0.5 underline ${isBodega ? 'text-emerald-700' : 'text-orange-600'}`}
                >
                  Abrir en Google Maps <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Foto de la Fachada (si es Bodega) */}
            {isBodega && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Camera size={13} />
                  Foto de la Fachada del Negocio
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-3 text-center cursor-pointer bg-slate-50 transition-colors"
                >
                  {facadePreview ? (
                    <div className="relative rounded-xl overflow-hidden h-36">
                      <img 
                        src={facadePreview} 
                        alt="Fachada" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <Camera size={16} /> Cambiar Foto
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center text-slate-500">
                      <Camera size={28} className="mb-2 text-slate-400" />
                      <span className="text-xs font-bold">Subir o tomar foto de fachada</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-2 py-3 ${
                  isBodega ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-orange-600 hover:bg-orange-700'
                } text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-75`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
