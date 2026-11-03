# 🥑 EcoFood MVP - Red Solidaria de Rescate de Alimentos

**EcoFood** es una aplicación diseñada como **React Mobile-First PWA** que conecta a bodegas y minimarkets (donantes) con comedores populares u ollas comunes (receptores) para evitar el desperdicio de alimentos aptos para consumo.

---

## 🏛️ 1. Arquitectura del Sistema (Clean Architecture)

El proyecto está organizado en módulos desacoplados:

```
appPERU/
├── database/
│   └── schema.sql                        # PostgreSQL + PostGIS (geography, índices GIST, funciones)
├── backend-spring/                       # Spring Boot (Java 17/21 + Hibernate Spatial)
│   └── src/main/java/com/ecofood/
│       ├── auth/                         # Registro Seguro, DNI/RUC y Foto de Fachada
│       ├── donations/                    # Publicación de donaciones y consultas ST_Distance (<2km)
│       └── deliveries/                   # Cierre transaccional @Transactional y validación PIN/QR
├── backend/                              # Node.js + Express + PostGIS (versión complementaria)
│   ├── src/
│   │   ├── modules/ (donations, users, deliveries)
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
└── frontend/                             # React Mobile-First PWA (Vite + Tailwind Dark Theme)
    ├── public/manifest.json              # PWA Installable Manifest
    ├── src/
    │   ├── store/
    │   │   └── useDonacionStore.js       # Zustand Store: Donado -> Reservado -> Esperando Entrega -> Entregado
    │   ├── pages/
    │   │   ├── WelcomeScreen.tsx         # Selección de Rol ("Quiero Donar" vs "Necesito Alimentos")
    │   │   ├── RegisterBodega.jsx        # Registro DNI/RUC con mitigación de permisos de cámara
    │   │   ├── BodegueroDashboard.jsx    # Botón gigante minimalista "Donar hoy"
    │   │   ├── NuevaDonacionForm.jsx     # Formulario flexible con <select>, <textarea> y tiempo
    │   │   ├── ComedorDashboard.jsx      # Radar PostGIS y tiempo a pie (ej. "Aprox. 5 min caminando")
    │   │   ├── QRDisplay.jsx             # Código QR con PIN gigante de 6 dígitos y botón Copiar
    │   │   ├── QRScanner.jsx             # Visor de cámara trasera con teclado alternativo para PIN
    │   │   └── Transparencia.jsx         # Pestañas: Historial Comedor e Impacto Mensual Bodega
    │   └── components/layout/
    │       ├── Navbar.jsx                # Barra superior con Buzón Recuperable de Notificaciones
    │       └── MobileShell.tsx           # Shell PWA mobile frame con status bar
```

---

## 🔄 2. Ciclo de Vida Global de Estados (useDonacionStore)

1. **`Donado`**: La bodega publica los excedentes con horario límite de recojo.
2. **`Reservado`**: El comedor aparta el lote; se generan atómicamente el PIN de 6 dígitos y el token QR.
3. **`Esperando Entrega`**: El comedor confirma su trayecto físico hacia el local.
4. **`Entregado`**: El bodeguero valida el PIN o escanea el QR en el endpoint transaccional `@Transactional`, sellando la fecha de cierre.

---

## 🚀 3. Instrucciones de Ejecución

### Frontend PWA:
```bash
cd frontend
npm install
npm run dev
```

### Backend Spring Boot:
```bash
cd backend-spring
mvn spring-boot:run
```
