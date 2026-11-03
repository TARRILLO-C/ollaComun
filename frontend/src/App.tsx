import React from 'react';
import { EcoFoodProvider, useEcoFood } from './context/EcoFoodContext';
import { MobileShell } from './components/layout/MobileShell';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { BodegaDashboard } from './pages/BodegaDashboard';
import { ComedorDashboard } from './pages/ComedorDashboard';
import { RegisterBodega } from './pages/RegisterBodega';
import { RegisterComedor } from './pages/RegisterComedor';

const AppRouter: React.FC = () => {
  const { currentScreen, activeRole, setCurrentScreen, registerUser } = useEcoFood();

  const renderActiveScreen = () => {
    if (currentScreen === 'register_bodega') {
      return (
        <RegisterBodega 
          onBack={() => setCurrentScreen('welcome')}
          onRegistrationSuccess={(userData: any) => {
            registerUser({
              role: 'BODEGA',
              businessName: userData.businessName,
              docType: userData.docType,
              docNumber: userData.docNumber,
              pin: userData.pin,
              phone: userData.phone,
              addressLine: userData.address,
              facadePhotoUrl: userData.facadePreview,
              location: userData.location,
            });
          }}
        />
      );
    }

    if (currentScreen === 'register_comedor') {
      return (
        <RegisterComedor 
          onBack={() => setCurrentScreen('welcome')}
          onRegistrationSuccess={(userData: any) => {
            registerUser({
              role: 'COMEDOR',
              businessName: userData.businessName,
              representativeName: userData.representativeName,
              docType: userData.docType,
              docNumber: userData.docNumber,
              pin: userData.pin,
              phone: userData.phone,
              addressLine: userData.address,
              location: userData.location,
            });
          }}
        />
      );
    }

    if (currentScreen === 'welcome' || !activeRole) {
      return <WelcomeScreen />;
    }

    if (activeRole === 'BODEGA') {
      return <BodegaDashboard />;
    }

    if (activeRole === 'COMEDOR') {
      return <ComedorDashboard />;
    }

    return <WelcomeScreen />;
  };

  return (
    <MobileShell>
      {renderActiveScreen()}
    </MobileShell>
  );
};

export const App: React.FC = () => {
  return (
    <EcoFoodProvider>
      <AppRouter />
    </EcoFoodProvider>
  );
};

export default App;
