import express, { Request, Response } from 'express';
import cors from 'cors';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ecofood-api', timestamp: new Date().toISOString() });
  });

  // Endpoints Core del MVP EcoFood:
  // 1. Bodega publica donación
  app.post('/api/donations', (req: Request, res: Response) => {
    const { title, category, quantityValue, unitMeasure, pickupHours } = req.body;
    res.status(201).json({
      success: true,
      message: 'Donación registrada exitosamente y comedores cercanos notificados',
      donationId: 'don-demo-123'
    });
  });

  // 2. Comedor busca donaciones cercanas (PostGIS ST_DWithin)
  app.get('/api/donations/nearby', (req: Request, res: Response) => {
    const { lat, lng, radius } = req.query;
    res.json({
      success: true,
      count: 2,
      donations: [
        {
          id: 'don-001',
          title: '40 panes ciabatta y plátanos de seda',
          distanceMeters: 720,
          donorBusinessName: 'Bodega Don Pepe'
        }
      ]
    });
  });

  // 3. Comedor reserva alimento y recibe PIN/QR
  app.post('/api/deliveries/reserve', (req: Request, res: Response) => {
    const { donationId } = req.body;
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    res.status(201).json({
      success: true,
      pickupPin: randomPin,
      qrHashToken: `ECO-${donationId}-${randomPin}`,
      message: 'Reserva generada. Muestre este código en la bodega.'
    });
  });

  // 4. Bodega valida PIN o escaneo QR para marcar "Entregado"
  app.post('/api/deliveries/verify', (req: Request, res: Response) => {
    const { code } = req.body;
    res.json({
      success: true,
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      message: '¡Entrega confirmada! Alimento rescatado con éxito.'
    });
  });

  return app;
};
