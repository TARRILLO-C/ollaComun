import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Donation, 
  Delivery, 
  UserRole, 
  PushNotificationAlert, 
  Coordinates,
  DonationCategory
} from '../types';

// Función Haversine para calcular distancia en metros (emula ST_Distance de PostGIS)
export function calculateDistanceInMeters(coord1: Coordinates, coord2: Coordinates): number {
  if (!coord1 || !coord2) return 500;
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Convierte distancia en metros a texto amigable de tiempo caminando
export const calcularTiempoCaminando = (distanciaMetros?: number): string => {
  if (distanciaMetros === undefined || distanciaMetros === null || distanciaMetros <= 0) {
    return 'A unos pasos (10 m)';
  }
  const metros = Math.round(distanciaMetros);
  const minutos = Math.ceil(metros / 80); // ~80m por minuto caminando

  const formatoDistancia = metros >= 1000 
    ? `${(metros / 1000).toFixed(1)} km` 
    : `${metros} m`;

  if (minutos <= 1) {
    return `Aprox. 1 min caminando (${formatoDistancia})`;
  } else if (minutos < 60) {
    return `Aprox. ${minutos} min caminando (${formatoDistancia})`;
  } else {
    const horas = Math.floor(minutos / 60);
    const minsRestantes = minutos % 60;
    return `Aprox. ${horas}h ${minsRestantes > 0 ? minsRestantes + 'min' : ''} caminando (${formatoDistancia})`;
  }
};

// Usuarios semilla iniciales
export const INITIAL_BODEGA: User = {
  id: 'usr-bodega-01',
  role: 'BODEGA',
  docType: 'RUC',
  docNumber: '20601234567',
  pin: '1234',
  businessName: 'Bodega & Minimarket Don Pepe',
  representativeName: 'José Pérez Quispe',
  phone: '+51 987 654 321',
  email: 'donpepe@minimarket.pe',
  addressLine: 'Av. Próceres de la Independencia 1420',
  district: 'San Juan de Lurigancho',
  facadePhotoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
  isVerified: true,
  location: { latitude: -12.0154, longitude: -76.9982 },
};

export const INITIAL_COMEDOR: User = {
  id: 'usr-comedor-01',
  role: 'COMEDOR',
  docType: 'DNI',
  docNumber: '45678912',
  pin: '1234',
  businessName: 'Comedor Popular Santa Rosa de Lima',
  representativeName: 'Rosa Meléndez',
  phone: '+51 991 234 567',
  email: 'comedorsantarosa@gmail.com',
  addressLine: 'Jr. Los Claveles 380, Urb. Canto Grande',
  district: 'San Juan de Lurigancho',
  facadePhotoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
  isVerified: true,
  location: { latitude: -12.0210, longitude: -77.0015 },
};

const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-001',
    donorId: 'usr-bodega-01',
    donorBusinessName: 'Bodega & Minimarket Don Pepe',
    donorPhone: '+51 987 654 321',
    donorAddress: 'Av. Próceres de la Independencia 1420',
    title: '40 panes ciabatta y franceses surtidos',
    category: 'PANADERIA',
    description: 'Pan horneado esta mañana en perfecto estado, embolsado y limpio para consumo hoy.',
    quantityValue: 8.5,
    unitMeasure: 'kg aprox. (~17 raciones)',
    pickupStartAt: new Date(Date.now() - 1800000).toISOString(),
    pickupEndAt: new Date(Date.now() + 10800000).toISOString(),
    status: 'AVAILABLE',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    location: { latitude: -12.0154, longitude: -76.9982 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don-002',
    donorId: 'usr-bodega-02',
    donorBusinessName: 'Minimarket Los Andes',
    donorPhone: '+51 945 112 334',
    donorAddress: 'Av. Gran Chimú 650',
    title: 'Jaba surtida de verduras (Tomates, zanahorias y lechugas)',
    category: 'FRUTAS_VERDURAS',
    description: 'Verduras seleccionadas del día, aptas para preparar el menú solidario.',
    quantityValue: 12.0,
    unitMeasure: 'kg (~24 raciones)',
    pickupStartAt: new Date().toISOString(),
    pickupEndAt: new Date(Date.now() + 14400000).toISOString(),
    status: 'AVAILABLE',
    photoUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
    location: { latitude: -12.0195, longitude: -76.9940 },
    createdAt: new Date().toISOString(),
  }
];

export interface EcoFoodMetrics {
  kilosRescatadosTotal: number;
  racionesEquivalentes: number;
  co2EvitadoKg: number;
  entregasExitosas: number;
}

interface EcoFoodContextType {
  currentUser: User | null;
  activeRole: UserRole | null;
  users: User[];
  donations: Donation[];
  deliveries: Delivery[];
  notifications: PushNotificationAlert[];
  currentScreen: string;
  activeToast: string | null;
  metrics: EcoFoodMetrics;
  setRole: (role: UserRole) => void;
  setCurrentScreen: (screen: string) => void;
  selectUser: (userId: string) => void;
  loginWithDocNumber: (docNumber: string) => { success: boolean; message: string; user?: User };
  loginWithCredentials: (docNumber: string, pin: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  createDonation: (data: Partial<Donation>) => void;
  reserveDonation: (donationId: string) => Delivery;
  cancelReservation: (deliveryId: string) => void;
  validateDelivery: (pinOrToken: string) => { success: boolean; message: string; delivery?: Delivery };
  registerUser: (userData: Partial<User>) => void;
  updateUser: (userId: string, updatedData: Partial<User>) => void;
  switchDemoRole: (role: UserRole) => void;
  resetDemoData: () => void;
  clearToast: () => void;
  markNotificationRead: (id: string) => void;
}

const EcoFoodContext = createContext<EcoFoodContextType | undefined>(undefined);

export const EcoFoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lista de usuarios registrados (persiste en localStorage)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ecofood_all_users');
    return saved ? JSON.parse(saved) : [INITIAL_BODEGA, INITIAL_COMEDOR];
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('ecofood_role') as UserRole) || null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('ecofood_active_user_id');
    const savedUsers = localStorage.getItem('ecofood_all_users');
    const userList: User[] = savedUsers ? JSON.parse(savedUsers) : [INITIAL_BODEGA, INITIAL_COMEDOR];
    if (savedUserId) {
      const found = userList.find(u => u.id === savedUserId);
      if (found) return found;
    }
    const savedRole = localStorage.getItem('ecofood_role');
    if (savedRole === 'BODEGA') return userList.find(u => u.role === 'BODEGA') || INITIAL_BODEGA;
    if (savedRole === 'COMEDOR') return userList.find(u => u.role === 'COMEDOR') || INITIAL_COMEDOR;
    return null;
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('ecofood_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('ecofood_deliveries');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<PushNotificationAlert[]>([
    {
      id: 'notif-1',
      title: '¡Alerta de Alimentos Cercana!',
      body: 'Bodega Don Pepe acaba de publicar 8.5 kg de pan a 700m de ti.',
      timestamp: 'Hace 5 min',
      donationId: 'don-001',
      read: false,
    }
  ]);

  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    const savedRole = localStorage.getItem('ecofood_role');
    if (savedRole === 'BODEGA') return 'bodega_dashboard';
    if (savedRole === 'COMEDOR') return 'comedor_dashboard';
    return 'welcome';
  });

  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Sincronizar en localStorage
  useEffect(() => {
    localStorage.setItem('ecofood_all_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ecofood_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('ecofood_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3500);
  };

  const setRole = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem('ecofood_role', role);
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('ecofood_active_user_id', user.id);
    }
    if (role === 'BODEGA') {
      setCurrentScreen('bodega_dashboard');
    } else {
      setCurrentScreen('comedor_dashboard');
    }
  };

  const selectUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    setActiveRole(targetUser.role);
    setCurrentUser(targetUser);
    localStorage.setItem('ecofood_role', targetUser.role);
    localStorage.setItem('ecofood_active_user_id', targetUser.id);
    if (targetUser.role === 'BODEGA') {
      setCurrentScreen('bodega_dashboard');
    } else {
      setCurrentScreen('comedor_dashboard');
    }
    showToast(`Sesión iniciada como: ${targetUser.businessName}`);
  };

  const loginWithDocNumber = (docNumber: string): { success: boolean; message: string; user?: User } => {
    const cleanDoc = docNumber.trim().replace(/\D/g, '');
    if (!cleanDoc) {
      return { success: false, message: 'Por favor ingresa tu número de DNI o RUC.' };
    }

    const foundUser = users.find(u => u.docNumber?.replace(/\D/g, '') === cleanDoc);

    if (foundUser) {
      setActiveRole(foundUser.role);
      setCurrentUser(foundUser);
      localStorage.setItem('ecofood_role', foundUser.role);
      localStorage.setItem('ecofood_active_user_id', foundUser.id);
      if (foundUser.role === 'BODEGA') {
        setCurrentScreen('bodega_dashboard');
      } else {
        setCurrentScreen('comedor_dashboard');
      }
      showToast(`¡Bienvenido de nuevo, ${foundUser.businessName}!`);
      return { success: true, user: foundUser, message: 'Inicio de sesión exitoso.' };
    }

    return {
      success: false,
      message: `No se encontró una cuenta con el documento "${cleanDoc}". Verifica el número o regístrate.`
    };
  };

  const loginWithCredentials = (docNumber: string, pin: string): { success: boolean; message: string; user?: User } => {
    const cleanDoc = docNumber.trim().replace(/\D/g, '');
    const cleanPin = pin.trim();

    if (!cleanDoc) {
      return { success: false, message: 'Ingresa tu número de DNI o RUC.' };
    }

    if (!cleanPin) {
      return { success: false, message: 'Ingresa tu PIN de seguridad (4 dígitos).' };
    }

    const foundUser = users.find(u => u.docNumber?.replace(/\D/g, '') === cleanDoc);

    if (!foundUser) {
      return {
        success: false,
        message: `No encontramos una cuenta registrada con el documento "${cleanDoc}". ¿Deseas registrar tu bodega o comedor?`
      };
    }

    const userPin = foundUser.pin || '1234';
    if (cleanPin !== userPin) {
      return {
        success: false,
        message: 'El PIN de seguridad es incorrecto. Vuelve a intentarlo.'
      };
    }

    setActiveRole(foundUser.role);
    setCurrentUser(foundUser);
    localStorage.setItem('ecofood_role', foundUser.role);
    localStorage.setItem('ecofood_active_user_id', foundUser.id);
    if (foundUser.role === 'BODEGA') {
      setCurrentScreen('bodega_dashboard');
    } else {
      setCurrentScreen('comedor_dashboard');
    }
    showToast(`¡Bienvenido de nuevo, ${foundUser.businessName}!`);
    return { success: true, user: foundUser, message: 'Inicio de sesión exitoso.' };
  };

  const logout = () => {
    setActiveRole(null);
    setCurrentUser(null);
    localStorage.removeItem('ecofood_role');
    localStorage.removeItem('ecofood_active_user_id');
    setCurrentScreen('welcome');
    showToast('Sesión cerrada correctamente.');
  };

  const switchDemoRole = (role: UserRole) => {
    setRole(role);
    showToast(`Modo cambiado a: ${role === 'BODEGA' ? '🏪 Bodeguero' : '🍲 Comedor Popular'}`);
  };

  const createDonation = (data: Partial<Donation>) => {
    if (!currentUser) return;

    const start = new Date();
    const end = data.pickupEndAt || new Date(start.getTime() + 3 * 3600000).toISOString();
    const qty = data.quantityValue || 5.0;

    const newDonation: Donation = {
      id: `don-${Date.now().toString().slice(-4)}`,
      donorId: currentUser.id,
      donorBusinessName: currentUser.businessName,
      donorPhone: currentUser.phone,
      donorAddress: currentUser.addressLine,
      title: data.title || `${data.category || 'Alimentos'} del día`,
      category: (data.category as DonationCategory) || 'PANADERIA',
      description: data.description || 'Alimentos limpios y en buen estado listos para recojo.',
      quantityValue: qty,
      unitMeasure: data.unitMeasure || `${qty} kg (~${Math.round(qty * 2)} raciones)`,
      pickupStartAt: data.pickupStartAt || start.toISOString(),
      pickupEndAt: end,
      status: 'AVAILABLE',
      photoUrl: data.photoUrl || (
        data.category === 'FRUTAS_VERDURAS' 
          ? 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80'
          : data.category === 'ABARROTES'
          ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
      ),
      location: currentUser.location || { latitude: -12.0154, longitude: -76.9982 },
      createdAt: new Date().toISOString(),
    };

    setDonations(prev => [newDonation, ...prev]);

    // Generar alerta para comedores cercanos
    const newAlert: PushNotificationAlert = {
      id: `notif-${Date.now()}`,
      title: '¡Nueva donación en tu zona!',
      body: `${currentUser.businessName} publicó: ${newDonation.title}`,
      timestamp: 'Ahora mismo',
      donationId: newDonation.id,
      read: false,
    };
    setNotifications(prev => [newAlert, ...prev]);

    showToast('¡Donación publicada con éxito! Notificada a comedores.');
    setCurrentScreen('bodega_dashboard');
  };

  const reserveDonation = (donationId: string): Delivery => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) throw new Error('Donación no encontrada');

    // Generar PIN aleatorio de 6 dígitos
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const qrToken = `ECO-${donationId}-${randomPin}`;

    const newDelivery: Delivery = {
      id: `deliv-${Date.now().toString().slice(-4)}`,
      donationId,
      receiverId: currentUser?.id || INITIAL_COMEDOR.id,
      receiverBusinessName: currentUser?.businessName || INITIAL_COMEDOR.businessName,
      receiverPhone: currentUser?.phone || INITIAL_COMEDOR.phone,
      pickupPin: randomPin,
      qrHashToken: qrToken,
      status: 'PENDING_PICKUP',
      reservedAt: new Date().toISOString(),
    };

    setDonations(prev => 
      prev.map(d => d.id === donationId ? { ...d, status: 'RESERVED' } : d)
    );

    setDeliveries(prev => [newDelivery, ...prev]);
    showToast(`¡Reserva confirmada! Tu PIN de recojo es: ${randomPin}`);
    return newDelivery;
  };

  const cancelReservation = (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    setDonations(prev => 
      prev.map(d => d.id === delivery.donationId ? { ...d, status: 'AVAILABLE' } : d)
    );

    setDeliveries(prev => 
      prev.map(d => d.id === deliveryId ? { ...d, status: 'CANCELLED' } : d)
    );

    showToast('Reserva cancelada. El alimento vuelve a estar disponible para otros comedores.');
  };

  const validateDelivery = (pinOrToken: string): { success: boolean; message: string; delivery?: Delivery } => {
    const cleanInput = pinOrToken.trim();

    const targetDelivery = deliveries.find(deliv => 
      deliv.status === 'PENDING_PICKUP' &&
      (deliv.pickupPin === cleanInput || deliv.qrHashToken === cleanInput)
    );

    if (!targetDelivery) {
      return {
        success: false,
        message: 'PIN o código QR inválido, o la entrega ya fue completada.'
      };
    }

    const updatedDelivery: Delivery = {
      ...targetDelivery,
      status: 'COMPLETED',
      deliveredAt: new Date().toISOString(),
    };

    setDeliveries(prev => 
      prev.map(d => d.id === targetDelivery.id ? updatedDelivery : d)
    );

    setDonations(prev => 
      prev.map(d => d.id === targetDelivery.donationId ? { ...d, status: 'DELIVERED' } : d)
    );

    showToast('¡Entrega validada con éxito! Alimento rescatado.');
    return {
      success: true,
      message: '¡Entrega confirmada! Gracias por evitar el desperdicio de alimentos.',
      delivery: updatedDelivery
    };
  };

  const registerUser = (userData: Partial<User>) => {
    const role = userData.role || 'BODEGA';
    const newUser: User = {
      id: `usr-${role.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      role,
      docType: userData.docType || (role === 'BODEGA' ? 'RUC' : 'DNI'),
      docNumber: userData.docNumber || '20123456789',
      pin: userData.pin || '1234',
      businessName: userData.businessName || (role === 'BODEGA' ? 'Nueva Bodega' : 'Nuevo Comedor'),
      representativeName: userData.representativeName || 'Responsable',
      phone: userData.phone || '+51 900 000 000',
      email: userData.email || 'contacto@ecofood.pe',
      addressLine: userData.addressLine || 'Av. Principal 123',
      district: userData.district || 'San Juan de Lurigancho',
      facadePhotoUrl: userData.facadePhotoUrl || (
        role === 'BODEGA'
          ? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
      ),
      isVerified: true,
      location: userData.location || { latitude: -12.0154, longitude: -76.9982 },
    };

    setUsers(prev => [newUser, ...prev]);
    setActiveRole(role);
    setCurrentUser(newUser);
    localStorage.setItem('ecofood_role', role);
    localStorage.setItem('ecofood_active_user_id', newUser.id);

    showToast(`¡Registro completado! Bienvenido ${newUser.businessName}.`);
    if (role === 'BODEGA') {
      setCurrentScreen('bodega_dashboard');
    } else {
      setCurrentScreen('comedor_dashboard');
    }
  };

  const updateUser = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, ...updatedData };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    }

    // Actualizar donaciones existentes vinculadas a este usuario
    setDonations(prev => prev.map(d => {
      if (d.donorId === userId) {
        return {
          ...d,
          donorBusinessName: updatedData.businessName || d.donorBusinessName,
          donorPhone: updatedData.phone || d.donorPhone,
          donorAddress: updatedData.addressLine || d.donorAddress,
          location: updatedData.location || d.location,
        };
      }
      return d;
    }));

    showToast('¡Información de perfil actualizada con éxito!');
  };

  const resetDemoData = () => {
    localStorage.removeItem('ecofood_donations');
    localStorage.removeItem('ecofood_deliveries');
    localStorage.removeItem('ecofood_all_users');
    localStorage.removeItem('ecofood_role');
    localStorage.removeItem('ecofood_active_user_id');
    setUsers([INITIAL_BODEGA, INITIAL_COMEDOR]);
    setDonations(INITIAL_DONATIONS);
    setDeliveries([]);
    setActiveRole(null);
    setCurrentUser(null);
    setCurrentScreen('welcome');
    showToast('Datos de prueba reiniciados a los valores iniciales.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deliveredList = deliveries.filter(d => d.status === 'COMPLETED');
  const deliveredDonations = donations.filter(d => d.status === 'DELIVERED');
  const totalKg = deliveredDonations.reduce((sum, d) => sum + (d.quantityValue || 0), 20.5);

  const metrics: EcoFoodMetrics = {
    kilosRescatadosTotal: parseFloat(totalKg.toFixed(1)),
    racionesEquivalentes: Math.round(totalKg * 2),
    co2EvitadoKg: parseFloat((totalKg * 2.5).toFixed(1)),
    entregasExitosas: deliveredList.length + 4,
  };

  const enrichedDonations = donations.map(donation => {
    const userLoc = currentUser?.location || INITIAL_COMEDOR.location;
    const distance = calculateDistanceInMeters(userLoc, donation.location);
    return { ...donation, distanceMeters: distance };
  });

  return (
    <EcoFoodContext.Provider
      value={{
        currentUser,
        activeRole,
        users,
        donations: enrichedDonations,
        deliveries,
        notifications,
        currentScreen,
        activeToast,
        metrics,
        setRole,
        setCurrentScreen,
        selectUser,
        loginWithDocNumber,
        loginWithCredentials,
        logout,
        createDonation,
        reserveDonation,
        cancelReservation,
        validateDelivery,
        registerUser,
        updateUser,
        switchDemoRole,
        resetDemoData,
        clearToast: () => setActiveToast(null),
        markNotificationRead,
      }}
    >
      {children}
    </EcoFoodContext.Provider>
  );
};

export const useEcoFood = () => {
  const context = useContext(EcoFoodContext);
  if (!context) {
    throw new Error('useEcoFood debe usarse dentro de un EcoFoodProvider');
  }
  return context;
};
